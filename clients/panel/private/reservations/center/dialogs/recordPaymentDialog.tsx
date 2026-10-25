import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {RecordRentalPaymentFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<RentalReservation, RecordRentalPaymentFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** Money taken at the counter. Defaults to what is still due. */
function RecordPaymentDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const due = Math.max(0, (reservation.pricing?.grandTotal ?? 0) - (reservation.amountPaid ?? 0));
    const [amount, setAmount] = useState(String(due));
    const [note, setNote] = useState("");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    const value = Number(amount);

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={value > 0 && value <= due + 0.005}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id, amount: value, ...(note.trim() ? {note: note.trim()} : {})})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-payment-amount">{resolveLanguageKey("amountLabel")}</Label>
                <Input id="rental-payment-amount" type="number" min={0} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-payment-note">{resolveLanguageKey("noteLabel")}</Label>
                <Input id="rental-payment-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={resolveLanguageKey("notePlaceholder")} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/recordPaymentDialog.tsx"),
    withAxios<RentalReservation, RecordRentalPaymentFormType>({url: "/api/carRental/rentalReservation/recordPayment", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(RecordPaymentDialog);
