import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalLocationFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/createRentalLocation.form.validator.ts";
import type {CreateRentalLocationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.schema-def.ts";

export default createGenericCreatePage<CreateRentalLocationFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/locations/createRentalLocation.tsx",
    collectionName: "rentallocations",
    accessModel: "rentallocations",
    apiUrl: "/api/carRental/rentalLocation",
    schema: createRentalLocationFormSchema,
    defaultValues: {name: "", timezone: "Europe/Zurich", pickupAllowed: true, returnAllowed: true, openingHours: [], closures: []},
    submitIcon: <IconPlus />,
});
