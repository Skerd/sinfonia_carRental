import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleDamageFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/createVehicleDamage.form.validator.ts";
import type {CreateVehicleDamageFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.schema-def.ts";

export default createGenericCreatePage<CreateVehicleDamageFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/damages/createVehicleDamage.tsx",
    collectionName: "vehicledamages",
    accessModel: "vehicledamages",
    apiUrl: "/api/carRental/vehicleDamage",
    schema: createVehicleDamageFormSchema,
    defaultValues: {vehicle: "", reportedAt: "", area: "front", severity: "minor", description: "", status: "open"},
    submitIcon: <IconPlus />,
});
