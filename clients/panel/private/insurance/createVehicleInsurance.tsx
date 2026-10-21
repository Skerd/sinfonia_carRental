import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleInsuranceFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/createVehicleInsurance.form.validator.ts";
import type {CreateVehicleInsuranceFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.schema-def.ts";

export default createGenericCreatePage<CreateVehicleInsuranceFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/insurance/createVehicleInsurance.tsx",
    collectionName: "vehicleinsurances",
    accessModel: "vehicleinsurances",
    apiUrl: "/api/carRental/vehicleInsurance",
    schema: createVehicleInsuranceFormSchema,
    defaultValues: {vehicle: "", insurer: "", policyNumber: "", coverage: "third_party", validFrom: "", expiresAt: "", status: "active"},
    submitIcon: <IconPlus />,
});
