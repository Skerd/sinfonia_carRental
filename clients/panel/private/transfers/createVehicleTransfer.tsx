import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleTransferFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/createVehicleTransfer.form.validator.ts";
import type {CreateVehicleTransferFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.schema-def.ts";
import {vehicleExtraTitles, vehicleFormExtras, vehicleIdFromSearch} from "@carRentalModule/clients/panel/vehicleScope.ts";

export default createGenericCreatePage<CreateVehicleTransferFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/transfers/createVehicleTransfer.tsx",
    collectionName: "vehicletransfers",
    accessModel: "vehicletransfers",
    apiUrl: "/api/carRental/vehicleTransfer",
    schema: createVehicleTransferFormSchema,
    defaultValues: (params) => ({vehicle: vehicleIdFromSearch(params), fromLocation: "", toLocation: "", departAt: "", arriveAt: ""}),
    buildFormExtras: vehicleFormExtras,
    buildExtraTitles: vehicleExtraTitles,
    submitIcon: <IconPlus />,
});
