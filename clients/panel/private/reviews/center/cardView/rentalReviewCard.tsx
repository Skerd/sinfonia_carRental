import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconStar} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import RentalReviewSheetView from "@carRentalModule/clients/panel/private/reviews/center/sheetView/rentalReviewSheetView.tsx";
import ReportMenuItem, {REPORT_TO_PLATFORM_ACTION} from "@coreModule/components/custom/report/reportMenuItem.tsx";
import {RENTAL_REVIEW_REPORT_KIND} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import {ReportDialog} from "@coreModule/components/custom/report/reportButton.tsx";
import PlatformHiddenBadge from "@coreModule/components/custom/report/platformHiddenBadge.tsx";

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
            hideEdit
            editPath={() => ""}
            Sheet={RentalReviewSheetView}
            sheetEntityProp="rentalReview"
            deleteUrl="/api/carRental/rentalReview"
            restoreUrl="/api/carRental/rentalReview/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="authorName"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<RentalReview>) => setEntity({...entity, ...row}),
            })}
            extraDialogs={({action, setAction, entity}) => (
                action === REPORT_TO_PLATFORM_ACTION ? (
                    <ReportDialog kind={RENTAL_REVIEW_REPORT_KIND} recordId={entity._id} open onOpenChange={(next) => { if (!next) setAction(""); }} />
                ) : null
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="authorName"
                        title={row.authorName}
                        badgesBesideTitle
                        badges=<PlatformHiddenBadge hidden={row.hiddenByPlatform} />>
                        <ReportMenuItem hidden={row.hiddenByPlatform} onAction={setAction} />
                    </EntityCard.Header>
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
                            value={"★".repeat(Math.round(row.rating)) + "☆".repeat(Math.max(0, 5 - Math.round(row.rating)))}
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
