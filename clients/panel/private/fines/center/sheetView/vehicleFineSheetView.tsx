import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type VehicleFineSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleFine?: VehicleFine;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleFine>) => void;
    fetchId?: string;
};

function VehicleFineSheetView({
    open,
    onOpenChange,
    vehicleFine: vehicleFineProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleFineSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleFineProp || {_id: fetchId});
    const access = useAccess("vehiclefines");
    const viewConfig = useViewConfig("vehiclefines", "sheet");

    useEffect(() => {
        if (!vehicleFineProp) return;
        setSheetData(vehicleFineProp);
    }, [vehicleFineProp]);

    const entityId = vehicleFineProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/vehicleFine/single"
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
            editPath={`/carRental/fines/edit?vehicleFineId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<VehicleFine>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/fines/center/sheetView/vehicleFineSheetView.tsx"),
    withDebug(true, true, "vehiclefines"),
)(VehicleFineSheetView);
