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
    // A new location starts in the company's time zone (UX-06, GLB-09).
    defaultValues: (_params, {timeZone}) => ({name: "", timezone: timeZone, pickupAllowed: true, returnAllowed: true, openingHours: [], closures: []}),
    submitIcon: <IconPlus />,
});
