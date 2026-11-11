import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleTransfer} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleTransferMenu, {type VehicleTransferAction} from "@carRentalModule/clients/panel/private/transfers/center/actions/vehicleTransferMenu.tsx";
import VehicleTransferDialogs from "@carRentalModule/clients/panel/private/transfers/center/dialogs/vehicleTransferDialogs.tsx";

type VehicleTransferSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleTransfer?: VehicleTransfer;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleTransfer>) => void;
    fetchId?: string;
};

function VehicleTransferSheetView({
    open,
    onOpenChange,
    vehicleTransfer: vehicleTransferProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleTransferSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleTransferProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("vehicletransfers");
    const viewConfig = useViewConfig("vehicletransfers", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!vehicleTransferProp) return;
        setSheetData(vehicleTransferProp);
    }, [vehicleTransferProp]);

    const entityId = vehicleTransferProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const record = sheetData as VehicleTransfer;
    const patched = (row: Partial<VehicleTransfer>) => {
        setSheetData((current) => ({...current, ...row}));
        onSheetRowPatched?.(row);
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/vehicleTransfer/single"
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
                editPath={`/carRental/transfers/edit?vehicleTransferId=${entityId}`}
                onSheetRowPatched={(row) => patched(row as Partial<VehicleTransfer>)}
                // The sheet carries its own actions wherever it opens (list, table, linked record), not only from its card.
                actionMenuAllowCustomChildren
                actionMenuChildren={record.status ? <VehicleTransferMenu transfer={record} onAction={(next: VehicleTransferAction) => setAction(next)} /> : null}
            />
            {action ? <VehicleTransferDialogs action={action} transfer={record} onClose={() => setAction("")} onUpdated={patched} /> : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/transfers/center/sheetView/vehicleTransferSheetView.tsx"),
    withDebug(true, true, "vehicletransfers"),
)(VehicleTransferSheetView);
