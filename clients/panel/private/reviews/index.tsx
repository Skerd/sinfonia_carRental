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
import ReportMenuItem, {REPORT_TO_PLATFORM_ACTION} from "@coreModule/components/custom/report/reportMenuItem.tsx";
import {RENTAL_REVIEW_REPORT_KIND} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import {ReportDialog} from "@coreModule/components/custom/report/reportButton.tsx";

function AllRentalReviews({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "hiddenByPlatform",
            label: resolveLanguageKey("fields.hiddenByPlatform"),
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);
    return (
        <EntityListPage<RentalReview>
            apiUrl="/api/carRental/rentalReview"
            collectionName="rentalreviews"
            accessModel="rentalreviews"
            tableConfigKey="rentalreviews"
            // The customer writes the review and it shows at once; staff only report one to the platform (D191): no create,
            // no edit, no delete.
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: true}}
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/reviews/center/sheetView/rentalReviewSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <ReportMenuItem hidden={entity.hiddenByPlatform} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction}) => (
                action === REPORT_TO_PLATFORM_ACTION ? (
                    <ReportDialog kind={RENTAL_REVIEW_REPORT_KIND} recordId={entity._id} open onOpenChange={(next) => { if (!next) resetAction(); }} />
                ) : null
            )}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <RentalReviewSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    rentalReview={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Partial<RentalReview>) => listRef.current?.updateRow?.(entity._id, row)}
                />
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
