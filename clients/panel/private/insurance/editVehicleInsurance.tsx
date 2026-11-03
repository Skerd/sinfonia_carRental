import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleInsuranceFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/editVehicleInsurance.form.validator.ts";
import type {EditVehicleInsuranceFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.schema-def.ts";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";
import {vehicleFormExtras, vehicleScopeLabel} from "@carRentalModule/clients/panel/vehicleScope.ts";

/** The date picker stores a calendar day. The API sends a full instant. */
function formDay(value: string): string {
    return value.length > 10 ? value.slice(0, 10) : value;
}

export default createGenericEditPage<VehicleInsurance, EditVehicleInsuranceFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/insurance/editVehicleInsurance.tsx",
    collectionName: "vehicleinsurances",
    accessModel: "vehicleinsurances",
    apiUrl: "/api/carRental/vehicleInsurance",
    schema: editVehicleInsuranceFormSchema,
    mapEntityData: (data) => ({
        _id: data._id,
        vehicle: data.vehicle?._id,
        insurer: data.insurer,
        policyNumber: data.policyNumber,
        coverage: data.coverage,
        validFrom: formDay(data.validFrom),
        expiresAt: formDay(data.expiresAt),
        premium: data.premium,
        deductible: data.deductible,
        status: data.status,
        notes: data.notes,
        attachments: data.attachments?.map((file) => file._id),
    }),
    buildFormExtras: (_entityId, params, entity) => {
        const extras = vehicleFormExtras(params);
        const vehicle = entity?.vehicle;
        const label = vehicle ? vehicleScopeLabel(vehicle) : "";
        const withBanner = {...extras, renderChildrenFirst: true};
        if (!vehicle?._id || !label) return withBanner;
        return {...withBanner, vehicleDefaultOptions: [{value: vehicle._id, label}]};
    },
    beforeSubmit: (data) => (data.status === "cancelled" ? "cancelledLocked" : null),
    mapSubmitPayload: ({status: _status, ...rest}) => rest,
    renderChildren: (_form, entity, {resolveLanguageKey}) =>
        entity?.status === "cancelled" ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("cancelledLocked")}</p> : null,
    submitIcon: <Save />,
});
