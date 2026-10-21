import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleDamageCard from "./center/cardView/vehicleDamageCard.tsx";
import VehicleDamageSheetView from "./center/sheetView/vehicleDamageSheetView.tsx";

export function vehicleDamageEditPath(row: {_id: string}) {
    return `/carRental/damages/edit?vehicleDamageId=${row._id}`;
}

/** `vehicleId` narrows the list to one car (opened from that car's records menu). */
function AllVehicleDamages({resolveLanguageKey, vehicleId}: WithLanguageType & {vehicleId?: string}) {
    return (
        <EntityListPage<VehicleDamage>
            apiUrl="/api/carRental/vehicleDamage"
            collectionName="vehicledamages"
            accessModel="vehicledamages"
            tableConfigKey="vehicledamages"
            createPath="/carRental/damages/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleDamageEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={vehicleId ? {vehicle: vehicleId} : undefined}
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
