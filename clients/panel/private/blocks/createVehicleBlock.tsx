import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleBlockFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/createVehicleBlock.form.validator.ts";
import type {CreateVehicleBlockFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.schema-def.ts";
import {vehicleExtraTitles, vehicleFormExtras, vehicleIdFromSearch} from "@carRentalModule/clients/panel/vehicleScope.ts";

export default createGenericCreatePage<CreateVehicleBlockFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/blocks/createVehicleBlock.tsx",
    collectionName: "vehicleblocks",
    accessModel: "vehicleblocks",
    apiUrl: "/api/carRental/vehicleBlock",
    schema: createVehicleBlockFormSchema,
    defaultValues: (params) => ({vehicle: vehicleIdFromSearch(params), startAt: "", endAt: "", reason: "maintenance"}),
    buildFormExtras: vehicleFormExtras,
    buildExtraTitles: vehicleExtraTitles,
    submitIcon: <IconPlus />,
});
