import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconStar, IconUser, IconWorld} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import RentalReviewSheetView from "@carRentalModule/clients/panel/private/reviews/center/sheetView/rentalReviewSheetView.tsx";
import {rentalReviewEditPath} from "@carRentalModule/clients/panel/private/reviews/index.tsx";

type RentalReviewCardProps = WithLanguageType & {
    rentalReview: RentalReview;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: RentalReview, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalReview> | null>;
};

function RentalReviewCard({
    rentalReview,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: RentalReviewCardProps) {
    return (
        <EntityCard
            resource="rentalreviews"
            entity={rentalReview}
            fetchId={fetchId}
            singleUrl="/api/carRental/rentalReview/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rentalReviewEditPath}
            Sheet={RentalReviewSheetView}
            sheetEntityProp="rentalReview"
            deleteUrl="/api/carRental/rentalReview"
            restoreUrl="/api/carRental/rentalReview/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="authorName"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="authorName" title={row.authorName} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("reservation")}
                            tooltip={resolveLanguageKey("reservation")}
                            path="reservation"
                            value={row.reservation?.number}
                        />
                        <EntityCardRow
                            icon={IconStar}
                            label={resolveLanguageKey("rating")}
                            tooltip={resolveLanguageKey("rating")}
                            path="rating"
                            type="number"
                            value={row.rating}
                        />
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("authorName")}
                            tooltip={resolveLanguageKey("authorName")}
                            path="authorName"
                            value={row.authorName}
                        />
                        <EntityCardRow
                            icon={IconWorld}
                            label={resolveLanguageKey("isPublished")}
                            tooltip={resolveLanguageKey("isPublished")}
                            path="isPublished"
                            value={row.isPublished}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reviews/center/cardView/rentalReviewCard.tsx"),
    withDebug(true, true, "rentalreviews"),
)(RentalReviewCard);
