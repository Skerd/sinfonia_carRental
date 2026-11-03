import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleDocumentFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/createVehicleDocument.form.validator.ts";
import {
    VEHICLE_DOCUMENT_TYPES,
    type CreateVehicleDocumentFormType,
} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.schema-def.ts";
import {vehicleExtraTitles, vehicleFormExtras, vehicleIdFromSearch} from "@carRentalModule/clients/panel/vehicleScope.ts";

export default createGenericCreatePage<CreateVehicleDocumentFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/documents/createVehicleDocument.tsx",
    collectionName: "vehicledocuments",
    accessModel: "vehicledocuments",
    apiUrl: "/api/carRental/vehicleDocument",
    schema: createVehicleDocumentFormSchema,
    // Renew (from a document's menu) passes the document it renews, its type and issuer.
    defaultValues: (params) => ({
        vehicle: vehicleIdFromSearch(params),
        type: VEHICLE_DOCUMENT_TYPES.find((value) => value === params.get("type")) ?? "registration",
        status: "active",
        ...(params.get("issuer") ? {issuer: params.get("issuer")!} : {}),
        ...(params.get("renews") ? {supersedes: params.get("renews")!} : {}),
    }),
    buildFormExtras: vehicleFormExtras,
    buildExtraTitles: vehicleExtraTitles,
    submitIcon: <IconPlus />,
});
