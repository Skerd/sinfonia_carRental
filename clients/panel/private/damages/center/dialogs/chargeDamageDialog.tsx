import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";
import type {ChargeVehicleDamageFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.schema-def.ts";
import ReservationActionDialogShell from "@carRentalModule/clients/panel/private/reservations/center/dialogs/reservationActionDialogShell.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";

type Props = WithLanguageType & WithAxiosType<VehicleDamage, ChargeVehicleDamageFormType> & {
    damage: VehicleDamage;
    onClose: () => void;
    onUpdated: (updated: VehicleDamage) => void;
};

/** Adds the repair to what the customer of the linked booking owes, capped at their excess. */
function ChargeDamageDialog({damage, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading, error}: Props) {
    const [amount, setAmount] = useState(String(damage.repair?.cost ?? damage.estimatedCost ?? ""));
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={String(resolveLanguageKey("description")).replace("{number}", damage.reservation?.number ?? "")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            error={error?.message}
            canConfirm={amount !== "" && Number(amount) > 0}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: damage._id, amount: Number(amount)})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-damage-charge">{resolveLanguageKey("amountLabel")}</Label>
                <Input id="rental-damage-charge" type="number" min={0} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} />
                <p className="text-xs text-muted-foreground">{resolveLanguageKey("excessHint")}</p>
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/damages/center/dialogs/chargeDamageDialog.tsx"),
    withAxios<VehicleDamage, ChargeVehicleDamageFormType>({url: "/api/carRental/vehicleDamage/chargeToCustomer", method: "POST", data: {}}, true),
    withDebug(true, true, "vehicledamages"),
)(ChargeDamageDialog);
