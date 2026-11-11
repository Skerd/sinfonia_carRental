import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {RentalOpenDamage, RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";
import SignaturePad from "@coreModule/components/custom/inputs/signaturePad.tsx";
import MultiLocalFilePicker from "@coreModule/components/viewEngine/widgets/media/multiLocalFilePicker.tsx";
import type {HandoverRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";

const OPEN_DAMAGES_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalReservation/openDamages"};
const FUEL_LEVELS = ["empty", "quarter", "half", "three_quarters", "full"];

type Props = WithLanguageType & WithAxiosType<RentalReservation, HandoverRentalReservationFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/**
 * The customer drives off: odometer, fuel and photos of the car, the existing damage
 * the customer has seen, and their signature on the rental agreement. Every driver
 * needs a licence first.
 */
function HandoverDialog({reservation, onClose, onUpdated, resolveLanguageKey, onPost, innerRef, loading, error}: Props) {
    const [odometerKm, setOdometerKm] = useState("");
    const [fuelLevel, setFuelLevel] = useState("full");
    const [notes, setNotes] = useState("");
    const [photos, setPhotos] = useState<File[]>([]);
    const [damages, setDamages] = useState<RentalOpenDamage[]>([]);
    const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
    const [signerName, setSignerName] = useState(`${reservation.contact.firstName} ${reservation.contact.lastName}`.trim());
    const [signature, setSignature] = useState<File | null>(null);
    const [declined, setDeclined] = useState(false);
    const [readiness, setReadiness] = useState<string | undefined>();
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    useHttpRequest<{data: RentalOpenDamage[]; readiness?: string}>(OPEN_DAMAGES_REQUEST, {_id: reservation._id}, 1, true, {
        success: (response) => {
            setDamages(response.data);
            setReadiness(response.readiness);
            setAcknowledged(new Set(response.data.map((damage) => damage._id)));
        },
        error: () => setDamages([]),
    });

    // The server refuses the handover in this case; the hint saves a round trip.
    const driversIncomplete = !reservation.drivers?.length || reservation.drivers.some((driver) => !driver.licenseNumber);
    const toggle = (id: string, checked: boolean) => setAcknowledged((current) => {
        const next = new Set(current);
        if (checked) next.add(id);
        else next.delete(id);
        return next;
    });

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            error={error?.message}
            canConfirm={odometerKm !== "" && Number(odometerKm) >= 0 && (declined || !!signature)}
            contentClassName="sm:max-w-xl"
            onClose={onClose}
            onConfirm={() => onPost({
                _id: reservation._id,
                odometerKm: Number(odometerKm),
                fuelLevel: fuelLevel as HandoverRentalReservationFormType["fuelLevel"],
                ...(notes.trim() ? {notes: notes.trim()} : {}),
                photos,
                acknowledgedDamages: [...acknowledged],
                ...(signature && !declined ? {signature, signerName: signerName.trim() || undefined} : {}),
            })}
        >
            <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto">
                {driversIncomplete ? <p className="text-sm text-destructive">{resolveLanguageKey("driversMissing")}</p> : null}
                {readiness && readiness !== "ready" ? <p className="text-sm text-amber-700 dark:text-amber-400">{resolveLanguageKey(`notReady.${readiness}`)}</p> : null}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                </div>
                <div className="flex flex-col gap-2">
                    <Label>{resolveLanguageKey("photosLabel")}</Label>
                    <MultiLocalFilePicker
                        files={photos}
                        onFilesChange={setPhotos}
                        resolveLanguageKey={resolveLanguageKey}
                        disabled={loading}
                        maxFiles={12}
                        accept="image/*"
                        addFileKey="addPhotos"
                        filesSelectedKey="photosChosen"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>{resolveLanguageKey("damagesLabel")}</Label>
                    {damages.length ? (
                        <ul className="flex flex-col gap-2">
                            {damages.map((damage) => (
                                <li key={damage._id} className="flex items-start gap-2 text-sm">
                                    <Checkbox
                                        id={`rental-damage-${damage._id}`}
                                        checked={acknowledged.has(damage._id)}
                                        onCheckedChange={(checked) => toggle(damage._id, checked === true)}
                                        disabled={loading}
                                    />
                                    <label htmlFor={`rental-damage-${damage._id}`}>
                                        <span className="font-medium">{resolveLanguageKey(`area.${damage.area}`)}</span>
                                        {" · "}
                                        {resolveLanguageKey(`severity.${damage.severity}`)}
                                        <span className="block text-muted-foreground">{damage.description}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">{resolveLanguageKey("noDamages")}</p>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="rental-handover-signer">{resolveLanguageKey("signerLabel")}</Label>
                    <Input id="rental-handover-signer" value={signerName} onChange={(e) => setSignerName(e.target.value)} disabled={loading || declined} />
                    <SignaturePad
                        onChange={setSignature}
                        ariaLabel={String(resolveLanguageKey("signatureLabel"))}
                        clearLabel={String(resolveLanguageKey("signatureClear"))}
                        hint={String(resolveLanguageKey("signatureHint"))}
                        disabled={loading || declined}
                    />
                    <div className="flex items-center gap-2">
                        <Checkbox id="rental-handover-declined" checked={declined} onCheckedChange={(checked) => setDeclined(checked === true)} disabled={loading} />
                        <Label htmlFor="rental-handover-declined">{resolveLanguageKey("declinedLabel")}</Label>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="rental-handover-notes">{resolveLanguageKey("notesLabel")}</Label>
                    <Textarea id="rental-handover-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={resolveLanguageKey("notesPlaceholder")} disabled={loading} />
                </div>
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/handoverDialog.tsx"),
    withAxios<RentalReservation, HandoverRentalReservationFormType>({url: "/api/carRental/rentalReservation/handover", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(HandoverDialog);
