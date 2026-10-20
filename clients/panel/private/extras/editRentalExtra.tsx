import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalExtraFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/editRentalExtra.form.validator.ts";
import type {EditRentalExtraFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.schema-def.ts";
import type {RentalExtra} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.dto.ts";

export default createGenericEditPage<RentalExtra, EditRentalExtraFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/extras/editRentalExtra.tsx",
    collectionName: "rentalextras",
    accessModel: "rentalextras",
    apiUrl: "/api/carRental/rentalExtra",
    schema: editRentalExtraFormSchema,
    submitIcon: <Save />,
});
