import {useEffect, useId, useMemo, useState} from "react";
import {IconStarFilled} from "@tabler/icons-react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {usePortalTitle} from "@coreModule/clients/portal/shared/portalTitle.ts";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest, type RequestPayload} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {downloadFromApi} from "@coreModule/helpers/media/downloadFromApi.ts";
import {
    handleError,
    normalizeError,
} from "@coreModule/helpers/general/errors.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import type {
    PublicRentalReservation,
    PublicRentalReservationResponse,
} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalPriceSummary from "../shared/rentalPriceSummary.tsx";
import {formatAtLocation} from "../shared/rentalTripParams.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {ToggleGroup, ToggleGroupItem} from "@coreModule/components/ui/toggle-group.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {RENTAL_REVIEW_COMMENT_MAX} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.schema-def.ts";
import type {PublicRentalChangeResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import MultiLocalFilePicker from "@coreModule/components/viewEngine/widgets/media/multiLocalFilePicker.tsx";
import RentalStripePayment from "../book/rentalStripePayment.tsx";

const RATINGS = ["1", "2", "3", "4", "5"] as const;

/** The server takes at most this many licence files per upload (`documentUpload`). */
const MAX_DOCUMENTS = 4;
const DOCUMENT_TYPES = "image/jpeg,image/png,image/webp,application/pdf";
/** After paying, the webhook confirms the booking; check again for this long before giving up. */
const PAYMENT_POLL_MS = 2500;
const MANAGE_URL = "/api/carRental/rentalStorefront/manage";
const MANAGE_REQUEST: HttpRequest = {method: "POST", url: MANAGE_URL};
const CANCEL_REQUEST: HttpRequest = {method: "POST", url: `${MANAGE_URL}/cancel`};
/** The guest's changes (driver, documents, extend, extras, pay, review): the path is set per action. */
const MANAGE_ACTION_REQUEST: HttpRequest = {method: "POST", url: MANAGE_URL};

/** What a manage action does with its answer: most show the updated booking, `pay` only opens the card form. */
type ManageAction = "update" | "pay" | "review";
const PAYMENT_POLL_ATTEMPTS = 24;

const STATUS_TONE: Record<PublicRentalReservation["status"], string> = {
    held: "bg-warning/10 text-warning",
    confirmed: "bg-success/10 text-success",
    in_progress: "bg-primary/10 text-primary",
    completed: "bg-muted text-foreground",
    cancelled: "bg-destructive/10 text-destructive",
    expired: "bg-destructive/10 text-destructive",
    no_show: "bg-destructive/10 text-destructive",
};

function ManagePage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const [params] = useSearchParams();
    const token = params.get("token") ?? "";
    const justPaid = params.get("paid") === "1";
    const {formatMoney, config} = useRentalConfig();
    const [reservation, setReservation] =
        useState<PublicRentalReservation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [confirmingCancel, setConfirmingCancel] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState("10:00");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [documents, setDocuments] = useState<File[]>([]);
    const [rating, setRating] = useState("5");
    const commentId = useId();
    const [comment, setComment] = useState("");
    const [reviewSaved, setReviewSaved] = useState(false);
    const [payment, setPayment] = useState<{
        clientSecret: string;
        publishableKey: string;
    } | null>(null);
    const stripePromise = useMemo(
        () => (payment ? loadStripe(payment.publishableKey) : null),
        [payment],
    );

    const reload = () => setAttempt((n) => n + 1);
    const [action, setAction] = useState<{kind: ManageAction; path: string; body: RequestPayload; count: number}>(
        {kind: "update", path: "", body: {}, count: 0},
    );
    const actionRequest = useHttpRequest<PublicRentalChangeResponse>(MANAGE_ACTION_REQUEST, action.body, action.count, true, {
        success: (response) => {
            if (action.kind === "review") {
                setReviewSaved(true);
                return;
            }
            if (action.kind === "update") setReservation(response.data);
            if (action.path.startsWith("documents")) setDocuments([]);
            if (response.payment?.clientSecret) setPayment(response.payment);
        },
        error: (e) => handleError(e, {context: "RentalManage", showToast: true}),
    }, {url: `${MANAGE_URL}/${action.path}`});
    const run = (kind: ManageAction, path: string, body: RequestPayload) =>
        setAction((current) => ({kind, path, body, count: current.count + 1}));
    const busy = actionRequest.loading;
    const download = (path: string, body: Record<string, unknown>, fileName: string) =>
        downloadFromApi({method: "post", url: `${MANAGE_URL}/${path}`, data: body, fileName});

    const [loadCount, setLoadCount] = useState(0);
    useEffect(() => {
        if (token && !cancelled) setLoadCount((count) => count + 1);
    }, [token, attempt, cancelled]);
    useHttpRequest<PublicRentalReservationResponse>(MANAGE_REQUEST, {token}, loadCount, true, {
        success: (response) => setReservation(response.data),
        error: (e) => setError(normalizeError(e).displayMessage ?? String(resolveLanguageKey("loadFailed"))),
    });

    const waitingForPayment =
        justPaid &&
        reservation?.status === "held" &&
        attempt < PAYMENT_POLL_ATTEMPTS;
    useEffect(() => {
        if (!waitingForPayment) return;
        const timer = window.setTimeout(
            () => setAttempt((n) => n + 1),
            PAYMENT_POLL_MS,
        );
        return () => window.clearTimeout(timer);
    }, [waitingForPayment, attempt]);

    const [cancelCount, setCancelCount] = useState(0);
    const {loading: cancelling} = useHttpRequest<PublicRentalReservationResponse>(CANCEL_REQUEST, {token}, cancelCount, true, {
        success: (response) => {
            // The link stops working once the booking is cancelled; keep showing what came back.
            setCancelled(true);
            setReservation(response.data);
            setConfirmingCancel(false);
        },
        error: (e) => handleError(e, {
            context: "RentalManageCancel",
            showToast: true,
            fallbackMessage: String(resolveLanguageKey("cancelFailed")),
        }),
    });
    const cancel = () => setCancelCount((count) => count + 1);
    usePortalTitle(
        !token || error ? resolveLanguageKey("linkInvalidTitle")
            : !reservation ? undefined
                : payment && stripePromise ? resolveLanguageKey("payTitle")
                    : `${resolveLanguageKey("bookingNumber")} ${reservation.number}`,
    );

    if (!token || error) {
        return (
            <div
                className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col items-start gap-3"
                role="alert"
            >
                <h1 className="font-display font-bold tracking-tight text-xl">
                    {resolveLanguageKey("linkInvalidTitle")}
                </h1>
                <p className="text-muted-foreground">
                    {error ?? resolveLanguageKey("linkInvalidText")}
                </p>
                <Button asChild size="lg">
                    <Link to={base}>{resolveLanguageKey("backHome")}</Link>
                </Button>
            </div>
        );
    }
    if (!reservation) return <Loader />;
    if (payment && stripePromise) {
        return (
            <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                <h1 className="font-display font-bold tracking-tight text-3xl">
                    {resolveLanguageKey("payTitle")}
                </h1>
                <Elements
                    stripe={stripePromise}
                    options={{clientSecret: payment.clientSecret}}
                >
                    <RentalStripePayment
                        clientSecret={payment.clientSecret}
                        returnPath={`${base}/manage?token=${encodeURIComponent(token)}&paid=1`}
                        onPaid={() => {
                            setPayment(null);
                            reload();
                        }}
                    />
                </Elements>
            </section>
        );
    }

    const at = (iso: string) => formatAtLocation(iso, reservation.timezone);
    const feeApplies =
        reservation.cancellationFeePercent > 0 &&
        new Date(reservation.freeCancellationUntil) <= new Date();

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-6">
                {justPaid &&
                reservation.status === "confirmed" &&
                !cancelled ? (
                    <div
                        className="rounded-2xl bg-success/10 p-4 text-success"
                        role="status"
                    >
                        {resolveLanguageKey("paidConfirmed")}
                    </div>
                ) : null}
                {reservation.status === "held" ? (
                    <div
                        className="rounded-2xl bg-warning/10 p-4 text-warning"
                        role="status"
                        aria-live="polite"
                    >
                        {resolveLanguageKey(
                            waitingForPayment
                                ? "awaitingPayment"
                                : "heldNotice",
                        )}
                    </div>
                ) : null}

                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {resolveLanguageKey("bookingNumber")}{" "}
                                {reservation.number}
                            </p>
                            <h1 className="font-display font-bold tracking-tight text-3xl">
                                {reservation.vehicleLabel ??
                                    reservation.categoryName}
                            </h1>
                        </div>
                        <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[reservation.status]}`}
                        >
                            {resolveLanguageKey(`status.${reservation.status}`)}
                        </span>
                    </div>
                    <dl className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="font-medium">
                                {resolveLanguageKey("pickup")}
                            </dt>
                            <dd className="text-muted-foreground">
                                {at(reservation.pickupAt)}
                            </dd>
                            <dd className="text-muted-foreground">
                                {reservation.pickupLocationName}
                            </dd>
                            {reservation.pickupAddress ? (
                                <dd className="text-muted-foreground">
                                    {reservation.pickupAddress}
                                </dd>
                            ) : null}
                        </div>
                        <div>
                            <dt className="font-medium">
                                {resolveLanguageKey("return")}
                            </dt>
                            <dd className="text-muted-foreground">
                                {at(reservation.returnAt)}
                            </dd>
                            <dd className="text-muted-foreground">
                                {reservation.returnLocationName}
                            </dd>
                            {reservation.returnAddress ? (
                                <dd className="text-muted-foreground">
                                    {reservation.returnAddress}
                                </dd>
                            ) : null}
                        </div>
                        <div>
                            <dt className="font-medium">
                                {resolveLanguageKey("driver")}
                            </dt>
                            <dd className="text-muted-foreground">
                                {reservation.contact.firstName}{" "}
                                {reservation.contact.lastName}
                            </dd>
                            <dd className="text-muted-foreground">
                                {reservation.contact.email}
                            </dd>
                            <dd className="text-muted-foreground">
                                {reservation.contact.phone}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">
                                {resolveLanguageKey("payment")}
                            </dt>
                            <dd className="text-muted-foreground">
                                {resolveLanguageKey(
                                    `paymentChoice.${reservation.paymentChoice}`,
                                )}
                            </dd>
                            <dd className="text-muted-foreground">
                                {resolveLanguageKey(
                                    `paymentStatus.${reservation.paymentStatus}`,
                                )}
                                {reservation.amountPaid > 0
                                    ? ` · ${formatMoney(reservation.amountPaid)}`
                                    : ""}
                                {reservation.amountDue > 0
                                    ? ` · ${String(resolveLanguageKey("amountDue")).replace("{amount}", formatMoney(reservation.amountDue))}`
                                    : ""}
                            </dd>
                        </div>
                    </dl>
                </section>

                {reservation.canUploadDocuments ? (
                    <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                        <h2 className="font-display font-bold tracking-tight text-lg">
                            {resolveLanguageKey("licenceTitle")}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {resolveLanguageKey("licenceHint")}{" "}
                            {reservation.driver?.documents
                                ? String(
                                      resolveLanguageKey("documentsCount"),
                                  ).replace(
                                      "{count}",
                                      String(reservation.driver.documents),
                                  )
                                : ""}
                        </p>
                        <Input
                            value={licenseNumber}
                            onChange={(event) =>
                                setLicenseNumber(event.target.value)
                            }
                            placeholder={String(
                                resolveLanguageKey("licenceNumber"),
                            )}
                        />
                        <Button
                            type="button"
                            disabled={busy || !licenseNumber}
                            onClick={() =>
                                run("update", "driver", {token, licenseNumber})
                            }
                        >
                            {resolveLanguageKey("saveLicence")}
                        </Button>
                        {/* The core picker, with this page's words, instead of the browser's English file input (TD-F86). */}
                        <MultiLocalFilePicker
                            files={documents}
                            onFilesChange={setDocuments}
                            resolveLanguageKey={resolveLanguageKey}
                            disabled={busy}
                            maxFiles={MAX_DOCUMENTS}
                            accept={DOCUMENT_TYPES}
                            addFileKey="addDocuments"
                            filesSelectedKey="documentsChosen"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            disabled={busy || documents.length === 0}
                            onClick={() => {
                                const body = new FormData();
                                for (const file of documents) body.append("files", file);
                                run("update", `documents?token=${encodeURIComponent(token)}`, body);
                            }}
                        >
                            {resolveLanguageKey("uploadDocuments")}
                        </Button>
                    </section>
                ) : null}
                {reservation.canExtend ? (
                    <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                        <h2 className="font-display font-bold tracking-tight text-lg">
                            {resolveLanguageKey("extendTitle")}
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <DateInput
                                valueFormat="YYYY-MM-DD"
                                value={returnDate}
                                onChange={setReturnDate}
                                clearable={false}
                                className="w-56"
                            />
                            <DateInput
                                timeOnly
                                valueFormat="HH:mm"
                                value={returnTime}
                                onChange={setReturnTime}
                                clearable={false}
                                className="w-32"
                            />
                        </div>
                        {/* Without card payments online (D190) the difference is paid at the desk. */}
                        <Button
                            type="button"
                            disabled={busy || !returnDate}
                            onClick={() =>
                                run("update", "extend", {token, returnDate, returnTime, pay: config?.onlinePaymentAvailable === true})
                            }
                        >
                            {resolveLanguageKey(config?.onlinePaymentAvailable ? "extendAndPay" : "extendPayAtDesk")}
                        </Button>
                    </section>
                ) : null}
                {reservation.canAddExtras && config ? (
                    <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                        <h2 className="font-display font-bold tracking-tight text-lg">
                            {resolveLanguageKey("extrasTitle")}
                        </h2>
                        {config.extras
                            .filter(
                                (extra) =>
                                    !reservation.extras.some(
                                        (line) => line.name === extra.name,
                                    ),
                            )
                            .map((extra) => (
                                <Button
                                    key={extra._id}
                                    type="button"
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() =>
                                        run("update", "extras", {
                                            token,
                                            extras: [
                                                ...reservation.extras.map((line) => ({extra: line.extraId, quantity: line.quantity})),
                                                {extra: extra._id, quantity: 1},
                                            ],
                                        })
                                    }
                                >
                                    {extra.name}
                                </Button>
                            ))}
                    </section>
                ) : null}
                {reservation.canPayBalance ? (
                    <Button
                        type="button"
                        size="lg"
                        disabled={busy}
                        onClick={() =>
                            run("pay", "pay", {token})
                        }
                    >
                        {resolveLanguageKey("payBalance")}
                    </Button>
                ) : null}
                {reservation.hasAgreement ? (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                            void download("agreement", {token}, `${reservation.number}.pdf`)
                        }
                    >
                        {resolveLanguageKey("downloadAgreement")}
                    </Button>
                ) : null}
                {reservation.invoices.map((invoice) => (
                    <Button
                        key={invoice.id}
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                            void download("invoice", {token, invoiceId: invoice.id}, `${invoice.number}.pdf`)
                        }
                    >
                        {String(resolveLanguageKey("downloadInvoice")).replace(
                            "{number}",
                            invoice.number,
                        )}
                    </Button>
                ))}
                {reservation.canReview && !reviewSaved ? (
                    <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                        <h2 className="font-display font-bold tracking-tight text-lg">
                            {resolveLanguageKey("reviewTitle")}
                        </h2>
                        {/* Stars, as the dentists' review (TD-F157). */}
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">{resolveLanguageKey("reviewRating")}</p>
                            <ToggleGroup
                                type="single"
                                spacing={1}
                                size="lg"
                                value={rating}
                                onValueChange={(next) => { if (next) setRating(next); }}
                                aria-label={String(resolveLanguageKey("reviewRating"))}
                            >
                                {RATINGS.map((value) => (
                                    <ToggleGroupItem
                                        key={value}
                                        value={value}
                                        className="px-1.5"
                                        aria-label={String(resolveLanguageKey("reviewStar")).replace("{rating}", value)}
                                    >
                                        <IconStarFilled className={cn("size-7", Number(value) <= Number(rating) ? "text-amber-500" : "text-muted-foreground/40")} aria-hidden />
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor={commentId}>{resolveLanguageKey("reviewComment")}</Label>
                            <Textarea id={commentId} value={comment} maxLength={RENTAL_REVIEW_COMMENT_MAX} rows={3} onChange={(event) => setComment(event.target.value)} />
                        </div>
                        <p className="text-sm text-muted-foreground">{resolveLanguageKey("reviewShownAs")}</p>
                        <Button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                                run("review", "review", {token, rating: Number(rating), ...(comment ? {comment} : {})})
                            }
                        >
                            {resolveLanguageKey("sendReview")}
                        </Button>
                    </section>
                ) : null}
                {reviewSaved ? (
                    <p className="text-sm text-muted-foreground">
                        {resolveLanguageKey("reviewThanks")}
                    </p>
                ) : null}

                {reservation.canCancel && !cancelled ? (
                    <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                        <h2 className="font-display font-bold tracking-tight text-lg">
                            {resolveLanguageKey("cancelTitle")}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {feeApplies
                                ? String(
                                      resolveLanguageKey("cancelWithFee"),
                                  ).replace(
                                      "{percent}",
                                      String(
                                          reservation.cancellationFeePercent,
                                      ),
                                  )
                                : String(
                                      resolveLanguageKey("cancelFree"),
                                  ).replace(
                                      "{until}",
                                      at(reservation.freeCancellationUntil),
                                  )}
                        </p>
                        {confirmingCancel ? (
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    size="lg"
                                    type="button"
                                    className="bg-destructive hover:bg-destructive/90"
                                    disabled={cancelling}
                                    onClick={cancel}
                                >
                                    {resolveLanguageKey(
                                        cancelling
                                            ? "cancelling"
                                            : "confirmCancel",
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    type="button"
                                    disabled={cancelling}
                                    onClick={() => setConfirmingCancel(false)}
                                >
                                    {resolveLanguageKey("keepBooking")}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="lg"
                                type="button"
                                className="self-start"
                                onClick={() => setConfirmingCancel(true)}
                            >
                                {resolveLanguageKey("cancelBooking")}
                            </Button>
                        )}
                    </section>
                ) : null}
                {cancelled ? (
                    <div
                        className="rounded-2xl bg-destructive/10 p-4 text-destructive"
                        role="status"
                    >
                        {resolveLanguageKey("cancelledNotice")}
                    </div>
                ) : null}
            </div>

            <aside className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4 self-start">
                <h2 className="font-display font-bold tracking-tight text-lg">
                    {resolveLanguageKey("priceTitle")}
                </h2>
                <RentalPriceSummary pricing={reservation.pricing} />
            </aside>
        </div>
    );
}

export default compose(
    withLanguage(
        "src/modules/carRental/clients/client/public/manage/index.tsx",
    ),
)(ManagePage);
