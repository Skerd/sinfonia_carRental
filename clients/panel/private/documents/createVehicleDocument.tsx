import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createVehicleDocumentFormSchema} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/createVehicleDocument.form.validator.ts";
import type {CreateVehicleDocumentFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.schema-def.ts";

export default createGenericCreatePage<CreateVehicleDocumentFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/documents/createVehicleDocument.tsx",
    collectionName: "vehicledocuments",
    accessModel: "vehicledocuments",
    apiUrl: "/api/carRental/vehicleDocument",
    schema: createVehicleDocumentFormSchema,
    defaultValues: {vehicle: "", type: "registration", status: "active"},
    submitIcon: <IconPlus />,
});
