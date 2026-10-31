import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalReviewCard from "./center/cardView/rentalReviewCard.tsx";
import RentalReviewSheetView from "./center/sheetView/rentalReviewSheetView.tsx";

export function rentalReviewEditPath(row: {_id: string}) {
    return `/carRental/reviews/edit?rentalReviewId=${row._id}`;
}

function AllRentalReviews({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<RentalReview>
            apiUrl="/api/carRental/rentalReview"
            collectionName="rentalreviews"
            accessModel="rentalreviews"
            tableConfigKey="rentalreviews"
            createPath="/carRental/reviews/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={rentalReviewEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/reviews/center/sheetView/rentalReviewSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <RentalReviewSheetView open={open} onOpenChange={onOpenChange} rentalReview={entity} onDelete={onDelete} onRestore={onRestore} />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <RentalReviewCard
                    rentalReview={row}
                    onDelete={(deleted: RentalReview | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reviews/index.tsx"),
    withDebug(true, true, "rentalreviews"),
)(AllRentalReviews);
