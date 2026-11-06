import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleTransferFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/editVehicleTransfer.form.validator.ts";
import type {EditVehicleTransferFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.schema-def.ts";
import type {VehicleTransfer} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.dto.ts";

export default createGenericEditPage<VehicleTransfer, EditVehicleTransferFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/transfers/editVehicleTransfer.tsx",
    collectionName: "vehicletransfers",
    accessModel: "vehicletransfers",
    apiUrl: "/api/carRental/vehicleTransfer",
    schema: editVehicleTransferFormSchema,
    mapEntityData: (data) => ({...data, vehicle: data.vehicle?._id, fromLocation: data.fromLocation?._id, toLocation: data.toLocation?._id, driver: data.driver?._id}),
    submitIcon: <IconDeviceFloppy />,
});
