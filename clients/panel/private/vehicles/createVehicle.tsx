import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicle/createVehicle.form.validator.ts";
import type {CreateVehicleFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.schema-def.ts";

export default createGenericCreatePage<CreateVehicleFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/vehicles/createVehicle.tsx",
    collectionName: "vehicles",
    accessModel: "vehicles",
    apiUrl: "/api/carRental/vehicle",
    schema: createVehicleFormSchema,
    defaultValues: {plate: "", make: "", model: "", category: "", homeLocation: "", status: "active"},
    submitIcon: <IconPlus />,
});
