import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalLocation} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalLocationCard from "./center/cardView/rentalLocationCard.tsx";
import RentalLocationSheetView from "./center/sheetView/rentalLocationSheetView.tsx";

export function rentalLocationEditPath(row: {_id: string}) {
    return `/carRental/locations/edit?rentalLocationId=${row._id}`;
}

function AllRentalLocations({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<RentalLocation>
            apiUrl="/api/carRental/rentalLocation"
            collectionName="rentallocations"
            accessModel="rentallocations"
            tableConfigKey="rentallocations"
            createPath="/carRental/locations/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={rentalLocationEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/locations/center/sheetView/rentalLocationSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <RentalLocationSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    rentalLocation={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <RentalLocationCard
                    rentalLocation={row}
                    onDelete={(deleted: RentalLocation | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/locations/index.tsx"),
    withDebug(true, true, "rentallocations"),
)(AllRentalLocations);
