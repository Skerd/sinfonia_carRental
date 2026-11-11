import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {SaveRentalDriversFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";
import {RENTAL_DRIVERS_MAX_ITEMS, RENTAL_ID_DOCUMENT_TYPES} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.constants.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import dayjs from "dayjs";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {Label} from "@coreModule/components/ui/label.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";

/** The inputs per driver, in form order; the ID document type is a select after them. */
const INPUT_FIELDS = ["firstName", "lastName", "birthDate", "licenseNumber", "licenseCountry", "licenseIssuedAt", "licenseExpiresAt", "idDocumentNumber"] as const;
const DATE_FIELDS: readonly string[] = ["birthDate", "licenseIssuedAt", "licenseExpiresAt"];
/** What the server requires of every driver; the rest is filled in when the licence is checked at the counter. */
const REQUIRED_FIELDS: readonly string[] = ["firstName", "lastName", "birthDate"];
/** Birth and licence-issue days lie in the past; an upper bound only, the server checks age and validity. */
const PAST_FIELDS: readonly string[] = ["birthDate", "licenseIssuedAt"];
type DriverRow = Record<(typeof INPUT_FIELDS)[number] | "idDocumentType", string>;

const emptyRow = (firstName = "", lastName = ""): DriverRow => ({
    firstName, lastName, birthDate: "", licenseNumber: "", licenseCountry: "", licenseIssuedAt: "", licenseExpiresAt: "", idDocumentType: "", idDocumentNumber: "",
});

/** The saved drivers, primary first; a booking without any starts from its contact. */
function initialRows(reservation: RentalReservation): DriverRow[] {
    const drivers = [...(reservation.drivers ?? [])].sort((a, b) => (a.role === "primary" ? -1 : b.role === "primary" ? 1 : 0));
    if (!drivers.length) return [emptyRow(reservation.contact.firstName, reservation.contact.lastName)];
    return drivers.map((driver) => {
        const row = emptyRow();
        for (const key of Object.keys(row) as (keyof DriverRow)[]) row[key] = driver[key] ?? "";
        return row;
    });
}

type Props = WithLanguageType & WithAxiosType<RentalReservation, SaveRentalDriversFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** Who may drive: the first row is the main driver, the others are additional drivers. */
function DriversDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading, error}: Props) {
    const [rows, setRows] = useState<DriverRow[]>(() => initialRows(reservation));
    const returnDay = reservation.snapshot?.timezone ? companyToday(reservation.snapshot.timezone, new Date(reservation.returnAt)) : undefined;
    // Missing required fields are pointed out once Save was pressed, not while typing.
    const [showMissing, setShowMissing] = useState(false);
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    const update = (index: number, key: keyof DriverRow, value: string) =>
        setRows((current) => current.map((row, i) => (i === index ? {...row, [key]: value} : row)));
    const complete = rows.every((row) => row.firstName.trim() && row.lastName.trim() && row.birthDate);

    const submit = () => {
        if (!complete) {
            setShowMissing(true);
            return;
        }
        save();
    };
    const save = () => onFilterChange({
        _id: reservation._id,
        drivers: rows.map((row, index) => {
            const filled = Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value.trim()]).filter(([, value]) => value !== ""));
            return {...filled, role: index === 0 ? "primary" : "additional"} as SaveRentalDriversFormType["drivers"][number];
        }),
    });

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            error={error?.message}
            canConfirm
            contentClassName="sm:max-w-2xl"
            onClose={onClose}
            onConfirm={submit}
        >
            <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto">
                {rows.map((row, index) => (
                    <div key={index} className="flex flex-col gap-3 rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{resolveLanguageKey(index === 0 ? "primary" : "additional")}</p>
                            {index > 0 ? (
                                <Button type="button" variant="ghost" size="sm" onClick={() => setRows((current) => current.filter((_, i) => i !== index))} disabled={loading}>
                                    <IconTrash size={16} />
                                    {resolveLanguageKey("remove")}
                                </Button>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {INPUT_FIELDS.map((key) => {
                                const id = `rental-driver-${index}-${key}`;
                                const missing = showMissing && REQUIRED_FIELDS.includes(key) && !row[key].trim();
                                return (
                                    <div key={key} className="flex flex-col gap-2">
                                        <Label htmlFor={id}>
                                            {resolveLanguageKey(key)}
                                            {REQUIRED_FIELDS.includes(key) ? <span className="text-destructive" aria-hidden>*</span> : null}
                                        </Label>
                                        {DATE_FIELDS.includes(key) ? (
                                            <DateInput
                                                id={id}
                                                valueFormat="YYYY-MM-DD"
                                                value={row[key]}
                                                onChange={(value) => update(index, key, value)}
                                                maxDate={PAST_FIELDS.includes(key) ? dayjs().format("YYYY-MM-DD") : undefined}
                                                // A licence must stay valid until the car comes back (checked again by the server).
                                                minDate={key === "licenseExpiresAt" ? returnDay : undefined}
                                                disabled={loading}
                                            />
                                        ) : (
                                            <Input id={id} value={row[key]} onChange={(e) => update(index, key, e.target.value)} disabled={loading} aria-invalid={missing || undefined} />
                                        )}
                                        {missing ? <p className="text-xs text-destructive">{resolveLanguageKey("required")}</p> : null}
                                    </div>
                                );
                            })}
                            <div className="flex flex-col gap-2">
                                <Label>{resolveLanguageKey("idDocumentType")}</Label>
                                <SimpleSelect
                                    options={RENTAL_ID_DOCUMENT_TYPES.map((value) => ({value, label: String(resolveLanguageKey(`idDocumentTypes.${value}`))}))}
                                    value={row.idDocumentType}
                                    onValueChange={(value: string | string[]) => update(index, "idDocumentType", String(value))}
                                    resolveLanguageKey={resolveLanguageKey}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {rows.length < RENTAL_DRIVERS_MAX_ITEMS ? (
                    <Button type="button" variant="outline" className="self-start" onClick={() => setRows((current) => [...current, emptyRow()])} disabled={loading}>
                        <IconPlus size={16} />
                        {resolveLanguageKey("addDriver")}
                    </Button>
                ) : null}
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/driversDialog.tsx"),
    withAxios<RentalReservation, SaveRentalDriversFormType>({url: "/api/carRental/rentalReservation/saveDrivers", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(DriversDialog);
