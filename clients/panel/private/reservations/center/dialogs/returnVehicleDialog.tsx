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
import {Switch} from "@coreModule/components/ui/switch.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";
import type {ReturnRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.forms.ts";

const FUEL_LEVELS = ["empty", "quarter", "half", "three_quarters", "full"];

type Props = WithLanguageType & WithAxiosType<RentalReservation, ReturnRentalReservationFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** The car is back: odometer, fuel, damage, and any extra charges (fuel, km, cleaning). */
function ReturnVehicleDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [odometerKm, setOdometerKm] = useState("");
    const [fuelLevel, setFuelLevel] = useState("full");
    const [notes, setNotes] = useState("");
    const [damageNoted, setDamageNoted] = useState(false);
    const [charges, setCharges] = useState<{label: string; amount: string}[]>([]);
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    const startKm = reservation.handover?.odometerKm ?? 0;
    const validCharges = charges.every((charge) => charge.label.trim() && Number(charge.amount) >= 0 && charge.amount !== "");

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={odometerKm !== "" && Number(odometerKm) >= startKm && validCharges}
            onClose={onClose}
            onConfirm={() => onFilterChange({
                _id: reservation._id,
                odometerKm: Number(odometerKm),
                fuelLevel: fuelLevel as ReturnRentalReservationFormType["fuelLevel"],
                damageNoted,
                extraCharges: charges.map((charge) => ({label: charge.label.trim(), amount: Number(charge.amount)})),
                ...(notes.trim() ? {notes: notes.trim()} : {}),
            })}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-return-km">{resolveLanguageKey("odometerLabel")}</Label>
                <Input id="rental-return-km" type="number" min={startKm} value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} disabled={loading} />
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
            <div className="flex items-center gap-3">
                <Switch id="rental-return-damage" checked={damageNoted} onCheckedChange={setDamageNoted} disabled={loading} />
                <Label htmlFor="rental-return-damage">{resolveLanguageKey("damageLabel")}</Label>
            </div>
            <div className="flex flex-col gap-2">
                <Label>{resolveLanguageKey("chargesLabel")}</Label>
                {charges.map((charge, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            aria-label={String(resolveLanguageKey("chargeLabel"))}
                            placeholder={resolveLanguageKey("chargePlaceholder")}
                            value={charge.label}
                            onChange={(e) => setCharges(charges.map((c, i) => (i === index ? {...c, label: e.target.value} : c)))}
                            disabled={loading}
                        />
                        <Input
                            aria-label={String(resolveLanguageKey("chargeAmount"))}
                            type="number"
                            min={0}
                            step="any"
                            className="w-28"
                            value={charge.amount}
                            onChange={(e) => setCharges(charges.map((c, i) => (i === index ? {...c, amount: e.target.value} : c)))}
                            disabled={loading}
                        />
                        <Button type="button" variant="ghost" onClick={() => setCharges(charges.filter((_, i) => i !== index))} disabled={loading}>
                            {resolveLanguageKey("removeCharge")}
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => setCharges([...charges, {label: "", amount: ""}])} disabled={loading}>
                    {resolveLanguageKey("addCharge")}
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-return-notes">{resolveLanguageKey("notesLabel")}</Label>
                <Textarea id="rental-return-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/returnVehicleDialog.tsx"),
    withAxios<RentalReservation, ReturnRentalReservationFormType>({url: "/api/carRental/rentalReservation/returnVehicle", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(ReturnVehicleDialog);
