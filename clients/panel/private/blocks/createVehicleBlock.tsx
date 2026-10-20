import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleBlockFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/createVehicleBlock.form.validator.ts";
import type {CreateVehicleBlockFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.schema-def.ts";

export default createGenericCreatePage<CreateVehicleBlockFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/blocks/createVehicleBlock.tsx",
    collectionName: "vehicleblocks",
    accessModel: "vehicleblocks",
    apiUrl: "/api/carRental/vehicleBlock",
    schema: createVehicleBlockFormSchema,
    defaultValues: {vehicle: "", startAt: "", endAt: "", reason: "maintenance"},
    submitIcon: <IconPlus />,
});
