import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleCategoryFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/editVehicleCategory.form.validator.ts";
import type {EditVehicleCategoryFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.schema-def.ts";
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";

export default createGenericEditPage<VehicleCategory, EditVehicleCategoryFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/categories/editVehicleCategory.tsx",
    collectionName: "vehiclecategories",
    accessModel: "vehiclecategories",
    apiUrl: "/api/carRental/vehicleCategory",
    schema: editVehicleCategoryFormSchema,
    mapEntityData: (data) => ({...data, images: data.images?.map((image) => image._id)}),
    submitIcon: <Save />,
});
