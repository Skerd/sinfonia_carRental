import {useEffect, useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {RentalReservation, RentalReturnChargesPreview} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {RentalPriceLineCode} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.constants.ts";
import {VEHICLE_DAMAGE_AREAS, VEHICLE_DAMAGE_SEVERITIES} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.schema-def.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";
import type {ReturnRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";

const FUEL_LEVELS = ["empty", "quarter", "half", "three_quarters", "full"];
const PREVIEW_DELAY_MS = 400;
const PREVIEW_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalReservation/previewReturnCharges"};

type Charge = {label: string; amount: string; code?: RentalPriceLineCode; include: boolean};
type NewDamage = {area: string; severity: string; description: string; estimatedCost: string; photos: File[]};

type Props = WithLanguageType & WithAxiosType<RentalReservation, ReturnRentalReservationFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/**
 * The car is back: odometer, fuel and photos, new damage, and the charges on top.
 * Km, fuel and lateness charges are worked out from the readings; staff can untick
 * or change them, add the preset fees, or add their own.
 */
function ReturnVehicleDialog({reservation, onClose, onUpdated, resolveLanguageKey, onPost, innerRef, loading}: Props) {
    const [odometerKm, setOdometerKm] = useState("");
    const [fuelLevel, setFuelLevel] = useState("full");
    const [notes, setNotes] = useState("");
    const [photos, setPhotos] = useState<File[]>([]);
    const [newDamages, setNewDamages] = useState<NewDamage[]>([]);
    const [suggested, setSuggested] = useState<Charge[]>([]);
    const [presets, setPresets] = useState<RentalReturnChargesPreview["presets"]>([]);
    const [charges, setCharges] = useState<Charge[]>([]);
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    const startKm = reservation.handover?.odometerKm ?? 0;
    const readingValid = odometerKm !== "" && Number(odometerKm) >= startKm;
    const [previewCount, setPreviewCount] = useState(0);

    useEffect(() => {
        if (!readingValid) {
            setSuggested([]);
            return;
        }
        const timer = setTimeout(() => setPreviewCount((count) => count + 1), PREVIEW_DELAY_MS);
        return () => clearTimeout(timer);
    }, [reservation._id, odometerKm, fuelLevel, readingValid]);
    useHttpRequest<{data: RentalReturnChargesPreview}>(PREVIEW_REQUEST, {_id: reservation._id, odometerKm: Number(odometerKm), fuelLevel}, previewCount, true, {
        success: (response) => {
            setSuggested(response.data.suggested.map((charge) => ({label: charge.label, amount: String(charge.amount), code: charge.code, include: true})));
            setPresets(response.data.presets);
        },
        error: () => setSuggested([]),
    });

    const all = [...suggested, ...charges];
    const validCharges = all.every((charge) => !charge.include || (charge.label.trim() && charge.amount !== "" && Number(charge.amount) >= 0));
    const validDamages = newDamages.every((damage) => damage.description.trim());
    const update = (list: "suggested" | "charges", index: number, patch: Partial<Charge>) =>
        (list === "suggested" ? setSuggested : setCharges)((current) => current.map((charge, i) => (i === index ? {...charge, ...patch} : charge)));
    const updateDamage = (index: number, patch: Partial<NewDamage>) =>
        setNewDamages((current) => current.map((damage, i) => (i === index ? {...damage, ...patch} : damage)));

    const chargeRow = (list: "suggested" | "charges", charge: Charge, index: number) => (
        <div key={`${list}-${index}`} className="flex items-center gap-2">
            {list === "suggested" ? (
                <Checkbox
                    aria-label={charge.label}
                    checked={charge.include}
                    onCheckedChange={(checked) => update(list, index, {include: checked === true})}
                    disabled={loading}
                />
            ) : null}
            <Input
                aria-label={String(resolveLanguageKey("chargeLabel"))}
                placeholder={resolveLanguageKey("chargePlaceholder")}
                value={charge.label}
                onChange={(e) => update(list, index, {label: e.target.value})}
                disabled={loading || !charge.include}
            />
            <Input
                aria-label={String(resolveLanguageKey("chargeAmount"))}
                type="number"
                min={0}
                step="any"
                className="w-28"
                value={charge.amount}
                onChange={(e) => update(list, index, {amount: e.target.value})}
                disabled={loading || !charge.include}
            />
            {list === "charges" ? (
                <Button type="button" variant="ghost" onClick={() => setCharges(charges.filter((_, i) => i !== index))} disabled={loading}>
                    {resolveLanguageKey("removeCharge")}
                </Button>
            ) : null}
        </div>
    );

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={readingValid && validCharges && validDamages}
            contentClassName="sm:max-w-xl"
            onClose={onClose}
            onConfirm={() => onPost({
                _id: reservation._id,
                odometerKm: Number(odometerKm),
                fuelLevel: fuelLevel as ReturnRentalReservationFormType["fuelLevel"],
                damageNoted: newDamages.length > 0,
                extraCharges: all
                    .filter((charge) => charge.include)
                    .map((charge) => ({label: charge.label.trim(), amount: Number(charge.amount), ...(charge.code ? {code: charge.code} : {})})),
                photos,
                newDamages: newDamages.map((damage) => ({
                    area: damage.area as NonNullable<ReturnRentalReservationFormType["newDamages"]>[number]["area"],
                    severity: damage.severity as NonNullable<ReturnRentalReservationFormType["newDamages"]>[number]["severity"],
                    description: damage.description.trim(),
                    ...(damage.estimatedCost !== "" ? {estimatedCost: Number(damage.estimatedCost)} : {}),
                    photos: damage.photos,
                })),
                ...(notes.trim() ? {notes: notes.trim()} : {}),
            })}
        >
            <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="rental-return-photos">{resolveLanguageKey("photosLabel")}</Label>
                    <Input
                        id="rental-return-photos"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
                        disabled={loading}
                    />
                    {photos.length ? <p className="text-xs text-muted-foreground">{String(resolveLanguageKey("photosSelected")).replace("{count}", String(photos.length))}</p> : null}
                </div>
                <div className="flex flex-col gap-2">
                    <Label>{resolveLanguageKey("damageLabel")}</Label>
                    {newDamages.map((damage, index) => (
                        <div key={index} className="flex flex-col gap-2 rounded-md border p-3">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <SimpleSelect
                                    options={VEHICLE_DAMAGE_AREAS.map((value) => ({value, label: String(resolveLanguageKey(`area.${value}`))}))}
                                    value={damage.area}
                                    onValueChange={(value: string | string[]) => updateDamage(index, {area: String(value)})}
                                    resolveLanguageKey={resolveLanguageKey}
                                    disabled={loading}
                                />
                                <SimpleSelect
                                    options={VEHICLE_DAMAGE_SEVERITIES.map((value) => ({value, label: String(resolveLanguageKey(`severity.${value}`))}))}
                                    value={damage.severity}
                                    onValueChange={(value: string | string[]) => updateDamage(index, {severity: String(value)})}
                                    resolveLanguageKey={resolveLanguageKey}
                                    disabled={loading}
                                />
                            </div>
                            <Input
                                aria-label={String(resolveLanguageKey("damageDescription"))}
                                placeholder={resolveLanguageKey("damageDescription")}
                                value={damage.description}
                                onChange={(e) => updateDamage(index, {description: e.target.value})}
                                disabled={loading}
                            />
                            <div className="flex gap-2">
                                <Input
                                    aria-label={String(resolveLanguageKey("damageCost"))}
                                    placeholder={resolveLanguageKey("damageCost")}
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={damage.estimatedCost}
                                    onChange={(e) => updateDamage(index, {estimatedCost: e.target.value})}
                                    disabled={loading}
                                />
                                <Input
                                    aria-label={String(resolveLanguageKey("photosLabel"))}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    multiple
                                    onChange={(e) => updateDamage(index, {photos: Array.from(e.target.files ?? [])})}
                                    disabled={loading}
                                />
                            </div>
                            <Button type="button" variant="ghost" className="self-start" onClick={() => setNewDamages(newDamages.filter((_, i) => i !== index))} disabled={loading}>
                                {resolveLanguageKey("removeCharge")}
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        className="self-start"
                        onClick={() => setNewDamages([...newDamages, {area: "front", severity: "minor", description: "", estimatedCost: "", photos: []}])}
                        disabled={loading}
                    >
                        {resolveLanguageKey("addDamage")}
                    </Button>
                </div>
                <div className="flex flex-col gap-2">
                    <Label>{resolveLanguageKey("chargesLabel")}</Label>
                    {suggested.length ? <p className="text-xs text-muted-foreground">{resolveLanguageKey("suggestedHint")}</p> : null}
                    {suggested.map((charge, index) => chargeRow("suggested", charge, index))}
                    {charges.map((charge, index) => chargeRow("charges", charge, index))}
                    <div className="flex flex-wrap gap-2">
                        {presets.map((preset) => (
                            <Button
                                key={preset.code}
                                type="button"
                                variant="outline"
                                onClick={() => setCharges([...charges, {label: preset.label, amount: String(preset.amount), code: preset.code, include: true}])}
                                disabled={loading}
                            >
                                {String(resolveLanguageKey("addPreset")).replace("{label}", preset.label)}
                            </Button>
                        ))}
                        <Button type="button" variant="outline" onClick={() => setCharges([...charges, {label: "", amount: "", include: true}])} disabled={loading}>
                            {resolveLanguageKey("addCharge")}
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="rental-return-notes">{resolveLanguageKey("notesLabel")}</Label>
                    <Textarea id="rental-return-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={loading} />
                </div>
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/returnVehicleDialog.tsx"),
    withAxios<RentalReservation, ReturnRentalReservationFormType>({url: "/api/carRental/rentalReservation/returnVehicle", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(ReturnVehicleDialog);
