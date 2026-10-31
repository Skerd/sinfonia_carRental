import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalPromoCode} from "armonia/src/modules/carRental/api/carRental/private/rentalPromoCode/rentalPromoCode.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalPromoCodeCard from "./center/cardView/rentalPromoCodeCard.tsx";
import RentalPromoCodeSheetView from "./center/sheetView/rentalPromoCodeSheetView.tsx";

export function rentalPromoCodeEditPath(row: {_id: string}) {
    return `/tenancy/systemSettings/rentalPromoCodes/edit?rentalPromoCodeId=${row._id}`;
}

function AllRentalPromoCodes({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<RentalPromoCode>
            apiUrl="/api/carRental/rentalPromoCode"
            collectionName="rentalpromocodes"
            accessModel="rentalpromocodes"
            tableConfigKey="rentalpromocodes"
            createPath="/tenancy/systemSettings/rentalPromoCodes/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={rentalPromoCodeEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/promoCodes/center/sheetView/rentalPromoCodeSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <RentalPromoCodeSheetView open={open} onOpenChange={onOpenChange} rentalPromoCode={entity} onDelete={onDelete} onRestore={onRestore} />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <RentalPromoCodeCard
                    rentalPromoCode={row}
                    onDelete={(deleted: RentalPromoCode | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/promoCodes/index.tsx"),
    withDebug(true, true, "rentalpromocodes"),
)(AllRentalPromoCodes);
