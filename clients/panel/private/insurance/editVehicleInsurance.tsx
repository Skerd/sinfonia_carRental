import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleInsuranceFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/editVehicleInsurance.form.validator.ts";
import type {EditVehicleInsuranceFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.schema-def.ts";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";

export default createGenericEditPage<VehicleInsurance, EditVehicleInsuranceFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/insurance/editVehicleInsurance.tsx",
    collectionName: "vehicleinsurances",
    accessModel: "vehicleinsurances",
    apiUrl: "/api/carRental/vehicleInsurance",
    schema: editVehicleInsuranceFormSchema,
    mapEntityData: (data) => ({...data, vehicle: data.vehicle?._id}),
    submitIcon: <Save />,
});
