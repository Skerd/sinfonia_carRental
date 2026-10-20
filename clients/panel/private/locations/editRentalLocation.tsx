import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalLocationFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/editRentalLocation.form.validator.ts";
import type {EditRentalLocationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.schema-def.ts";
import type {RentalLocation} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.dto.ts";

export default createGenericEditPage<RentalLocation, EditRentalLocationFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/locations/editRentalLocation.tsx",
    collectionName: "rentallocations",
    accessModel: "rentallocations",
    apiUrl: "/api/carRental/rentalLocation",
    schema: editRentalLocationFormSchema,
    mapEntityData: (data) => ({
        ...data,
        address: data.address ? {...data.address, country: data.address.country?._id, city: data.address.city?._id} : undefined,
    }),
    submitIcon: <Save />,
});
