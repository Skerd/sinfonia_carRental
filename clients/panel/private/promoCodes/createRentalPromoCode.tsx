import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalPromoCodeFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalPromoCode/createRentalPromoCode.form.validator.ts";
import type {CreateRentalPromoCodeFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalPromoCode/rentalPromoCode.schema-def.ts";

export default createGenericCreatePage<CreateRentalPromoCodeFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/promoCodes/createRentalPromoCode.tsx",
    collectionName: "rentalpromocodes",
    accessModel: "rentalpromocodes",
    apiUrl: "/api/carRental/rentalPromoCode",
    schema: createRentalPromoCodeFormSchema,
    defaultValues: {code: "", type: "percent", isActive: true},
    submitIcon: <IconPlus />,
});
