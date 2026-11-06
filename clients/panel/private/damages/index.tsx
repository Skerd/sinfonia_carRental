import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {VEHICLE_DAMAGE_SEVERITIES, VEHICLE_DAMAGE_STATUSES} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.schema-def.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleDamageCard from "./center/cardView/vehicleDamageCard.tsx";
import VehicleDamageSheetView from "./center/sheetView/vehicleDamageSheetView.tsx";
import {useVehicleScopedList} from "@carRentalModule/clients/panel/vehicleScope.ts";

export function vehicleDamageEditPath(row: {_id: string}) {
    return `/carRental/damages/edit?vehicleDamageId=${row._id}`;
}

/** Opened from a car's records menu, the list is that car and the header names it. */
function AllVehicleDamages({resolveLanguageKey}: WithLanguageType) {
    const scope = useVehicleScopedList(resolveLanguageKey, "/carRental/damages/create");
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_DAMAGE_STATUSES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.status.${value}`),
            })),
        },
        {
            field: "severity",
            label: resolveLanguageKey("fields.severity"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_DAMAGE_SEVERITIES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.severity.${value}`),
            })),
        },
        ...scope.quickFilters,
    ], [resolveLanguageKey, scope.quickFilters]);
    return (
        <EntityListPage<VehicleDamage>
            apiUrl="/api/carRental/vehicleDamage"
            collectionName="vehicledamages"
            accessModel="vehicledamages"
            tableConfigKey="vehicledamages"
            header={(ctx) => (
                <EntityListHeader ctx={ctx} title={scope.headerTitle}>
                    <EntityListCreateButton ctx={ctx} path={scope.createPath} icon={<IconPlus />} />
                </EntityListHeader>
            )}
            buildEditPath={vehicleDamageEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={scope.extraFilters}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/damages/center/sheetView/vehicleDamageSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleDamageSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    vehicleDamage={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleDamageCard
                    vehicleDamage={row}
                    onDelete={(deleted: VehicleDamage | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/damages/index.tsx"),
    withDebug(true, true, "vehicledamages"),
)(AllVehicleDamages);
