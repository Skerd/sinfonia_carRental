import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type VehicleCategorySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleCategory?: VehicleCategory;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleCategory>) => void;
    fetchId?: string;
};

function VehicleCategorySheetView({
    open,
    onOpenChange,
    vehicleCategory: vehicleCategoryProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleCategorySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleCategoryProp || {_id: fetchId});
    const access = useAccess("vehiclecategories");
    const viewConfig = useViewConfig("vehiclecategories", "sheet");

    useEffect(() => {
        if (!vehicleCategoryProp) return;
        setSheetData(vehicleCategoryProp);
    }, [vehicleCategoryProp]);

    const entityId = vehicleCategoryProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/vehicleCategory/single"
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
            editPath={`/tenancy/systemSettings/vehicleCategories/edit?vehicleCategoryId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<VehicleCategory>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/categories/center/sheetView/vehicleCategorySheetView.tsx"),
    withDebug(true, true, "vehiclecategories"),
)(VehicleCategorySheetView);
