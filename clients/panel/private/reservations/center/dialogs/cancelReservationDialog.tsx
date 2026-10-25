import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Switch} from "@coreModule/components/ui/switch.tsx";
import type {CancelRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<RentalReservation, CancelRentalReservationFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** Staff cancellation. What was paid is refunded, minus the policy fee only when asked. */
function CancelReservationDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [reason, setReason] = useState("");
    const [applyFee, setApplyFee] = useState(false);
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            destructive
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id, applyCancellationFee: applyFee, ...(reason.trim() ? {reason: reason.trim()} : {})})}
        >
            <div className="flex items-center gap-3">
                <Switch id="rental-cancel-fee" checked={applyFee} onCheckedChange={setApplyFee} disabled={loading} />
                <Label htmlFor="rental-cancel-fee">
                    {resolveLanguageKey("applyFeeLabel")} ({reservation.policy?.cancellationFeePercent ?? 0}%)
                </Label>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-cancel-reason">{resolveLanguageKey("reasonLabel")}</Label>
                <Textarea id="rental-cancel-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={resolveLanguageKey("reasonPlaceholder")} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/cancelReservationDialog.tsx"),
    withAxios<RentalReservation, CancelRentalReservationFormType>({url: "/api/carRental/rentalReservation/cancel", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(CancelReservationDialog);
