import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalBusinessAccountFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/editRentalBusinessAccount.form.validator.ts";
import type {EditRentalBusinessAccountFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.schema-def.ts";
import type {RentalBusinessAccount} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.dto.ts";

export default createGenericEditPage<RentalBusinessAccount, EditRentalBusinessAccountFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/businessAccounts/editRentalBusinessAccount.tsx",
    collectionName: "rentalbusinessaccounts",
    accessModel: "rentalbusinessaccounts",
    apiUrl: "/api/carRental/rentalBusinessAccount",
    schema: editRentalBusinessAccountFormSchema,
    mapEntityData: (data) => data,
    submitIcon: <IconDeviceFloppy />,
});
