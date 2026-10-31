import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalPromoCode} from "armonia/src/modules/carRental/api/carRental/private/rentalPromoCode/rentalPromoCode.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type RentalPromoCodeSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalPromoCode?: RentalPromoCode;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<RentalPromoCode>) => void;
    fetchId?: string;
};

function RentalPromoCodeSheetView({
    open,
    onOpenChange,
    rentalPromoCode: rentalPromoCodeProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: RentalPromoCodeSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(rentalPromoCodeProp || {_id: fetchId});
    const access = useAccess("rentalpromocodes");
    const viewConfig = useViewConfig("rentalpromocodes", "sheet");

    useEffect(() => {
        if (!rentalPromoCodeProp) return;
        setSheetData(rentalPromoCodeProp);
    }, [rentalPromoCodeProp]);

    const entityId = rentalPromoCodeProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/rentalPromoCode/single"
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
            editPath={`/tenancy/systemSettings/rentalPromoCodes/edit?rentalPromoCodeId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<RentalPromoCode>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/promoCodes/center/sheetView/rentalPromoCodeSheetView.tsx"),
    withDebug(true, true, "rentalpromocodes"),
)(RentalPromoCodeSheetView);
