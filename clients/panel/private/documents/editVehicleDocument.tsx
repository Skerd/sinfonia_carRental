import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editVehicleDocumentFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/editVehicleDocument.form.validator.ts";
import type {EditVehicleDocumentFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.schema-def.ts";
import type {VehicleDocument} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.dto.ts";

export default createGenericEditPage<VehicleDocument, EditVehicleDocumentFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/documents/editVehicleDocument.tsx",
    collectionName: "vehicledocuments",
    accessModel: "vehicledocuments",
    apiUrl: "/api/carRental/vehicleDocument",
    schema: editVehicleDocumentFormSchema,
    mapEntityData: (data) => ({...data, vehicle: data.vehicle?._id}),
    submitIcon: <Save />,
});
