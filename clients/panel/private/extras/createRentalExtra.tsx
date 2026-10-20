import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalExtraFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/createRentalExtra.form.validator.ts";
import type {CreateRentalExtraFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.schema-def.ts";

export default createGenericCreatePage<CreateRentalExtraFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/extras/createRentalExtra.tsx",
    collectionName: "rentalextras",
    accessModel: "rentalextras",
    apiUrl: "/api/carRental/rentalExtra",
    schema: createRentalExtraFormSchema,
    defaultValues: {name: "", pricing: "per_day", price: 0, maxQuantity: 1, isActive: true},
    submitIcon: <IconPlus />,
});
