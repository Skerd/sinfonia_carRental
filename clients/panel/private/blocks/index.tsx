import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {VEHICLE_BLOCK_REASONS} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.schema-def.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleBlock} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleBlockCard from "./center/cardView/vehicleBlockCard.tsx";
import VehicleBlockSheetView from "./center/sheetView/vehicleBlockSheetView.tsx";
import {useVehicleScopedList} from "@carRentalModule/clients/panel/vehicleScope.ts";

export function vehicleBlockEditPath(row: {_id: string}) {
    return `/carRental/blocks/edit?vehicleBlockId=${row._id}`;
}

/** Opened from a car's records menu, the list is that car and the header names it. */
function AllVehicleBlocks({resolveLanguageKey}: WithLanguageType) {
    const scope = useVehicleScopedList(resolveLanguageKey, "/carRental/blocks/create");
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "reason",
            label: resolveLanguageKey("fields.reason"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_BLOCK_REASONS.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.reason.${value}`),
            })),
        },
        ...scope.quickFilters,
    ], [resolveLanguageKey, scope.quickFilters]);
    return (
        <EntityListPage<VehicleBlock>
            apiUrl="/api/carRental/vehicleBlock"
            collectionName="vehicleblocks"
            accessModel="vehicleblocks"
            tableConfigKey="vehicleblocks"
            createPath={scope.createPath}
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleBlockEditPath}
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={scope.headerTitle}
            extraFilters={scope.extraFilters}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/blocks/center/sheetView/vehicleBlockSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleBlockSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    vehicleBlock={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleBlockCard
                    vehicleBlock={row}
                    onDelete={(deleted: VehicleBlock | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/blocks/index.tsx"),
    withDebug(true, true, "vehicleblocks"),
)(AllVehicleBlocks);
