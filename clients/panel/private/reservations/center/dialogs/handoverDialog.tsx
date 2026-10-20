import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";
import type {HandoverRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.forms.ts";

const FUEL_LEVELS = ["empty", "quarter", "half", "three_quarters", "full"];

type Props = WithLanguageType & WithAxiosType<RentalReservation, HandoverRentalReservationFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** The customer drives off: record the odometer and fuel level. */
function HandoverDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [odometerKm, setOdometerKm] = useState("");
    const [fuelLevel, setFuelLevel] = useState("full");
    const [notes, setNotes] = useState("");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={odometerKm !== "" && Number(odometerKm) >= 0}
            onClose={onClose}
            onConfirm={() => onFilterChange({
                _id: reservation._id,
                odometerKm: Number(odometerKm),
                fuelLevel: fuelLevel as HandoverRentalReservationFormType["fuelLevel"],
                ...(notes.trim() ? {notes: notes.trim()} : {}),
            })}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-handover-km">{resolveLanguageKey("odometerLabel")}</Label>
                <Input id="rental-handover-km" type="number" min={0} value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} disabled={loading} />
            </div>
            <div className="flex flex-col gap-2">
                <Label>{resolveLanguageKey("fuelLabel")}</Label>
                <SimpleSelect
                    options={FUEL_LEVELS.map((value) => ({value, label: String(resolveLanguageKey(`fuel.${value}`))}))}
                    value={fuelLevel}
                    onValueChange={(value: string | string[]) => setFuelLevel(String(value))}
                    resolveLanguageKey={resolveLanguageKey}
                    disabled={loading}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-handover-notes">{resolveLanguageKey("notesLabel")}</Label>
                <Textarea id="rental-handover-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={resolveLanguageKey("notesPlaceholder")} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/handoverDialog.tsx"),
    withAxios<RentalReservation, HandoverRentalReservationFormType>({url: "/api/carRental/rentalReservation/handover", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(HandoverDialog);
