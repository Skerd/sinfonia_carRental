import {IconDeviceFloppy} from "@tabler/icons-react";
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
    mapEntityData: (data) => ({
        ...data,
        category: data.category?._id,
        catalogMake: data.catalogMake?._id,
        catalogModel: data.catalogModel?._id,
        homeLocation: data.homeLocation?._id,
        images: data.images?.map((image) => image._id),
        videos: data.videos?.map((video) => video._id),
        listingImages: data.listingImages?.map((image) => image._id),
    }),
    submitIcon: <IconDeviceFloppy />,
});
