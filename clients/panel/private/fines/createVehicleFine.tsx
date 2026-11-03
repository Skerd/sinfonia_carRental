import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleFineFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/createVehicleFine.form.validator.ts";
import type {CreateVehicleFineFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.schema-def.ts";
import {vehicleExtraTitles, vehicleFormExtras, vehicleIdFromSearch} from "@carRentalModule/clients/panel/vehicleScope.ts";

export default createGenericCreatePage<CreateVehicleFineFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/fines/createVehicleFine.tsx",
    collectionName: "vehiclefines",
    accessModel: "vehiclefines",
    apiUrl: "/api/carRental/vehicleFine",
    schema: createVehicleFineFormSchema,
    defaultValues: (params) => ({reference: "", vehicle: vehicleIdFromSearch(params), offenceAt: "", type: "speeding", authority: ""}),
    buildFormExtras: vehicleFormExtras,
    buildExtraTitles: vehicleExtraTitles,
    submitIcon: <IconPlus />,
});
