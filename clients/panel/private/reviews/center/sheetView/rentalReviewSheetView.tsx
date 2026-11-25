import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PublishRentalReview from "@carRentalModule/clients/panel/private/reviews/center/actions/publishRentalReview.tsx";
import UnpublishRentalReview from "@carRentalModule/clients/panel/private/reviews/center/actions/unpublishRentalReview.tsx";
import PublishRentalReviewDialog from "@carRentalModule/clients/panel/private/reviews/center/dialogs/publishRentalReviewDialog.tsx";
import UnpublishRentalReviewDialog from "@carRentalModule/clients/panel/private/reviews/center/dialogs/unpublishRentalReviewDialog.tsx";

type RentalReviewSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalReview?: RentalReview;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<RentalReview>) => void;
    onPublishedChanged?: (isPublished: boolean) => void;
    fetchId?: string;
};

function RentalReviewSheetView({
    open,
    onOpenChange,
    rentalReview: rentalReviewProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    onPublishedChanged,
    fetchId,
}: RentalReviewSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(rentalReviewProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("rentalreviews");
    const viewConfig = useViewConfig("rentalreviews", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!rentalReviewProp) return;
        setSheetData(rentalReviewProp);
    }, [rentalReviewProp]);

    const entityId = rentalReviewProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const asEntity = sheetData as RentalReview;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/rentalReview/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                hideEdit
                editPath=""
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<RentalReview>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <PublishRentalReview entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <UnpublishRentalReview entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "publishRentalReview" && (
                <PublishRentalReviewDialog
                    open
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isPublished: true}));
                        onSheetRowPatched?.({isPublished: true});
                        onPublishedChanged?.(true);
                    }}
                />
            )}
            {action === "unpublishRentalReview" && (
                <UnpublishRentalReviewDialog
                    open
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isPublished: false}));
                        onSheetRowPatched?.({isPublished: false});
                        onPublishedChanged?.(false);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reviews/center/sheetView/rentalReviewSheetView.tsx"),
    withDebug(true, true, "rentalreviews"),
)(RentalReviewSheetView);
