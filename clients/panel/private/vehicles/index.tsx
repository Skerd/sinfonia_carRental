import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {VEHICLE_READINESS, VEHICLE_STATUSES} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.schema-def.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Vehicle} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleCard from "./center/cardView/vehicleCard.tsx";
import VehicleSheetView from "./center/sheetView/vehicleSheetView.tsx";

export function vehicleEditPath(row: {_id: string}) {
    return `/carRental/vehicles/edit?vehicleId=${row._id}`;
}

function AllVehicles({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_STATUSES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.status.${value}`),
            })),
        },
        {
            field: "readiness",
            label: resolveLanguageKey("fields.readiness"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_READINESS.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.readiness.${value}`),
            })),
        },
        {
            field: "category",
            label: resolveLanguageKey("fields.category"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/carRental/vehicleCategory/select",
        },
        {
            field: "homeLocation",
            label: resolveLanguageKey("fields.homeLocation"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/carRental/rentalLocation/select",
        },
    ], [resolveLanguageKey]);
    return (
        <EntityListPage<Vehicle>
            apiUrl="/api/carRental/vehicle"
            collectionName="vehicles"
            accessModel="vehicles"
            tableConfigKey="vehicles"
            header={(ctx) => (
                <EntityListHeader ctx={ctx}>
                    <EntityListCreateButton
                        ctx={ctx}
                        path="/carRental/vehicles/create"
                        icon={<IconPlus />}
                    />
                </EntityListHeader>
            )}
            buildEditPath={vehicleEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/vehicles/center/sheetView/vehicleSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    vehicle={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleCard
                    vehicle={row}
                    onDelete={(deleted: Vehicle | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/vehicles/index.tsx"),
    withDebug(true, true, "vehicles"),
)(AllVehicles);
