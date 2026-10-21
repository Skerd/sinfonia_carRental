import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleMaintenanceFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/createVehicleMaintenance.form.validator.ts";
import type {CreateVehicleMaintenanceFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.schema-def.ts";

export default createGenericCreatePage<CreateVehicleMaintenanceFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/maintenance/createVehicleMaintenance.tsx",
    collectionName: "vehiclemaintenances",
    accessModel: "vehiclemaintenances",
    apiUrl: "/api/carRental/vehicleMaintenance",
    schema: createVehicleMaintenanceFormSchema,
    defaultValues: {vehicle: "", type: "scheduled_service", status: "completed", serviceDate: ""},
    submitIcon: <IconPlus />,
});
