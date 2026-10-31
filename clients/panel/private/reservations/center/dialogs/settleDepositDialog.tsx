import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {SettleRentalDepositFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";

type Props = WithLanguageType & WithAxiosType<RentalReservation, SettleRentalDepositFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** Keeps what the customer still owes from the deposit and releases the rest. */
function SettleDepositDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const held = reservation.deposit?.amount ?? 0;
    const due = Math.max(0, (reservation.pricing?.grandTotal ?? 0) - (reservation.amountPaid ?? 0));
    const [keep, setKeep] = useState(String(Math.round(Math.min(held, due) * 100) / 100));
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={String(resolveLanguageKey("description")).replace("{held}", String(held)).replace("{due}", String(due))}
            confirmLabel={resolveLanguageKey(Number(keep) > 0 ? "confirmKeep" : "confirmRelease")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={keep !== "" && Number(keep) >= 0 && Number(keep) <= Math.min(held, due) + 0.005}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id, keepAmount: Number(keep)})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-deposit-keep">{resolveLanguageKey("keepLabel")}</Label>
                <Input id="rental-deposit-keep" type="number" min={0} step="any" value={keep} onChange={(e) => setKeep(e.target.value)} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/settleDepositDialog.tsx"),
    withAxios<RentalReservation, SettleRentalDepositFormType>({url: "/api/carRental/rentalReservation/settleDeposit", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(SettleDepositDialog);
