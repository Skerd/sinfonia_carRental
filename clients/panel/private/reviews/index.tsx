import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalReviewCard from "./center/cardView/rentalReviewCard.tsx";
import RentalReviewSheetView from "./center/sheetView/rentalReviewSheetView.tsx";
import PublishRentalReview from "./center/actions/publishRentalReview.tsx";
import UnpublishRentalReview from "./center/actions/unpublishRentalReview.tsx";
import PublishRentalReviewDialog from "./center/dialogs/publishRentalReviewDialog.tsx";
import UnpublishRentalReviewDialog from "./center/dialogs/unpublishRentalReviewDialog.tsx";

function AllRentalReviews({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "isPublished",
            label: resolveLanguageKey("fields.isPublished"),
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);
    return (
        <EntityListPage<RentalReview>
            apiUrl="/api/carRental/rentalReview"
            collectionName="rentalreviews"
            accessModel="rentalreviews"
            tableConfigKey="rentalreviews"
            // The customer writes the review and staff only publish it: no create, no edit.
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: true}}
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/reviews/center/sheetView/rentalReviewSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <>
                    <PublishRentalReview entity={entity} onAction={bindRowAction} />
                    <UnpublishRentalReview entity={entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "publishRentalReview") {
                    return (
                        <PublishRentalReviewDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isPublished: true})}
                        />
                    );
                }
                if (action === "unpublishRentalReview") {
                    return (
                        <UnpublishRentalReviewDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isPublished: false})}
                        />
                    );
                }
                return null;
            }}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <RentalReviewSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    rentalReview={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onPublishedChanged={(isPublished: boolean) => listRef.current?.updateRow?.(entity._id, {isPublished})}
                    onSheetRowPatched={(row: Partial<RentalReview>) => listRef.current?.updateRow?.(entity._id, row)}
                />
            )}
            renderCard={(row, onDelete, onRestore, listRef) => (
                <RentalReviewCard
                    rentalReview={row}
                    onDelete={(deleted: RentalReview | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                    onPublishedChanged={(isPublished: boolean) => listRef.current?.updateRow?.(row._id, {isPublished})}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reviews/index.tsx"),
    withDebug(true, true, "rentalreviews"),
)(AllRentalReviews);
