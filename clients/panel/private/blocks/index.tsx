import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleBlock} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleBlockCard from "./center/cardView/vehicleBlockCard.tsx";
import VehicleBlockSheetView from "./center/sheetView/vehicleBlockSheetView.tsx";

export function vehicleBlockEditPath(row: {_id: string}) {
    return `/carRental/blocks/edit?vehicleBlockId=${row._id}`;
}

function AllVehicleBlocks({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<VehicleBlock>
            apiUrl="/api/carRental/vehicleBlock"
            collectionName="vehicleblocks"
            accessModel="vehicleblocks"
            tableConfigKey="vehicleblocks"
            createPath="/carRental/blocks/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleBlockEditPath}
            resolveLanguageKey={resolveLanguageKey}
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
