import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import type {RentalExtendWindow, RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {companyToday, formatDate, zonedParts} from "@coreModule/helpers/general/dateTime.ts";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {ExtendRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<RentalReservation, ExtendRentalReservationFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

const WINDOW_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalReservation/extendWindow"};
const UNTIL_FORMAT: Intl.DateTimeFormatOptions = {weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"};

/** An instant as the location's wall clock: its local day and "HH:mm". */
function wallClock(at: Date, timeZone: string | undefined): {date: string; time: string} | null {
    const parts = timeZone ? zonedParts(at, timeZone) : null;
    if (!timeZone || !parts) return null;
    return {date: companyToday(timeZone, at), time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`};
}

/** A local day as the date the calendar shows (its own midnight), to grey it out. */
const calendarDay = (day: string) => {
    const [year, month, date] = day.split("-").map(Number);
    return new Date(year, month - 1, date);
};

/**
 * New return date and time, in the return location's local time. Extra days are charged at today's rates.
 * The calendar only offers days the car stays free and the return location is open; the server checks again.
 */
function ExtendReservationDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading, error}: Props) {
    const timeZone = reservation.snapshot?.timezone;
    // The dialog opens on the current return (UX-06).
    const current = wallClock(new Date(reservation.returnAt), timeZone) ?? {date: "", time: "10:00"};
    const [returnDate, setReturnDate] = useState(current.date);
    const [returnTime, setReturnTime] = useState(current.time);
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    const windowRequest = useHttpRequest<{data: RentalExtendWindow}>(WINDOW_REQUEST, {_id: reservation._id}, 1, true, {
        error: (requestError) => handleError(requestError, {context: "RentalExtendWindow"}),
    });
    const limit = windowRequest.data?.data;
    const until = limit?.until ? wallClock(new Date(limit.until), limit.timeZone) : null;
    // An overdue car is extended from today, not from the day it should have come back.
    const today = timeZone ? companyToday(timeZone) : "";
    const firstDay = current.date > today ? current.date : today;
    const closedDays = (limit?.closedDays ?? []).map(calendarDay);
    const pastLimit = !!until && (returnDate > until.date || (returnDate === until.date && returnTime > until.time));
    const notLater = returnDate < current.date || (returnDate === current.date && returnTime <= current.time);

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={`${resolveLanguageKey("description")} (${timeZone ?? ""})`}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            error={error?.message}
            canConfirm={!!returnDate && !!returnTime && !pastLimit && !notLater && !windowRequest.loading}
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
                    minDate={firstDay || undefined}
                    maxDate={until?.date}
                    calendarProps={{disabled: closedDays}}
                    disabled={loading}
                    clearable={false}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-extend-time">{resolveLanguageKey("returnTimeLabel")}</Label>
                <DateInput id="rental-extend-time" timeOnly valueFormat="HH:mm" value={returnTime} onChange={setReturnTime} clearable={false} disabled={loading} />
            </div>
            {/* How far it can go: until the car's next booking or block, or open-ended. */}
            {limit ? (
                <p className={pastLimit ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
                    {limit.until
                        ? String(resolveLanguageKey("freeUntil")).replace("{until}", formatDate(limit.until, {timeZone: limit.timeZone, format: UNTIL_FORMAT}))
                        : resolveLanguageKey("freeOpenEnded")}
                </p>
            ) : null}
            {notLater && (returnDate !== current.date || returnTime !== current.time) ? <p className="text-sm text-destructive">{resolveLanguageKey("notLater")}</p> : null}
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/extendReservationDialog.tsx"),
    withAxios<RentalReservation, ExtendRentalReservationFormType>({url: "/api/carRental/rentalReservation/extend", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(ExtendReservationDialog);
