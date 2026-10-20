import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleBlock} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type VehicleBlockSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleBlock?: VehicleBlock;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleBlock>) => void;
    fetchId?: string;
};

function VehicleBlockSheetView({
    open,
    onOpenChange,
    vehicleBlock: vehicleBlockProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleBlockSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleBlockProp || {_id: fetchId});
    const access = useAccess("vehicleblocks");
    const viewConfig = useViewConfig("vehicleblocks", "sheet");

    useEffect(() => {
        if (!vehicleBlockProp) return;
        setSheetData(vehicleBlockProp);
    }, [vehicleBlockProp]);

    const entityId = vehicleBlockProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/vehicleBlock/single"
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
            editPath={`/carRental/blocks/edit?vehicleBlockId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<VehicleBlock>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/blocks/center/sheetView/vehicleBlockSheetView.tsx"),
    withDebug(true, true, "vehicleblocks"),
)(VehicleBlockSheetView);
