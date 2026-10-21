import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleMaintenanceFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/editVehicleMaintenance.form.validator.ts";
import type {EditVehicleMaintenanceFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.schema-def.ts";
import type {VehicleMaintenance} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.dto.ts";

export default createGenericEditPage<VehicleMaintenance, EditVehicleMaintenanceFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/maintenance/editVehicleMaintenance.tsx",
    collectionName: "vehiclemaintenances",
    accessModel: "vehiclemaintenances",
    apiUrl: "/api/carRental/vehicleMaintenance",
    schema: editVehicleMaintenanceFormSchema,
    mapEntityData: (data) => ({...data, vehicle: data.vehicle?._id}),
    submitIcon: <Save />,
});
