import {IconCirclePlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import type {CreateVehicleCatalogFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/vehicleCatalog.schema-def.ts";
import {createVehicleCatalogFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/createVehicleCatalog.form.validator.ts";
import {VEHICLE_CATALOG_BASE} from "@carRentalModule/clients/panel/private/vehicleCatalog/editPath.ts";

/** A model is what companies miss most, so the form opens on it; a type has no parent, the cleared select sends "". */
export default createGenericCreatePage<CreateVehicleCatalogFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/vehicleCatalog/createVehicleCatalogEntry.tsx",
    collectionName: "vehiclecatalogentries",
    apiUrl: "/api/carRental/vehicleCatalog",
    schema: createVehicleCatalogFormSchema,
    defaultValues: {name: "", level: "model"},
    mapSubmitPayload: (data) => ({
        ...data,
        parentEntry: data.level === "type" ? undefined : data.parentEntry || undefined,
        order: data.order ?? 0,
    }),
    successPath: VEHICLE_CATALOG_BASE,
    submitIcon: <IconCirclePlus className="h-4 w-4" />,
});
