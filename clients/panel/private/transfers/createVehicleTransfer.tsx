import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleTransferFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/createVehicleTransfer.form.validator.ts";
import type {CreateVehicleTransferFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.schema-def.ts";

export default createGenericCreatePage<CreateVehicleTransferFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/transfers/createVehicleTransfer.tsx",
    collectionName: "vehicletransfers",
    accessModel: "vehicletransfers",
    apiUrl: "/api/carRental/vehicleTransfer",
    schema: createVehicleTransferFormSchema,
    defaultValues: {vehicle: "", fromLocation: "", toLocation: "", departAt: "", arriveAt: ""},
    submitIcon: <IconPlus />,
});
