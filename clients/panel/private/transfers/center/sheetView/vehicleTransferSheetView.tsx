import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleTransfer} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

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
    const access = useAccess("vehicletransfers");
    const viewConfig = useViewConfig("vehicletransfers", "sheet");

    useEffect(() => {
        if (!vehicleTransferProp) return;
        setSheetData(vehicleTransferProp);
    }, [vehicleTransferProp]);

    const entityId = vehicleTransferProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
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
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<VehicleTransfer>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/transfers/center/sheetView/vehicleTransferSheetView.tsx"),
    withDebug(true, true, "vehicletransfers"),
)(VehicleTransferSheetView);
