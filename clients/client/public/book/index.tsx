import dayjs from "dayjs";
import {useEffect, useMemo, useRef, useState, type FormEvent} from "react";
import {compose} from "redux";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {
    handleError,
    normalizeError,
} from "@coreModule/helpers/general/errors.ts";
import {generateUUID} from "@coreModule/helpers/general/uuid.ts";
import {useFieldErrors} from "@coreModule/helpers/publicAuth/useFieldErrors.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {rentalContactFormSchema} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.form.validators.ts";
import type {
    BookRentalFormType,
    QuoteRentalFormType,
} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.forms.ts";
import type {
    RentalBookingResponse,
    RentalQuote,
    RentalQuoteResponse,
} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import type {RentalPaymentChoice} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.constants.ts";
import {
    useRentalConfig,
    type RentalConfig,
} from "../shared/rentalConfigContext.tsx";
import RentalCategoryFacts from "../shared/rentalCategoryFacts.tsx";
import RentalCategoryMedia from "../shared/rentalCategoryMedia.tsx";
import RentalPriceSummary from "../shared/rentalPriceSummary.tsx";
import {
    formatLocalDateTime,
    tripFromSearch,
    tripToSearch,
} from "../shared/rentalTripParams.ts";
import RentalStripePayment from "./rentalStripePayment.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {NativeSelect} from "@coreModule/components/ui/native-select.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {RadioGroup, RadioGroupItem} from "@coreModule/components/ui/radio-group.tsx";

const QUOTE_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalStorefront/quote"};
const BOOK_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalStorefront/book"};
const CONTACT_KEYS = ["firstName", "lastName", "email", "phone"] as const;
/** RadioGroup value for "no extra protection" (protection ids are ObjectIds, so it never collides). */
const BASIC_PROTECTION = "basic";
type ContactKey = (typeof CONTACT_KEYS)[number];
type Contact = BookRentalFormType["contact"];

function defaultPaymentChoice(config: RentalConfig): RentalPaymentChoice {
    if (config.paymentPolicy === "pay_at_pickup") return "pay_at_pickup";
    if (config.paymentPolicy === "prepay_online") return "online";
    return config.onlinePaymentAvailable ? "online" : "pay_at_pickup";
}

function manageUrl(base: string, token: string, paid: boolean): string {
    return `${base}/manage?${new URLSearchParams(paid ? {token, paid: "1"} : {token}).toString()}`;
}

