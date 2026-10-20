import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicle/editVehicle.form.validator.ts";
import type {EditVehicleFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.schema-def.ts";
import type {Vehicle} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.dto.ts";

export default createGenericEditPage<Vehicle, EditVehicleFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/vehicles/editVehicle.tsx",
    collectionName: "vehicles",
    accessModel: "vehicles",
    apiUrl: "/api/carRental/vehicle",
    schema: editVehicleFormSchema,
    mapEntityData: (data) => ({...data, category: data.category?._id, homeLocation: data.homeLocation?._id}),
    submitIcon: <Save />,
});
