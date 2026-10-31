import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleFineCard from "./center/cardView/vehicleFineCard.tsx";
import VehicleFineSheetView from "./center/sheetView/vehicleFineSheetView.tsx";

export function vehicleFineEditPath(row: {_id: string}) {
    return `/carRental/fines/edit?vehicleFineId=${row._id}`;
}

/** `vehicleId` narrows the list to one car (opened from that car's records menu). */
function AllVehicleFines({resolveLanguageKey, vehicleId}: WithLanguageType & {vehicleId?: string}) {
    return (
        <EntityListPage<VehicleFine>
            apiUrl="/api/carRental/vehicleFine"
            collectionName="vehiclefines"
            accessModel="vehiclefines"
            tableConfigKey="vehiclefines"
            createPath="/carRental/fines/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleFineEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={vehicleId ? {vehicle: vehicleId} : undefined}
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