function BookPage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const base = useSectionBase();
    // A class opens by its web address (slug); links made with its id still open it.
    const {categoryId = ""} = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const {config, formatMoney} = useRentalConfig();
    const trip = tripFromSearch(params);
    const tripKey = trip ? tripToSearch(trip) : "";
    const category = config?.categories.find(
        (entry) => entry.slug === categoryId || entry._id === categoryId,
    );
    const pickupLocation = config?.locations.find(
        (location) => location._id === trip?.pickupLocation,
    );
    const returnLocation = config?.locations.find(
        (location) => location._id === trip?.returnLocation,
    );

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    // At most one protection package; none means the basic cover included in the price.
    const [protectionId, setProtectionId] = useState("");
    const extras = useMemo(
        () => [
            ...Object.entries(quantities)
                .filter(([, quantity]) => quantity > 0)
                .map(([extra, quantity]) => ({extra, quantity})),
            ...(protectionId ? [{extra: protectionId, quantity: 1}] : []),
        ],
        [quantities, protectionId],
    );
    const extrasKey = JSON.stringify(extras);
    const [quote, setQuote] = useState<RentalQuote | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [quoteVersion, setQuoteVersion] = useState(0);
    const [birthDate, setBirthDate] = useState("");
    const [birthDateError, setBirthDateError] = useState<string | null>(null);
    const [promoInput, setPromoInput] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [promoError, setPromoError] = useState<string | null>(null);

    const [contact, setContact] = useState<Contact>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });
    const {fieldErrors, clearFieldError, showIssues} =
        useFieldErrors<ContactKey>(CONTACT_KEYS);
    const [paymentChoice, setPaymentChoice] =
        useState<RentalPaymentChoice | null>(null);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [crossBorder, setCrossBorder] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    // One key per booking attempt: a retried request after a lost response returns the same reservation.
    const idempotencyKey = useRef(generateUUID());
    const [pendingPayment, setPendingPayment] = useState<{
        clientSecret: string;
        publishableKey: string;
        token: string;
    } | null>(null);
    const publishableKey = pendingPayment?.publishableKey;
    const stripePromise = useMemo(
        () => (publishableKey ? loadStripe(publishableKey) : null),
        [publishableKey],
    );

    const [quoteCount, setQuoteCount] = useState(0);
    useEffect(() => {
        if (!trip || !category) return;
        setQuoteCount((count) => count + 1);
        // The quote depends only on the trip, the category, the extras, the driver's age, the promo code and explicit refreshes.
    }, [
        tripKey,
        category?._id,
        extrasKey,
        birthDate,
        promoCode,
        quoteVersion,
        crossBorder,
    ]);
    const quoteBody: QuoteRentalFormType | Record<string, never> = trip && category ? {
        ...trip,
        category: category._id,
        extras,
        ...(birthDate ? {driverBirthDate: birthDate} : {}),
        ...(promoCode ? {promoCode} : {}),
        ...(crossBorder ? {crossBorder: true} : {}),
    } : {};
    useHttpRequest<RentalQuoteResponse>(QUOTE_REQUEST, quoteBody, quoteCount, true, {
        start: () => setQuoteError(null),
        success: (response) => setQuote(response.data),
        error: (e) => {
            const error = normalizeError(e);
            // A code that doesn't apply is dropped, and the trip is priced without it.
            if (promoCode && error.code?.startsWith("rental_promo_code")) {
                setPromoError(
                    error.displayMessage ??
                        String(resolveLanguageKey("promoInvalid")),
                );
                setPromoCode("");
                return;
            }
            // The birth date is checked against the minimum age at booking, not while pricing.
            if (error.code === "rental_driver_too_young") {
                setBirthDateError(error.displayMessage ?? null);
                return;
            }
            setQuote(null);
            setQuoteError(
                error.displayMessage ??
                    String(resolveLanguageKey("quoteFailed")),
            );
        },
    });

    const [booking, setBooking] = useState<{body: BookRentalFormType | Record<string, never>; count: number}>({body: {}, count: 0});
    const {loading: submitting} = useHttpRequest<RentalBookingResponse>(BOOK_REQUEST, booking.body, booking.count, true, {
        success: ({data}) => {
            if (data.payment) {
                setPendingPayment({...data.payment, token: data.manageToken});
            } else {
                navigate(manageUrl(base, data.manageToken, false));
            }
        },
        error: (e) => {
            const error = handleError(e, {context: "RentalBook"});
            if (!error) return;
            // A rejected request created nothing, so the next attempt is a new booking.
            if (error.status && error.status < 500)
                idempotencyKey.current = generateUUID();
            if (error.code === "rental_price_changed")
                setQuoteVersion((v) => v + 1);
            if (error.code === "rental_driver_too_young")
                setBirthDateError(error.displayMessage ?? null);
            setFormError(
                error.displayMessage ??
                    String(resolveLanguageKey("bookingFailed")),
            );
        },
    });

    if (!config) return null;
    if (!trip || !category || !pickupLocation || !returnLocation) {
        return (
            <div className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col items-start gap-3">
                <p>{resolveLanguageKey("missingTrip")}</p>
                <Button asChild size="lg">
                    <Link to={base}>{resolveLanguageKey("startOver")}</Link>
                </Button>
            </div>
        );
    }

    const choice = paymentChoice ?? defaultPaymentChoice(config);
    const updateContact = (key: ContactKey, value: string) => {
        setContact((current) => ({...current, [key]: value}));
        clearFieldError(key);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setFormError(null);
        const parsed = rentalContactFormSchema(languageCode).safeParse(contact);
        if (!birthDate)
            setBirthDateError(String(resolveLanguageKey("birthDateRequired")));
        if (!parsed.success) {
            showIssues(parsed.error.issues);
            return;
        }
        if (!birthDate) return;
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
            driverBirthDate: birthDate,
            ...(promoCode ? {promoCode} : {}),
            paymentChoice: choice,
            ...(crossBorder ? {crossBorder: true} : {}),
            acceptTerms,
            expectedTotal: quote.grandTotal,
            idempotencyKey: idempotencyKey.current,
        };
        setBooking((current) => ({body, count: current.count + 1}));
    };

    const summary = (
        <aside className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4 lg:sticky lg:top-6">
            <div>
                <h2 className="font-display font-bold tracking-tight text-lg">
                    {category.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {resolveLanguageKey("orSimilar")}
                </p>
            </div>
            <dl className="grid gap-3 text-sm">
                <div>
                    <dt className="font-medium">
                        {resolveLanguageKey("pickup")}
                    </dt>
                    <dd className="text-muted-foreground">
                        {pickupLocation.name} ·{" "}
                        {formatLocalDateTime(trip.pickupDate, trip.pickupTime)}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium">
                        {resolveLanguageKey("return")}
                    </dt>
                    <dd className="text-muted-foreground">
                        {returnLocation.name} ·{" "}
                        {formatLocalDateTime(trip.returnDate, trip.returnTime)}
                    </dd>
                </div>
            </dl>
            {quote ? (
                <RentalPriceSummary pricing={quote} />
            ) : quoteError ? null : (
                <Loader />
            )}
            {pendingPayment ? null : (
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="rental-promo"
                        className="text-sm font-medium"
                    >
                        {resolveLanguageKey("promoLabel")}
                    </label>
                    <div className="flex gap-2">
                        <Input
                            id="rental-promo"
                            value={promoInput}
                            onChange={(e) => {
                                setPromoInput(e.target.value);
                                setPromoError(null);
                            }}
                            aria-invalid={!!promoError || undefined}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                !promoInput.trim() ||
                                promoInput.trim().toUpperCase() === promoCode
                            }
                            onClick={() => {
                                setPromoError(null);
                                setPromoCode(promoInput.trim().toUpperCase());
                            }}
                        >
                            {resolveLanguageKey("promoApply")}
                        </Button>
                    </div>
                    {promoError ? (
                        <span className="text-sm text-destructive">
                            {promoError}
                        </span>
                    ) : null}
                </div>
            )}
            {config.freeCancellationHours > 0 ? (
                <p className="text-sm text-muted-foreground">
                    {String(resolveLanguageKey("freeCancellation")).replace(
                        "{hours}",
                        String(config.freeCancellationHours),
                    )}
                </p>
            ) : null}
        </aside>
    );

    if (pendingPayment && stripePromise) {
        return (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                    <h1 className="font-display font-bold tracking-tight text-3xl sm:text-4xl">
                        {resolveLanguageKey("payTitle")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {resolveLanguageKey("payHint")}
                    </p>
                    <Elements
                        stripe={stripePromise}
                        options={{clientSecret: pendingPayment.clientSecret}}
                    >
                        <RentalStripePayment
                            clientSecret={pendingPayment.clientSecret}
                            returnPath={manageUrl(
                                base,
                                pendingPayment.token,
                                true,
                            )}
                            onPaid={() =>
                                navigate(
                                    manageUrl(base, pendingPayment.token, true),
                                )
                            }
                        />
                    </Elements>
                </section>
                {summary}
            </div>
        );
    }

    const onlineAllowed =
        config.onlinePaymentAvailable &&
        config.paymentPolicy !== "pay_at_pickup";
    const protections = config.extras.filter(
        (extra) => extra.kind === "protection",
    );
    const regularExtras = config.extras.filter(
        (extra) => extra.kind !== "protection",
    );
    const atPickupAllowed = config.paymentPolicy !== "prepay_online";

    return (
        <form
            onSubmit={submit}
            noValidate
            className="grid gap-6 lg:grid-cols-[1fr_360px]"
        >
            <div className="flex flex-col gap-6">
                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-2">
                    <RentalCategoryMedia
                        category={category}
                        coverClassName="mb-2 aspect-[16/10] w-full rounded-2xl"
                    />
                    <h1 className="font-display font-bold tracking-tight text-3xl sm:text-4xl">
                        {category.name}
                    </h1>
                    <RentalCategoryFacts category={category} />
                    <Button
                        asChild
                        variant="link"
                        className="h-auto p-0 text-sm"
                    >
                        <Link
                            to={`${base}/categories/${category.slug || category._id}?${tripKey}`}
                        >
                            {resolveLanguageKey("changeSearch")}
                        </Link>
                    </Button>
                </section>

                {protections.length ? (
                    <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                        <h2 className="font-display font-bold tracking-tight text-lg">
                            {resolveLanguageKey("protectionTitle")}
                        </h2>
                        <RadioGroup
                            value={protectionId || BASIC_PROTECTION}
                            onValueChange={(value) => setProtectionId(value === BASIC_PROTECTION ? "" : value)}
                            className="contents"
                        >
                            <label className="flex items-start gap-3">
                                <RadioGroupItem value={BASIC_PROTECTION} className="mt-1" />
                                <span>
                                    <span className="font-medium">
                                        {resolveLanguageKey("protectionBasic")}
                                    </span>
                                    <span className="block text-sm text-muted-foreground">
                                        {resolveLanguageKey("protectionBasicHint")}
                                    </span>
                                </span>
                            </label>
                            {protections.map((protection) => (
                                <label
                                    key={protection._id}
                                    className="flex items-start gap-3"
                                >
                                    <RadioGroupItem value={protection._id} className="mt-1" />
                                    <span>
                                        <span className="font-medium">
                                            {protection.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {" · "}
                                            {formatMoney(protection.price)}
                                            {protection.pricing === "per_day"
                                                ? ` ${resolveLanguageKey("perDay")}`
                                                : ""}
                                        </span>
                                        {protection.excessAmount !== undefined ? (
                                            <span className="block text-sm text-muted-foreground">
                                                {String(
                                                    resolveLanguageKey(
                                                        "protectionExcess",
                                                    ),
                                                ).replace(
                                                    "{amount}",
                                                    formatMoney(
                                                        protection.excessAmount,
                                                    ),
                                                )}
                                            </span>
                                        ) : null}
                                        {protection.description ? (
                                            <span className="block text-sm text-muted-foreground">
                                                {protection.description}
                                            </span>
                                        ) : null}
                                    </span>
                                </label>
                            ))}
                        </RadioGroup>
                    </section>
                ) : null}

                {regularExtras.length ? (
                    <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                        <h2 className="font-display font-bold tracking-tight text-lg">
                            {resolveLanguageKey("extrasTitle")}
                        </h2>
                        <ul className="flex flex-col gap-3">
                            {regularExtras.map((extra) => (
                                <li
                                    key={extra._id}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {extra.name}
                                        </p>
                                        {extra.description ? (
                                            <p className="text-sm text-muted-foreground">
                                                {extra.description}
                                            </p>
                                        ) : null}
                                    </div>
                                    <NativeSelect
                                        aria-label={extra.name}
                                        className="w-full w-20"
                                        value={quantities[extra._id] ?? 0}
                                        onChange={(e) =>
                                            setQuantities((current) => ({
                                                ...current,
                                                [extra._id]: Number(
                                                    e.target.value,
                                                ),
                                            }))
                                        }
                                    >
                                        {Array.from(
                                            {length: extra.maxQuantity + 1},
                                            (_, quantity) => (
                                                <option
                                                    key={quantity}
                                                    value={quantity}
                                                >
                                                    {quantity}
                                                </option>
                                            ),
                                        )}
                                    </NativeSelect>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                <section className="rounded-2xl bg-muted p-5 sm:p-6 grid gap-4 sm:grid-cols-2">
                    <h2 className="font-display font-bold tracking-tight text-lg sm:col-span-2">
                        {resolveLanguageKey("driverTitle")}
                    </h2>
                    {CONTACT_KEYS.map((key) => (
                        <label key={key} className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium">
                                {resolveLanguageKey(`contact.${key}`)}
                            </span>
                            <Input
                                type={
                                    key === "email"
                                        ? "email"
                                        : key === "phone"
                                          ? "tel"
                                          : "text"
                                }
                                autoComplete={
                                    key === "firstName"
                                        ? "given-name"
                                        : key === "lastName"
                                          ? "family-name"
                                          : key === "email"
                                            ? "email"
                                            : "tel"
                                }
                                value={contact[key]}
                                onChange={(e) =>
                                    updateContact(key, e.target.value)
                                }
                                aria-invalid={!!fieldErrors[key] || undefined}
                            />
                            {fieldErrors[key] ? (
                                <span className="text-sm text-destructive">
                                    {fieldErrors[key]}
                                </span>
                            ) : null}
                        </label>
                    ))}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">
                            {resolveLanguageKey("birthDate")}
                        </span>
                        <DateInput
                            valueFormat="YYYY-MM-DD"
                            value={birthDate}
                            // An upper bound only (no birthday in the future); the server checks the driver's age.
                            maxDate={dayjs().format("YYYY-MM-DD")}
                            onChange={(value) => {
                                setBirthDate(value);
                                setBirthDateError(null);
                            }}
                        />
                        {birthDateError ? (
                            <span className="text-sm text-destructive">
                                {birthDateError}
                            </span>
                        ) : null}
                    </label>
                    {category.crossBorderAllowed ? (
                        <label className="flex items-start gap-3 sm:col-span-2">
                            <Checkbox
                                className="mt-1"
                                checked={crossBorder}
                                onCheckedChange={(checked) => setCrossBorder(checked === true)}
                            />
                            <span>
                                <span className="font-medium">
                                    {resolveLanguageKey("crossBorder")}
                                </span>
                                {category.crossBorderFee ? (
                                    <span className="block text-sm text-muted-foreground">
                                        {formatMoney(category.crossBorderFee)}
                                    </span>
                                ) : null}
                            </span>
                        </label>
                    ) : null}
                    {category.minDriverAge ? (
                        <p className="text-sm text-muted-foreground sm:col-span-2">
                            {String(resolveLanguageKey("minDriverAge")).replace(
                                "{age}",
                                String(category.minDriverAge),
                            )}
                        </p>
                    ) : null}
                </section>

                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                    <h2 className="font-display font-bold tracking-tight text-lg">
                        {resolveLanguageKey("paymentTitle")}
                    </h2>
                    <RadioGroup
                        value={choice}
                        onValueChange={(value) => setPaymentChoice(value === "online" ? "online" : "pay_at_pickup")}
                        className="contents"
                    >
                        {atPickupAllowed ? (
                            <label className="flex items-start gap-3">
                                <RadioGroupItem value="pay_at_pickup" className="mt-1" disabled={!onlineAllowed} />
                                <span>
                                    <span className="font-medium">
                                        {resolveLanguageKey("payAtPickup")}
                                    </span>
                                    <span className="block text-sm text-muted-foreground">
                                        {resolveLanguageKey("payAtPickupHint")}
                                    </span>
                                </span>
                            </label>
                        ) : null}
                        {config.paymentPolicy !== "pay_at_pickup" ? (
                            <label className="flex items-start gap-3">
                                <RadioGroupItem value="online" className="mt-1" disabled={!onlineAllowed} />
                                <span>
                                    <span className="font-medium">
                                        {resolveLanguageKey("payOnline")}
                                    </span>
                                    <span className="block text-sm text-muted-foreground">
                                        {resolveLanguageKey(
                                            config.onlinePaymentAvailable
                                                ? "payOnlineHint"
                                                : "payOnlineUnavailable",
                                        )}
                                    </span>
                                </span>
                            </label>
                        ) : null}
                    </RadioGroup>
                </section>

                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                    <label className="flex items-start gap-3 text-sm">
                        <Checkbox
                            className="mt-0.5"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                        />
                        <span>
                            {resolveLanguageKey("acceptTerms")}{" "}
                            {config.termsText ? (
                                <Button
                                    asChild
                                    variant="link"
                                    className="h-auto p-0"
                                >
                                    <Link to={`${base}/terms`} target="_blank">
                                        {resolveLanguageKey("readTerms")}
                                    </Link>
                                </Button>
                            ) : null}
                        </span>
                    </label>
                    {formError || quoteError ? (
                        <p className="text-sm text-destructive" role="alert">
                            {formError ?? quoteError}
                        </p>
                    ) : null}
                    <Button
                        size="lg"
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={submitting || !quote}
                    >
                        {resolveLanguageKey(
                            submitting
                                ? "booking"
                                : choice === "online"
                                  ? "continueToPayment"
                                  : "confirmBooking",
                        )}
                    </Button>
                </section>
            </div>
            {summary}
        </form>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/client/public/book/index.tsx"),
)(BookPage);
