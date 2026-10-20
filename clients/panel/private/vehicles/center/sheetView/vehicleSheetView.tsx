import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {Vehicle} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type VehicleSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle?: Vehicle;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<Vehicle>) => void;
    fetchId?: string;
};

function VehicleSheetView({
    open,
    onOpenChange,
    vehicle: vehicleProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleProp || {_id: fetchId});
    const access = useAccess("vehicles");
    const viewConfig = useViewConfig("vehicles", "sheet");

    useEffect(() => {
        if (!vehicleProp) return;
        setSheetData(vehicleProp);
    }, [vehicleProp]);

    const entityId = vehicleProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/vehicle/single"
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
            editPath={`/carRental/vehicles/edit?vehicleId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<Vehicle>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/vehicles/center/sheetView/vehicleSheetView.tsx"),
    withDebug(true, true, "vehicles"),
)(VehicleSheetView);
