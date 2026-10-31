import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalDenyEntry} from "armonia/src/modules/carRental/api/carRental/private/rentalDenyEntry/rentalDenyEntry.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalDenyEntryCard from "./center/cardView/rentalDenyEntryCard.tsx";
import RentalDenyEntrySheetView from "./center/sheetView/rentalDenyEntrySheetView.tsx";

export function rentalDenyEntryEditPath(row: {_id: string}) {
    return `/carRental/denyList/edit?rentalDenyEntryId=${row._id}`;
}

function AllRentalDenyEntrys({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<RentalDenyEntry>
            apiUrl="/api/carRental/rentalDenyEntry"
            collectionName="rentaldenyentrys"
            accessModel="rentaldenyentrys"
            tableConfigKey="rentaldenyentrys"
            createPath="/carRental/denyList/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={rentalDenyEntryEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/denyList/center/sheetView/rentalDenyEntrySheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <RentalDenyEntrySheetView open={open} onOpenChange={onOpenChange} rentalDenyEntry={entity} onDelete={onDelete} onRestore={onRestore} />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <RentalDenyEntryCard
                    rentalDenyEntry={row}
                    onDelete={(deleted: RentalDenyEntry | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/denyList/index.tsx"),
    withDebug(true, true, "rentaldenyentrys"),
)(AllRentalDenyEntrys);
