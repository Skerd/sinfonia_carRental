import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleBlockFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/editVehicleBlock.form.validator.ts";
import type {EditVehicleBlockFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.schema-def.ts";
import type {VehicleBlock} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.dto.ts";

export default createGenericEditPage<VehicleBlock, EditVehicleBlockFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/blocks/editVehicleBlock.tsx",
    collectionName: "vehicleblocks",
    accessModel: "vehicleblocks",
    apiUrl: "/api/carRental/vehicleBlock",
    schema: editVehicleBlockFormSchema,
    mapEntityData: (data) => ({...data, vehicle: data.vehicle?._id}),
    submitIcon: <Save />,
});
