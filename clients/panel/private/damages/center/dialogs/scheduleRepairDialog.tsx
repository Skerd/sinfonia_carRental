import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";
import type {ScheduleVehicleDamageRepairFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.schema-def.ts";
import ReservationActionDialogShell from "@carRentalModule/clients/panel/private/reservations/center/dialogs/reservationActionDialogShell.tsx";
import {ApiSelect} from "@coreModule/components/viewEngine/widgets/inputs/apiSelect/apiSelect.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";

type Props = WithLanguageType & WithAxiosType<VehicleDamage, ScheduleVehicleDamageRepairFormType> & {
    damage: VehicleDamage;
    onClose: () => void;
    onUpdated: (updated: VehicleDamage) => void;
};

/**
 * Sends the car to repair: a new repair record (the car is blocked until the ready time),
 * or a repair already planned for this car, so several damages share one garage visit.
 */
function ScheduleRepairDialog({damage, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [repair, setRepair] = useState("");
    const [serviceDate, setServiceDate] = useState("");
    const [readyAt, setReadyAt] = useState("");
    const [provider, setProvider] = useState("");
    const [cost, setCost] = useState(damage.estimatedCost !== undefined ? String(damage.estimatedCost) : "");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    const submit = () => onFilterChange(repair
        ? {_id: damage._id, repair}
        : {
            _id: damage._id,
            serviceDate,
            ...(readyAt ? {readyAt} : {}),
            ...(provider ? {provider} : {}),
            ...(cost !== "" ? {cost: Number(cost)} : {}),
        });

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={!!repair || !!serviceDate}
            onClose={onClose}
            onConfirm={submit}
        >
            <div className="flex flex-col gap-2">
                <Label>{resolveLanguageKey("repairLabel")}</Label>
                <ApiSelect
                    apiUrl="/api/carRental/vehicleMaintenance/select"
                    postBody={{vehicle: damage.vehicle?._id, scheduledRepairs: true}}
                    value={repair}
                    onValueChange={(value: string | string[]) => setRepair(String(value))}
                    placeholder={resolveLanguageKey("repairPlaceholder")}
                    resolveLanguageKey={resolveLanguageKey}
                    disabled={loading}
                    className="w-full"
                />
            </div>
            {!repair && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="rental-repair-date">{resolveLanguageKey("serviceDateLabel")}</Label>
                            <DateInput id="rental-repair-date" valueFormat="YYYY-MM-DD[T]HH:mm" value={serviceDate} onChange={setServiceDate} disabled={loading} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="rental-repair-ready">{resolveLanguageKey("readyAtLabel")}</Label>
                            <DateInput id="rental-repair-ready" valueFormat="YYYY-MM-DD[T]HH:mm" value={readyAt} onChange={setReadyAt} minDate={serviceDate ? serviceDate.slice(0, 10) : undefined} disabled={loading} />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{resolveLanguageKey("readyAtHint")}</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="rental-repair-provider">{resolveLanguageKey("providerLabel")}</Label>
                            <Input id="rental-repair-provider" value={provider} onChange={(e) => setProvider(e.target.value)} disabled={loading} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="rental-repair-cost">{resolveLanguageKey("costLabel")}</Label>
                            <Input id="rental-repair-cost" type="number" min={0} step="any" value={cost} onChange={(e) => setCost(e.target.value)} disabled={loading} />
                        </div>
                    </div>
                </>
            )}
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/damages/center/dialogs/scheduleRepairDialog.tsx"),
    withAxios<VehicleDamage, ScheduleVehicleDamageRepairFormType>({url: "/api/carRental/vehicleDamage/scheduleRepair", method: "POST", data: {}}, true),
    withDebug(true, true, "vehicledamages"),
)(ScheduleRepairDialog);
