import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleInsuranceFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/createVehicleInsurance.form.validator.ts";
import {
    VEHICLE_INSURANCE_COVERAGES,
    type CreateVehicleInsuranceFormType,
} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.schema-def.ts";
import {vehicleExtraTitles, vehicleFormExtras, vehicleIdFromSearch} from "@carRentalModule/clients/panel/vehicleScope.ts";

export default createGenericCreatePage<CreateVehicleInsuranceFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/insurance/createVehicleInsurance.tsx",
    collectionName: "vehicleinsurances",
    accessModel: "vehicleinsurances",
    apiUrl: "/api/carRental/vehicleInsurance",
    schema: createVehicleInsuranceFormSchema,
    // Renew (from a policy's menu) passes the policy it renews, its insurer and cover.
    defaultValues: (params) => ({
        vehicle: vehicleIdFromSearch(params),
        insurer: params.get("insurer") ?? "",
        policyNumber: "",
        coverage: VEHICLE_INSURANCE_COVERAGES.find((value) => value === params.get("coverage")) ?? "third_party",
        validFrom: "",
        expiresAt: "",
        ...(params.get("renews") ? {supersedes: params.get("renews")!} : {}),
    }),
    buildFormExtras: vehicleFormExtras,
    buildExtraTitles: vehicleExtraTitles,
    submitIcon: <IconPlus />,
});
