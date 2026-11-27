import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import type {EditVehicleCatalogFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/vehicleCatalog.schema-def.ts";
import type {VehicleCatalogEntry} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/vehicleCatalog.dto.ts";
import {editVehicleCatalogFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/editVehicleCatalog.form.validator.ts";

/** Fields a catalog entry edits: whatever the reader may write, the rest left out of the payload. */
const FIELDS = ["level", "order", "bodyStyle", "seats", "doors", "fuelType", "transmission", "yearFrom", "yearTo"] as const;

export default createGenericEditPage<VehicleCatalogEntry, EditVehicleCatalogFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/vehicleCatalog/editVehicleCatalogEntry.tsx",
    collectionName: "vehiclecatalogentries",
    apiUrl: "/api/carRental/vehicleCatalog",
    schema: editVehicleCatalogFormSchema,
    buildInitialValues: (entry, writeFields) => ({
        _id: entry._id,
        // `name` is the English one; the read names the entry in the reader's language, so take it from `names` (D199).
        name: writeFields.name ? entry.names?.en || entry.name : undefined,
        names: writeFields.names ? entry.names : undefined,
        parentEntry: writeFields.parentEntry ? entry.parentEntry?._id : undefined,
        ...Object.fromEntries(FIELDS.filter((field) => writeFields[field]).map((field) => [field, entry[field]])),
    }),
    mapSubmitPayload: (data, {writeFields}) => ({
        _id: data._id,
        ...(writeFields.name ? {name: data.name} : {}),
        ...(writeFields.names && data.names ? {names: data.names} : {}),
        ...(writeFields.parentEntry && data.parentEntry !== undefined ? {parentEntry: data.parentEntry || undefined} : {}),
        ...Object.fromEntries(FIELDS.filter((field) => writeFields[field]).map((field) => [field, data[field]])),
    }),
    submitIcon: <IconDeviceFloppy className="h-4 w-4" />,
});
