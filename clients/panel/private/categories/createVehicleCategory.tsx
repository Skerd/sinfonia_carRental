import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleCategoryFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/createVehicleCategory.form.validator.ts";
import type {CreateVehicleCategoryFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.schema-def.ts";

export default createGenericCreatePage<CreateVehicleCategoryFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/categories/createVehicleCategory.tsx",
    collectionName: "vehiclecategories",
    accessModel: "vehiclecategories",
    apiUrl: "/api/carRental/vehicleCategory",
    schema: createVehicleCategoryFormSchema,
    defaultValues: {name: "", slug: "", seats: 5, transmission: "manual", fuelType: "petrol", dailyRate: 0, mileagePolicy: "unlimited", isPublic: true, features: [], rateSeasons: []},
    submitIcon: <IconPlus />,
});
