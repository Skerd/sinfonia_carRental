import {useEffect, useMemo, useRef, useState, type FormEvent} from "react";
import {compose} from "redux";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError, normalizeError} from "@coreModule/helpers/general/errors.ts";
import {generateUUID} from "@coreModule/helpers/general/uuid.ts";
import {useFieldErrors} from "@coreModule/helpers/publicAuth/useFieldErrors.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {rentalContactFormSchema} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.form.validators.ts";
import type {BookRentalFormType, QuoteRentalFormType} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.forms.ts";
import type {
    RentalBookingResponse,
    RentalQuote,
    RentalQuoteResponse,
} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import type {RentalPaymentChoice} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.constants.ts";
import {useRentalConfig, type RentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalCategoryFacts from "../shared/rentalCategoryFacts.tsx";
import RentalCategoryMedia from "../shared/rentalCategoryMedia.tsx";
import RentalPriceSummary from "../shared/rentalPriceSummary.tsx";
import {formatLocalDateTime, tripFromSearch, tripToSearch} from "../shared/rentalTripParams.ts";
import {RENT_CARD, RENT_HEADING, RENT_INPUT, RENT_LABEL, RENT_PRIMARY_BUTTON} from "../shared/rentalStyles.ts";
import RentalStripePayment from "./rentalStripePayment.tsx";

const CONTACT_KEYS = ["firstName", "lastName", "email", "phone"] as const;
type ContactKey = (typeof CONTACT_KEYS)[number];
type Contact = BookRentalFormType["contact"];

function defaultPaymentChoice(config: RentalConfig): RentalPaymentChoice {
    if (config.paymentPolicy === "pay_at_pickup") return "pay_at_pickup";
    if (config.paymentPolicy === "prepay_online") return "online";
    return config.onlinePaymentAvailable ? "online" : "pay_at_pickup";
}

function manageUrl(token: string, paid: boolean): string {
    return `/manage?${new URLSearchParams(paid ? {token, paid: "1"} : {token}).toString()}`;
}

function BookPage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const {categoryId = ""} = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const {config} = useRentalConfig();
    const trip = tripFromSearch(params);
    const tripKey = trip ? tripToSearch(trip) : "";
    const category = config?.categories.find((entry) => entry._id === categoryId);
    const pickupLocation = config?.locations.find((location) => location._id === trip?.pickupLocation);
    const returnLocation = config?.locations.find((location) => location._id === trip?.returnLocation);

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const extras = useMemo(
        () => Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([extra, quantity]) => ({extra, quantity})),
        [quantities],
    );
    const extrasKey = JSON.stringify(extras);
    const [quote, setQuote] = useState<RentalQuote | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [quoteVersion, setQuoteVersion] = useState(0);

    const [contact, setContact] = useState<Contact>({firstName: "", lastName: "", email: "", phone: ""});
    const {fieldErrors, clearFieldError, showIssues} = useFieldErrors<ContactKey>(CONTACT_KEYS);
    const [paymentChoice, setPaymentChoice] = useState<RentalPaymentChoice | null>(null);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    // One key per booking attempt: a retried request after a lost response returns the same reservation.
    const idempotencyKey = useRef(generateUUID());
    const [pendingPayment, setPendingPayment] = useState<{clientSecret: string; publishableKey: string; token: string} | null>(null);
    const publishableKey = pendingPayment?.publishableKey;
    const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);

    useEffect(() => {
        if (!trip || !category) return;
        const controller = new AbortController();
        setQuoteError(null);
        const body: QuoteRentalFormType = {...trip, category: category._id, extras};
        apiClient
            .post<RentalQuoteResponse>("/api/carRental/rentalStorefront/quote", body, {signal: controller.signal})
            .then((res) => setQuote(res.data.data))
            .catch((e) => {
                if (controller.signal.aborted) return;
                setQuote(null);
                setQuoteError(normalizeError(e).displayMessage ?? String(resolveLanguageKey("quoteFailed")));
            });
        return () => controller.abort();
        // The quote depends only on the trip, the category, the extras and explicit refreshes.
    }, [tripKey, category?._id, extrasKey, quoteVersion]);

    if (!config) return null;
    if (!trip || !category || !pickupLocation || !returnLocation) {
        return (
            <div className={`${RENT_CARD} flex flex-col items-start gap-3`}>
                <p>{resolveLanguageKey("missingTrip")}</p>
                <Link to="/" className={RENT_PRIMARY_BUTTON}>{resolveLanguageKey("startOver")}</Link>
            </div>
        );
    }

    const choice = paymentChoice ?? defaultPaymentChoice(config);
    const updateContact = (key: ContactKey, value: string) => {
        setContact((current) => ({...current, [key]: value}));
        clearFieldError(key);
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setFormError(null);
        const parsed = rentalContactFormSchema(languageCode).safeParse(contact);
        if (!parsed.success) {
            showIssues(parsed.error.issues);
            return;
        }
        if (!quote) return;
        if (!acceptTerms) {
            setFormError(String(resolveLanguageKey("acceptTermsRequired")));
            return;
        }

        const body: BookRentalFormType = {
            ...trip,
            category: category._id,
            extras,
            contact,
            paymentChoice: choice,
            acceptTerms,
            expectedTotal: quote.grandTotal,
            idempotencyKey: idempotencyKey.current,
        };
        setSubmitting(true);
        try {
            const {data} = (await apiClient.post<RentalBookingResponse>("/api/carRental/rentalStorefront/book", body)).data;
            if (data.payment) {
                setPendingPayment({...data.payment, token: data.manageToken});
            } else {
                navigate(manageUrl(data.manageToken, false));
            }
        } catch (e) {
            const error = handleError(e, {context: "RentalBook"});
            if (!error) return;
            // A rejected request created nothing, so the next attempt is a new booking.
            if (error.status && error.status < 500) idempotencyKey.current = generateUUID();
            if (error.code === "rental_price_changed") setQuoteVersion((v) => v + 1);
            setFormError(error.displayMessage ?? String(resolveLanguageKey("bookingFailed")));
        } finally {
            setSubmitting(false);
        }
    };

    const summary = (
        <aside className={`${RENT_CARD} flex flex-col gap-4 lg:sticky lg:top-6`}>
            <div>
                <h2 className={`${RENT_HEADING} text-lg`}>{category.name}</h2>
                <p className="text-sm text-rent-ink-faded">{resolveLanguageKey("orSimilar")}</p>
            </div>
            <dl className="grid gap-3 text-sm">
                <div>
                    <dt className="font-medium">{resolveLanguageKey("pickup")}</dt>
                    <dd className="text-rent-ink-muted">{pickupLocation.name} · {formatLocalDateTime(trip.pickupDate, trip.pickupTime, languageCode)}</dd>
                </div>
                <div>
                    <dt className="font-medium">{resolveLanguageKey("return")}</dt>
                    <dd className="text-rent-ink-muted">{returnLocation.name} · {formatLocalDateTime(trip.returnDate, trip.returnTime, languageCode)}</dd>
                </div>
            </dl>
            {quote ? <RentalPriceSummary pricing={quote} /> : quoteError ? null : <Loader />}
            {config.freeCancellationHours > 0 ? (
                <p className="text-sm text-rent-ink-muted">
                    {String(resolveLanguageKey("freeCancellation")).replace("{hours}", String(config.freeCancellationHours))}
                </p>
            ) : null}
        </aside>
    );

    if (pendingPayment && stripePromise) {
        return (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className={`${RENT_CARD} flex flex-col gap-4`}>
                    <h1 className={`${RENT_HEADING} text-2xl`}>{resolveLanguageKey("payTitle")}</h1>
                    <p className="text-sm text-rent-ink-muted">{resolveLanguageKey("payHint")}</p>
                    <Elements stripe={stripePromise} options={{clientSecret: pendingPayment.clientSecret}}>
                        <RentalStripePayment
                            clientSecret={pendingPayment.clientSecret}
                            returnPath={manageUrl(pendingPayment.token, true)}
                            onPaid={() => navigate(manageUrl(pendingPayment.token, true))}
                        />
                    </Elements>
                </section>
                {summary}
            </div>
        );
    }

    const onlineAllowed = config.onlinePaymentAvailable && config.paymentPolicy !== "pay_at_pickup";
    const atPickupAllowed = config.paymentPolicy !== "prepay_online";

    return (
        <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-6">
                <section className={`${RENT_CARD} flex flex-col gap-2`}>
                    <RentalCategoryMedia category={category} coverClassName="mb-2 aspect-[16/9] w-full rounded-xl" />
                    <h1 className={`${RENT_HEADING} text-2xl`}>{category.name}</h1>
                    <RentalCategoryFacts category={category} />
                    <Link to={`/search?${tripKey}`} className="text-sm font-medium text-rent-accent hover:underline">{resolveLanguageKey("changeSearch")}</Link>
                </section>

                {config.extras.length ? (
                    <section className={`${RENT_CARD} flex flex-col gap-4`}>
                        <h2 className={`${RENT_HEADING} text-lg`}>{resolveLanguageKey("extrasTitle")}</h2>
                        <ul className="flex flex-col gap-3">
                            {config.extras.map((extra) => (
                                <li key={extra._id} className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium">{extra.name}</p>
                                        {extra.description ? <p className="text-sm text-rent-ink-muted">{extra.description}</p> : null}
                                    </div>
                                    <select
                                        aria-label={extra.name}
                                        className={`${RENT_INPUT} w-20`}
                                        value={quantities[extra._id] ?? 0}
                                        onChange={(e) => setQuantities((current) => ({...current, [extra._id]: Number(e.target.value)}))}
                                    >
                                        {Array.from({length: extra.maxQuantity + 1}, (_, quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
                                    </select>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                <section className={`${RENT_CARD} grid gap-4 sm:grid-cols-2`}>
                    <h2 className={`${RENT_HEADING} text-lg sm:col-span-2`}>{resolveLanguageKey("driverTitle")}</h2>
                    {CONTACT_KEYS.map((key) => (
                        <label key={key} className="flex flex-col gap-1.5">
                            <span className={RENT_LABEL}>{resolveLanguageKey(`contact.${key}`)}</span>
                            <input
                                className={RENT_INPUT}
                                type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                                autoComplete={key === "firstName" ? "given-name" : key === "lastName" ? "family-name" : key === "email" ? "email" : "tel"}
                                value={contact[key]}
                                onChange={(e) => updateContact(key, e.target.value)}
                                aria-invalid={!!fieldErrors[key] || undefined}
                            />
                            {fieldErrors[key] ? <span className="text-sm text-rent-danger">{fieldErrors[key]}</span> : null}
                        </label>
                    ))}
                    {category.minDriverAge ? (
                        <p className="text-sm text-rent-ink-muted sm:col-span-2">
                            {String(resolveLanguageKey("minDriverAge")).replace("{age}", String(category.minDriverAge))}
                        </p>
                    ) : null}
                </section>

                <section className={`${RENT_CARD} flex flex-col gap-3`}>
                    <h2 className={`${RENT_HEADING} text-lg`}>{resolveLanguageKey("paymentTitle")}</h2>
                    {atPickupAllowed ? (
                        <label className="flex items-start gap-3">
                            <input type="radio" name="paymentChoice" checked={choice === "pay_at_pickup"} onChange={() => setPaymentChoice("pay_at_pickup")} disabled={!onlineAllowed} />
                            <span>
                                <span className="font-medium">{resolveLanguageKey("payAtPickup")}</span>
                                <span className="block text-sm text-rent-ink-muted">{resolveLanguageKey("payAtPickupHint")}</span>
                            </span>
                        </label>
                    ) : null}
                    {config.paymentPolicy !== "pay_at_pickup" ? (
                        <label className="flex items-start gap-3">
                            <input type="radio" name="paymentChoice" checked={choice === "online"} onChange={() => setPaymentChoice("online")} disabled={!onlineAllowed} />
                            <span>
                                <span className="font-medium">{resolveLanguageKey("payOnline")}</span>
                                <span className="block text-sm text-rent-ink-muted">
                                    {resolveLanguageKey(config.onlinePaymentAvailable ? "payOnlineHint" : "payOnlineUnavailable")}
                                </span>
                            </span>
                        </label>
                    ) : null}
                </section>

                <section className={`${RENT_CARD} flex flex-col gap-4`}>
                    <label className="flex items-start gap-3 text-sm">
                        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                        <span>
                            {resolveLanguageKey("acceptTerms")}{" "}
                            {config.termsText ? <Link to="/terms" target="_blank" className="font-medium text-rent-accent hover:underline">{resolveLanguageKey("readTerms")}</Link> : null}
                        </span>
                    </label>
                    {formError || quoteError ? <p className="text-sm text-rent-danger" role="alert">{formError ?? quoteError}</p> : null}
                    <button type="submit" className={`${RENT_PRIMARY_BUTTON} w-full sm:w-auto`} disabled={submitting || !quote}>
                        {resolveLanguageKey(submitting ? "booking" : choice === "online" ? "continueToPayment" : "confirmBooking")}
                    </button>
                </section>
            </div>
            {summary}
        </form>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/book/index.tsx"))(BookPage);
