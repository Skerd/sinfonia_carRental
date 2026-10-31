import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalDenyEntryFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalDenyEntry/createRentalDenyEntry.form.validator.ts";
import type {CreateRentalDenyEntryFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalDenyEntry/rentalDenyEntry.schema-def.ts";

export default createGenericCreatePage<CreateRentalDenyEntryFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/denyList/createRentalDenyEntry.tsx",
    collectionName: "rentaldenyentrys",
    accessModel: "rentaldenyentrys",
    apiUrl: "/api/carRental/rentalDenyEntry",
    schema: createRentalDenyEntryFormSchema,
    defaultValues: {reason: "", isActive: true},
    submitIcon: <IconPlus />,
});
