import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {VEHICLE_FINE_STATUSS, VEHICLE_FINE_TYPES} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.schema-def.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleFineCard from "./center/cardView/vehicleFineCard.tsx";
import VehicleFineSheetView from "./center/sheetView/vehicleFineSheetView.tsx";
import {useVehicleScopedList} from "@carRentalModule/clients/panel/vehicleScope.ts";
import {CARD_PAYMENTS_AVAILABLE} from "armonia/src/modules/finance/helpers/cardPaymentAvailability.ts";

export function vehicleFineEditPath(row: {_id: string}) {
    return `/carRental/fines/edit?vehicleFineId=${row._id}`;
}

/** Opened from a car's records menu, the list is that car and the header names it. */
function AllVehicleFines({resolveLanguageKey}: WithLanguageType) {
    const scope = useVehicleScopedList(resolveLanguageKey, "/carRental/fines/create");
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_FINE_STATUSS.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.status.${value}`),
            })),
        },
        {
            field: "type",
            label: resolveLanguageKey("fields.type"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_FINE_TYPES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.type.${value}`),
            })),
        },
        ...scope.quickFilters,
    ], [resolveLanguageKey, scope.quickFilters]);
    return (
        <EntityListPage<VehicleFine>
            apiUrl="/api/carRental/vehicleFine"
            collectionName="vehiclefines"
            accessModel="vehiclefines"
            tableConfigKey="vehiclefines"
            header={(ctx) => (
                <EntityListHeader ctx={ctx} title={scope.headerTitle} helpKey={CARD_PAYMENTS_AVAILABLE ? undefined : "helpAtDesk"}>
                    <EntityListCreateButton ctx={ctx} path={scope.createPath} icon={<IconPlus />} />
                </EntityListHeader>
            )}
            buildEditPath={vehicleFineEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={scope.extraFilters}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/fines/center/sheetView/vehicleFineSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleFineSheetView open={open} onOpenChange={onOpenChange} vehicleFine={entity} onDelete={onDelete} onRestore={onRestore} />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleFineCard
                    vehicleFine={row}
                    onDelete={(deleted: VehicleFine | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/fines/index.tsx"),
    withDebug(true, true, "vehiclefines"),
)(AllVehicleFines);
