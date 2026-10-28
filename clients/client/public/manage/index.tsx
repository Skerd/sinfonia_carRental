import {useEffect, useState} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError, normalizeError} from "@coreModule/helpers/general/errors.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import type {
    PublicRentalReservation,
    PublicRentalReservationResponse,
} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalPriceSummary from "../shared/rentalPriceSummary.tsx";
import {formatAtLocation} from "../shared/rentalTripParams.ts";
import {Button} from "@coreModule/components/ui/button.tsx";

/** After paying, the webhook confirms the booking; check again for this long before giving up. */
const PAYMENT_POLL_MS = 2500;
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

function ManagePage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const base = useSectionBase();
    const [params] = useSearchParams();
    const token = params.get("token") ?? "";
    const justPaid = params.get("paid") === "1";
    const {formatMoney} = useRentalConfig();
    const [reservation, setReservation] = useState<PublicRentalReservation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [confirmingCancel, setConfirmingCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    useEffect(() => {
        if (!token || cancelled) return;
        const controller = new AbortController();
        apiClient
            .post<PublicRentalReservationResponse>("/api/carRental/rentalStorefront/manage", {token}, {signal: controller.signal})
            .then((res) => setReservation(res.data.data))
            .catch((e) => {
                if (!controller.signal.aborted) setError(normalizeError(e).displayMessage ?? String(resolveLanguageKey("loadFailed")));
            });
        return () => controller.abort();
    }, [token, attempt, cancelled]);

    const waitingForPayment = justPaid && reservation?.status === "held" && attempt < PAYMENT_POLL_ATTEMPTS;
    useEffect(() => {
        if (!waitingForPayment) return;
        const timer = window.setTimeout(() => setAttempt((n) => n + 1), PAYMENT_POLL_MS);
        return () => window.clearTimeout(timer);
    }, [waitingForPayment, attempt]);

    const cancel = async () => {
        setCancelling(true);
        try {
            const res = await apiClient.post<PublicRentalReservationResponse>("/api/carRental/rentalStorefront/manage/cancel", {token});
            // The link stops working once the booking is cancelled; keep showing what came back.
            setCancelled(true);
            setReservation(res.data.data);
            setConfirmingCancel(false);
        } catch (e) {
            handleError(e, {context: "RentalManageCancel", showToast: true, fallbackMessage: String(resolveLanguageKey("cancelFailed"))});
        } finally {
            setCancelling(false);
        }
    };

    if (!token || error) {
        return (
            <div className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col items-start gap-3" role="alert">
                <h1 className="font-display font-bold tracking-tight text-xl">{resolveLanguageKey("linkInvalidTitle")}</h1>
                <p className="text-muted-foreground">{error ?? resolveLanguageKey("linkInvalidText")}</p>
                <Button asChild size="lg"><Link to={base}>{resolveLanguageKey("backHome")}</Link></Button>
            </div>
        );
    }
    if (!reservation) return <Loader />;

    const at = (iso: string) => formatAtLocation(iso, reservation.timezone, languageCode);
    const feeApplies = reservation.cancellationFeePercent > 0 && new Date(reservation.freeCancellationUntil) <= new Date();

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-6">
                {justPaid && reservation.status === "confirmed" && !cancelled ? (
                    <div className="rounded-2xl bg-success/10 p-4 text-success" role="status">{resolveLanguageKey("paidConfirmed")}</div>
                ) : null}
                {reservation.status === "held" ? (
                    <div className="rounded-2xl bg-warning/10 p-4 text-warning" role="status" aria-live="polite">
                        {resolveLanguageKey(waitingForPayment ? "awaitingPayment" : "heldNotice")}
                    </div>
                ) : null}

                <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted-foreground">{resolveLanguageKey("bookingNumber")} {reservation.number}</p>
                            <h1 className="font-display font-bold tracking-tight text-3xl">{reservation.vehicleLabel ?? reservation.categoryName}</h1>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[reservation.status]}`}>
                            {resolveLanguageKey(`status.${reservation.status}`)}
                        </span>
                    </div>
                    <dl className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="font-medium">{resolveLanguageKey("pickup")}</dt>
                            <dd className="text-muted-foreground">{at(reservation.pickupAt)}</dd>
                            <dd className="text-muted-foreground">{reservation.pickupLocationName}</dd>
                            {reservation.pickupAddress ? <dd className="text-muted-foreground">{reservation.pickupAddress}</dd> : null}
                        </div>
                        <div>
                            <dt className="font-medium">{resolveLanguageKey("return")}</dt>
                            <dd className="text-muted-foreground">{at(reservation.returnAt)}</dd>
                            <dd className="text-muted-foreground">{reservation.returnLocationName}</dd>
                            {reservation.returnAddress ? <dd className="text-muted-foreground">{reservation.returnAddress}</dd> : null}
                        </div>
                        <div>
                            <dt className="font-medium">{resolveLanguageKey("driver")}</dt>
                            <dd className="text-muted-foreground">{reservation.contact.firstName} {reservation.contact.lastName}</dd>
                            <dd className="text-muted-foreground">{reservation.contact.email}</dd>
                            <dd className="text-muted-foreground">{reservation.contact.phone}</dd>
                        </div>
                        <div>
                            <dt className="font-medium">{resolveLanguageKey("payment")}</dt>
                            <dd className="text-muted-foreground">{resolveLanguageKey(`paymentChoice.${reservation.paymentChoice}`)}</dd>
                            <dd className="text-muted-foreground">
                                {resolveLanguageKey(`paymentStatus.${reservation.paymentStatus}`)}
                                {reservation.amountPaid > 0 ? ` · ${formatMoney(reservation.amountPaid)}` : ""}
                            </dd>
                        </div>
                    </dl>
                </section>

                {reservation.canCancel && !cancelled ? (
                    <section className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-3">
                        <h2 className="font-display font-bold tracking-tight text-lg">{resolveLanguageKey("cancelTitle")}</h2>
                        <p className="text-sm text-muted-foreground">
                            {feeApplies
                                ? String(resolveLanguageKey("cancelWithFee")).replace("{percent}", String(reservation.cancellationFeePercent))
                                : String(resolveLanguageKey("cancelFree")).replace("{until}", at(reservation.freeCancellationUntil))}
                        </p>
                        {confirmingCancel ? (
                            <div className="flex flex-wrap gap-3">
                                <Button size="lg" type="button" className="bg-destructive hover:bg-destructive/90" disabled={cancelling} onClick={() => void cancel()}>
                                    {resolveLanguageKey(cancelling ? "cancelling" : "confirmCancel")}
                                </Button>
                                <Button variant="outline" size="lg" type="button"  disabled={cancelling} onClick={() => setConfirmingCancel(false)}>
                                    {resolveLanguageKey("keepBooking")}
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" size="lg" type="button" className="self-start" onClick={() => setConfirmingCancel(true)}>
                                {resolveLanguageKey("cancelBooking")}
                            </Button>
                        )}
                    </section>
                ) : null}
                {cancelled ? <div className="rounded-2xl bg-destructive/10 p-4 text-destructive" role="status">{resolveLanguageKey("cancelledNotice")}</div> : null}
            </div>

            <aside className="rounded-2xl bg-muted p-5 sm:p-6 flex flex-col gap-4 self-start">
                <h2 className="font-display font-bold tracking-tight text-lg">{resolveLanguageKey("priceTitle")}</h2>
                <RentalPriceSummary pricing={reservation.pricing} />
            </aside>
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/manage/index.tsx"))(ManagePage);
