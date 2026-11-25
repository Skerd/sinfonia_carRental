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
import PublishRentalReview from "@carRentalModule/clients/panel/private/reviews/center/actions/publishRentalReview.tsx";
import UnpublishRentalReview from "@carRentalModule/clients/panel/private/reviews/center/actions/unpublishRentalReview.tsx";
import PublishRentalReviewDialog from "@carRentalModule/clients/panel/private/reviews/center/dialogs/publishRentalReviewDialog.tsx";
import UnpublishRentalReviewDialog from "@carRentalModule/clients/panel/private/reviews/center/dialogs/unpublishRentalReviewDialog.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";

type RentalReviewCardProps = WithLanguageType & {
    rentalReview: RentalReview;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: RentalReview, response?: DeletedData) => void;
    onRestore?: () => void;
    onPublishedChanged?: (isPublished: boolean) => void;
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
    onPublishedChanged,
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
                onPublishedChanged: (isPublished: boolean) => {
                    setEntity({...entity, isPublished});
                    onPublishedChanged?.(isPublished);
                },
                onSheetRowPatched: (row: Partial<RentalReview>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isPublished === "boolean") onPublishedChanged?.(row.isPublished);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "publishRentalReview" && (
                        <PublishRentalReviewDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isPublished: true});
                                onPublishedChanged?.(true);
                            }}
                        />
                    )}
                    {action === "unpublishRentalReview" && (
                        <UnpublishRentalReviewDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isPublished: false});
                                onPublishedChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="authorName"
                        title={row.authorName}
                        badgesBesideTitle
                        badges={!row.isPublished ? <Badge variant="outline" className="text-xs">{String(resolveLanguageKey("notPublished"))}</Badge> : null}>
                        <PublishRentalReview entity={row} onAction={setAction} />
                        <UnpublishRentalReview entity={row} onAction={setAction} />
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
