import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReportMenuItem, {REPORT_TO_PLATFORM_ACTION} from "@coreModule/components/custom/report/reportMenuItem.tsx";
import {RENTAL_REVIEW_REPORT_KIND} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";
import {ReportDialog} from "@coreModule/components/custom/report/reportButton.tsx";

type RentalReviewSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalReview?: RentalReview;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<RentalReview>) => void;
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
                actionMenuChildren={<ReportMenuItem hidden={asEntity.hiddenByPlatform} onAction={(a: string) => setAction(a)} />}
            />
            {action === REPORT_TO_PLATFORM_ACTION && (
                <ReportDialog kind={RENTAL_REVIEW_REPORT_KIND} recordId={asEntity._id} open onOpenChange={(next) => { if (!next) setAction(""); }} />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reviews/center/sheetView/rentalReviewSheetView.tsx"),
    withDebug(true, true, "rentalreviews"),
)(RentalReviewSheetView);
