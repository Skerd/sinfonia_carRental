import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalBusinessAccountFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/createRentalBusinessAccount.form.validator.ts";
import type {CreateRentalBusinessAccountFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.schema-def.ts";

export default createGenericCreatePage<CreateRentalBusinessAccountFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/businessAccounts/createRentalBusinessAccount.tsx",
    collectionName: "rentalbusinessaccounts",
    accessModel: "rentalbusinessaccounts",
    apiUrl: "/api/carRental/rentalBusinessAccount",
    schema: createRentalBusinessAccountFormSchema,
    defaultValues: {name: "", vatNumber: "", billingEmail: "", isActive: true},
    submitIcon: <IconPlus />,
});
