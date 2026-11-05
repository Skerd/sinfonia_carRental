import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalDenyEntryFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalDenyEntry/editRentalDenyEntry.form.validator.ts";
import type {EditRentalDenyEntryFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalDenyEntry/rentalDenyEntry.schema-def.ts";
import type {RentalDenyEntry} from "armonia/src/modules/carRental/api/carRental/private/rentalDenyEntry/rentalDenyEntry.dto.ts";

export default createGenericEditPage<RentalDenyEntry, EditRentalDenyEntryFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/denyList/editRentalDenyEntry.tsx",
    collectionName: "rentaldenyentries",
    accessModel: "rentaldenyentries",
    apiUrl: "/api/carRental/rentalDenyEntry",
    schema: editRentalDenyEntryFormSchema,
    mapEntityData: (data) => data,
    submitIcon: <Save />,
});
