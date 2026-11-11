import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {companyToday, zonedParts} from "@coreModule/helpers/general/dateTime.ts";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {ExtendRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<RentalReservation, ExtendRentalReservationFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** The booking's current return as the return location's wall clock, so the dialog opens on it (UX-06). */
function currentReturn(reservation: RentalReservation): {date: string; time: string} {
    const timeZone = reservation.snapshot?.timezone;
    const end = new Date(reservation.returnAt);
    const parts = timeZone ? zonedParts(end, timeZone) : null;
    if (!timeZone || !parts) return {date: "", time: "10:00"};
    return {date: companyToday(timeZone, end), time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`};
}

/** New return date and time, in the return location's local time. Extra days are charged at today's rates. */
function ExtendReservationDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [returnDate, setReturnDate] = useState(() => currentReturn(reservation).date);
    const [returnTime, setReturnTime] = useState(() => currentReturn(reservation).time);
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
                <DateInput
                    id="rental-extend-date"
                    valueFormat="YYYY-MM-DD"
                    value={returnDate}
                    onChange={setReturnDate}
                    minDate={currentReturn(reservation).date || undefined}
                    disabled={loading}
                    clearable={false}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-extend-time">{resolveLanguageKey("returnTimeLabel")}</Label>
                <DateInput id="rental-extend-time" timeOnly valueFormat="HH:mm" value={returnTime} onChange={setReturnTime} clearable={false} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/extendReservationDialog.tsx"),
    withAxios<RentalReservation, ExtendRentalReservationFormType>({url: "/api/carRental/rentalReservation/extend", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(ExtendReservationDialog);
