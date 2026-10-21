import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleDamageFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/editVehicleDamage.form.validator.ts";
import type {EditVehicleDamageFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.schema-def.ts";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";

export default createGenericEditPage<VehicleDamage, EditVehicleDamageFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/damages/editVehicleDamage.tsx",
    collectionName: "vehicledamages",
    accessModel: "vehicledamages",
    apiUrl: "/api/carRental/vehicleDamage",
    schema: editVehicleDamageFormSchema,
    mapEntityData: (data) => ({...data, vehicle: data.vehicle?._id, reservation: data.reservation?._id}),
    submitIcon: <Save />,
});
