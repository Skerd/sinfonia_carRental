import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {ExtendRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.forms.ts";

type Props = WithLanguageType & WithAxiosType<RentalReservation, ExtendRentalReservationFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** New return date and time, in the return location's local time. Extra days are charged at today's rates. */
function ExtendReservationDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState("10:00");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={`${resolveLanguageKey("description")} (${reservation.snapshot?.timezone ?? ""})`}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={!!returnDate && !!returnTime}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id, returnDate, returnTime})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-extend-date">{resolveLanguageKey("returnDateLabel")}</Label>
                <Input id="rental-extend-date" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} disabled={loading} />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-extend-time">{resolveLanguageKey("returnTimeLabel")}</Label>
                <Input id="rental-extend-time" type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/extendReservationDialog.tsx"),
    withAxios<RentalReservation, ExtendRentalReservationFormType>({url: "/api/carRental/rentalReservation/extend", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(ExtendReservationDialog);
