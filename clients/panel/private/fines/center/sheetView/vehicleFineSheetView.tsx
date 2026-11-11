import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleFineMenu, {type VehicleFineAction} from "@carRentalModule/clients/panel/private/fines/center/actions/vehicleFineMenu.tsx";
import VehicleFineDialogs from "@carRentalModule/clients/panel/private/fines/center/dialogs/vehicleFineDialogs.tsx";

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
    const [action, setAction] = useState("");
    const access = useAccess("vehiclefines");
    const viewConfig = useViewConfig("vehiclefines", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!vehicleFineProp) return;
        setSheetData(vehicleFineProp);
    }, [vehicleFineProp]);

    const entityId = vehicleFineProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const record = sheetData as VehicleFine;
    const patched = (row: Partial<VehicleFine>) => {
        setSheetData((current) => ({...current, ...row}));
        onSheetRowPatched?.(row);
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/vehicleFine/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                // Named the way people say it, with its code as a badge and its status in tone (UX-01, UX-02).
                headerTitle={<SheetNameTitle name={record.type ? String(resolveLanguageKey(`typeValues.${record.type}`)) : ""} code={record.vehicle?.plate} typeLabel={String(resolveLanguageKey("vehicleFineSubtitle"))} />}
                headerDescription={<StatusBadge tableConfigKey="vehiclefines" field="status" value={record.status} label={String(resolveLanguageKey(`statusValues.${record.status}`))} />}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={`/carRental/fines/edit?vehicleFineId=${entityId}`}
                onSheetRowPatched={(row) => patched(row as Partial<VehicleFine>)}
                // The sheet carries its own actions wherever it opens (list, table, linked record), not only from its card.
                actionMenuAllowCustomChildren
                actionMenuChildren={record.status ? <VehicleFineMenu fine={record} onAction={(next: VehicleFineAction) => setAction(next)} /> : null}
            />
            {action ? <VehicleFineDialogs action={action} fine={record} onClose={() => setAction("")} onUpdated={patched} /> : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/fines/center/sheetView/vehicleFineSheetView.tsx"),
    withDebug(true, true, "vehiclefines"),
)(VehicleFineSheetView);
