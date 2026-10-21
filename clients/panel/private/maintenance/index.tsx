import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleMaintenance} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleMaintenanceCard from "./center/cardView/vehicleMaintenanceCard.tsx";
import VehicleMaintenanceSheetView from "./center/sheetView/vehicleMaintenanceSheetView.tsx";

export function vehicleMaintenanceEditPath(row: {_id: string}) {
    return `/carRental/maintenance/edit?vehicleMaintenanceId=${row._id}`;
}

/** `vehicleId` narrows the list to one car (opened from that car's records menu). */
function AllVehicleMaintenances({resolveLanguageKey, vehicleId}: WithLanguageType & {vehicleId?: string}) {
    return (
        <EntityListPage<VehicleMaintenance>
            apiUrl="/api/carRental/vehicleMaintenance"
            collectionName="vehiclemaintenances"
            accessModel="vehiclemaintenances"
            tableConfigKey="vehiclemaintenances"
            createPath="/carRental/maintenance/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleMaintenanceEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={vehicleId ? {vehicle: vehicleId} : undefined}
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
