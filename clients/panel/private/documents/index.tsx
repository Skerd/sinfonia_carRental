import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {VEHICLE_DOCUMENT_STATUSES, VEHICLE_DOCUMENT_TYPES} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.schema-def.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleDocument} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleDocumentCard from "./center/cardView/vehicleDocumentCard.tsx";
import VehicleDocumentSheetView from "./center/sheetView/vehicleDocumentSheetView.tsx";
import {useVehicleScopedList} from "@carRentalModule/clients/panel/vehicleScope.ts";

export function vehicleDocumentEditPath(row: {_id: string}) {
    return `/carRental/documents/edit?vehicleDocumentId=${row._id}`;
}

/** Opened from a car's records menu, the list is that car and the header names it. */
function AllVehicleDocuments({resolveLanguageKey}: WithLanguageType) {
    const scope = useVehicleScopedList(resolveLanguageKey, "/carRental/documents/create");
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_DOCUMENT_STATUSES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.status.${value}`),
            })),
        },
        {
            field: "type",
            label: resolveLanguageKey("fields.type"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_DOCUMENT_TYPES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.type.${value}`),
            })),
        },
        ...scope.quickFilters,
    ], [resolveLanguageKey, scope.quickFilters]);
    return (
        <EntityListPage<VehicleDocument>
            apiUrl="/api/carRental/vehicleDocument"
            collectionName="vehicledocuments"
            accessModel="vehicledocuments"
            tableConfigKey="vehicledocuments"
            header={(ctx) => (
                <EntityListHeader ctx={ctx} title={scope.headerTitle}>
                    <EntityListCreateButton ctx={ctx} path={scope.createPath} icon={<IconPlus />} />
                </EntityListHeader>
            )}
            buildEditPath={vehicleDocumentEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={scope.extraFilters}
            quickFilters={quickFilters}
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
