import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleFineFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/createVehicleFine.form.validator.ts";
import type {CreateVehicleFineFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.schema-def.ts";

export default createGenericCreatePage<CreateVehicleFineFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/fines/createVehicleFine.tsx",
    collectionName: "vehiclefines",
    accessModel: "vehiclefines",
    apiUrl: "/api/carRental/vehicleFine",
    schema: createVehicleFineFormSchema,
    defaultValues: {reference: "", vehicle: "", offenceAt: "", type: "speeding", authority: ""},
    submitIcon: <IconPlus />,
});
