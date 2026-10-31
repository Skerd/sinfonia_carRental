import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalPromoCodeFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalPromoCode/editRentalPromoCode.form.validator.ts";
import type {EditRentalPromoCodeFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalPromoCode/rentalPromoCode.schema-def.ts";
import type {RentalPromoCode} from "armonia/src/modules/carRental/api/carRental/private/rentalPromoCode/rentalPromoCode.dto.ts";

export default createGenericEditPage<RentalPromoCode, EditRentalPromoCodeFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/promoCodes/editRentalPromoCode.tsx",
    collectionName: "rentalpromocodes",
    accessModel: "rentalpromocodes",
    apiUrl: "/api/carRental/rentalPromoCode",
    schema: editRentalPromoCodeFormSchema,
    mapEntityData: (data) => ({...data, category: data.category?._id}),
    submitIcon: <Save />,
});
