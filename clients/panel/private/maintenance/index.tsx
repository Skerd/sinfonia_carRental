import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {VEHICLE_MAINTENANCE_STATUSES, VEHICLE_MAINTENANCE_TYPES} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.schema-def.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleMaintenance} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleMaintenanceCard from "./center/cardView/vehicleMaintenanceCard.tsx";
import VehicleMaintenanceSheetView from "./center/sheetView/vehicleMaintenanceSheetView.tsx";
import {useVehicleScopedList} from "@carRentalModule/clients/panel/vehicleScope.ts";

export function vehicleMaintenanceEditPath(row: {_id: string}) {
    return `/carRental/maintenance/edit?vehicleMaintenanceId=${row._id}`;
}

/** Opened from a car's records menu, the list is that car and the header names it. */
function AllVehicleMaintenances({resolveLanguageKey}: WithLanguageType) {
    const scope = useVehicleScopedList(resolveLanguageKey, "/carRental/maintenance/create");
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_MAINTENANCE_STATUSES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.status.${value}`),
            })),
        },
        {
            field: "type",
            label: resolveLanguageKey("fields.type"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_MAINTENANCE_TYPES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.type.${value}`),
            })),
        },
        ...scope.quickFilters,
    ], [resolveLanguageKey, scope.quickFilters]);
    return (
        <EntityListPage<VehicleMaintenance>
            apiUrl="/api/carRental/vehicleMaintenance"
            collectionName="vehiclemaintenances"
            accessModel="vehiclemaintenances"
            tableConfigKey="vehiclemaintenances"
            createPath={scope.createPath}
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleMaintenanceEditPath}
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={scope.headerTitle}
            extraFilters={scope.extraFilters}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/maintenance/center/sheetView/vehicleMaintenanceSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleMaintenanceSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    vehicleMaintenance={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleMaintenanceCard
                    vehicleMaintenance={row}
                    onDelete={(deleted: VehicleMaintenance | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/maintenance/index.tsx"),
    withDebug(true, true, "vehiclemaintenances"),
)(AllVehicleMaintenances);
