import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {VEHICLE_TRANSFER_STATUSS} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.schema-def.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleTransfer} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleTransferCard from "./center/cardView/vehicleTransferCard.tsx";
import VehicleTransferSheetView from "./center/sheetView/vehicleTransferSheetView.tsx";
import {useVehicleScopedList} from "@carRentalModule/clients/panel/vehicleScope.ts";

export function vehicleTransferEditPath(row: {_id: string}) {
    return `/carRental/transfers/edit?vehicleTransferId=${row._id}`;
}

/** Opened from a car's records menu, the list is that car and the header names it. */
function AllVehicleTransfers({resolveLanguageKey}: WithLanguageType) {
    const scope = useVehicleScopedList(resolveLanguageKey, "/carRental/transfers/create");
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_TRANSFER_STATUSS.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.status.${value}`),
            })),
        },
        ...scope.quickFilters,
        {
            field: "fromLocation",
            label: resolveLanguageKey("fields.fromLocation"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/carRental/rentalLocation/select",
        },
        {
            field: "toLocation",
            label: resolveLanguageKey("fields.toLocation"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/carRental/rentalLocation/select",
        },
    ], [resolveLanguageKey, scope.quickFilters]);
    return (
        <EntityListPage<VehicleTransfer>
            apiUrl="/api/carRental/vehicleTransfer"
            collectionName="vehicletransfers"
            accessModel="vehicletransfers"
            tableConfigKey="vehicletransfers"
            header={(ctx) => (
                <EntityListHeader ctx={ctx} title={scope.headerTitle}>
                    <EntityListCreateButton ctx={ctx} path={scope.createPath} icon={<IconPlus />} />
                </EntityListHeader>
            )}
            buildEditPath={vehicleTransferEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={scope.extraFilters}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/transfers/center/sheetView/vehicleTransferSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleTransferSheetView open={open} onOpenChange={onOpenChange} vehicleTransfer={entity} onDelete={onDelete} onRestore={onRestore} />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleTransferCard
                    vehicleTransfer={row}
                    onDelete={(deleted: VehicleTransfer | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/transfers/index.tsx"),
    withDebug(true, true, "vehicletransfers"),
)(AllVehicleTransfers);
