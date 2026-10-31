import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleFineFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/editVehicleFine.form.validator.ts";
import type {EditVehicleFineFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.schema-def.ts";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";

export default createGenericEditPage<VehicleFine, EditVehicleFineFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/fines/editVehicleFine.tsx",
    collectionName: "vehiclefines",
    accessModel: "vehiclefines",
    apiUrl: "/api/carRental/vehicleFine",
    schema: editVehicleFineFormSchema,
    mapEntityData: (data) => ({...data, vehicle: data.vehicle?._id}),
    submitIcon: <Save />,
});
