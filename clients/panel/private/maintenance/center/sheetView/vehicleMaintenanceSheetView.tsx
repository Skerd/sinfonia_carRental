import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleMaintenance} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleMaintenanceMenu, {type VehicleMaintenanceAction} from "@carRentalModule/clients/panel/private/maintenance/center/actions/vehicleMaintenanceMenu.tsx";
import VehicleMaintenanceDialogs from "@carRentalModule/clients/panel/private/maintenance/center/dialogs/vehicleMaintenanceDialogs.tsx";

type VehicleMaintenanceSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleMaintenance?: VehicleMaintenance;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleMaintenance>) => void;
    fetchId?: string;
};

function VehicleMaintenanceSheetView({
    open,
    onOpenChange,
    vehicleMaintenance: vehicleMaintenanceProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleMaintenanceSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleMaintenanceProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("vehiclemaintenances");
    const viewConfig = useViewConfig("vehiclemaintenances", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!vehicleMaintenanceProp) return;
        setSheetData(vehicleMaintenanceProp);
    }, [vehicleMaintenanceProp]);

    const entityId = vehicleMaintenanceProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const record = sheetData as VehicleMaintenance;
    const patched = (row: Partial<VehicleMaintenance>) => {
        setSheetData((current) => ({...current, ...row}));
        onSheetRowPatched?.(row);
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/vehicleMaintenance/single"
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
                editPath={`/carRental/maintenance/edit?vehicleMaintenanceId=${entityId}`}
                onSheetRowPatched={(row) => patched(row as Partial<VehicleMaintenance>)}
                // The sheet carries its own actions wherever it opens (list, table, linked record), not only from its card.
                actionMenuAllowCustomChildren
                actionMenuChildren={record.status ? <VehicleMaintenanceMenu record={record} onAction={(next: VehicleMaintenanceAction) => setAction(next)} /> : null}
            />
            {action ? <VehicleMaintenanceDialogs action={action} record={record} onClose={() => setAction("")} onUpdated={patched} /> : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/maintenance/center/sheetView/vehicleMaintenanceSheetView.tsx"),
    withDebug(true, true, "vehiclemaintenances"),
)(VehicleMaintenanceSheetView);
