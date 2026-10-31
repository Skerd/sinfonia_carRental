import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleTransfer} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleTransferCard from "./center/cardView/vehicleTransferCard.tsx";
import VehicleTransferSheetView from "./center/sheetView/vehicleTransferSheetView.tsx";

export function vehicleTransferEditPath(row: {_id: string}) {
    return `/carRental/transfers/edit?vehicleTransferId=${row._id}`;
}

/** `vehicleId` narrows the list to one car (opened from that car's records menu). */
function AllVehicleTransfers({resolveLanguageKey, vehicleId}: WithLanguageType & {vehicleId?: string}) {
    return (
        <EntityListPage<VehicleTransfer>
            apiUrl="/api/carRental/vehicleTransfer"
            collectionName="vehicletransfers"
            accessModel="vehicletransfers"
            tableConfigKey="vehicletransfers"
            createPath="/carRental/transfers/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleTransferEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={vehicleId ? {vehicle: vehicleId} : undefined}
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
