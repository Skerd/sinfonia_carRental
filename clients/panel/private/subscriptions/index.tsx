import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalSubscription} from "armonia/src/modules/carRental/api/carRental/private/rentalSubscription/rentalSubscription.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalSubscriptionCard from "./center/cardView/rentalSubscriptionCard.tsx";
import RentalSubscriptionSheetView from "./center/sheetView/rentalSubscriptionSheetView.tsx";

export function rentalSubscriptionEditPath(row: {_id: string}) {
    return `/carRental/subscriptions/edit?rentalSubscriptionId=${row._id}`;
}

function AllRentalSubscriptions({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<RentalSubscription>
            apiUrl="/api/carRental/rentalSubscription"
            collectionName="rentalsubscriptions"
            accessModel="rentalsubscriptions"
            tableConfigKey="rentalsubscriptions"
            createPath="/carRental/subscriptions/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={rentalSubscriptionEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/subscriptions/center/sheetView/rentalSubscriptionSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <RentalSubscriptionSheetView open={open} onOpenChange={onOpenChange} rentalSubscription={entity} onDelete={onDelete} onRestore={onRestore} />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <RentalSubscriptionCard
                    rentalSubscription={row}
                    onDelete={(deleted: RentalSubscription | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/subscriptions/index.tsx"),
    withDebug(true, true, "rentalsubscriptions"),
)(AllRentalSubscriptions);
