import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalExtra} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalExtraCard from "./center/cardView/rentalExtraCard.tsx";
import RentalExtraSheetView from "./center/sheetView/rentalExtraSheetView.tsx";

export function rentalExtraEditPath(row: {_id: string}) {
    return `/tenancy/systemSettings/rentalExtras/edit?rentalExtraId=${row._id}`;
}

function AllRentalExtras({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<RentalExtra>
            apiUrl="/api/carRental/rentalExtra"
            collectionName="rentalextras"
            accessModel="rentalextras"
            tableConfigKey="rentalextras"
            createPath="/tenancy/systemSettings/rentalExtras/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={rentalExtraEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/extras/center/sheetView/rentalExtraSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <RentalExtraSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    rentalExtra={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <RentalExtraCard
                    rentalExtra={row}
                    onDelete={(deleted: RentalExtra | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/extras/index.tsx"),
    withDebug(true, true, "rentalextras"),
)(AllRentalExtras);
