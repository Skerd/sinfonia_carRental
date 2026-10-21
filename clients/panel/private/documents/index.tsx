import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleDocument} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleDocumentCard from "./center/cardView/vehicleDocumentCard.tsx";
import VehicleDocumentSheetView from "./center/sheetView/vehicleDocumentSheetView.tsx";

export function vehicleDocumentEditPath(row: {_id: string}) {
    return `/carRental/documents/edit?vehicleDocumentId=${row._id}`;
}

/** `vehicleId` narrows the list to one car (opened from that car's records menu). */
function AllVehicleDocuments({resolveLanguageKey, vehicleId}: WithLanguageType & {vehicleId?: string}) {
    return (
        <EntityListPage<VehicleDocument>
            apiUrl="/api/carRental/vehicleDocument"
            collectionName="vehicledocuments"
            accessModel="vehicledocuments"
            tableConfigKey="vehicledocuments"
            createPath="/carRental/documents/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleDocumentEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={vehicleId ? {vehicle: vehicleId} : undefined}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/documents/center/sheetView/vehicleDocumentSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleDocumentSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    vehicleDocument={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleDocumentCard
                    vehicleDocument={row}
                    onDelete={(deleted: VehicleDocument | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/documents/index.tsx"),
    withDebug(true, true, "vehicledocuments"),
)(AllVehicleDocuments);
