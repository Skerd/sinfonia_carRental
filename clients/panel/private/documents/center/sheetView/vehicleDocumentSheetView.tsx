import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleDocument} from "armonia/src/modules/carRental/api/carRental/private/vehicleDocument/vehicleDocument.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleDocumentMenu from "@carRentalModule/clients/panel/private/documents/center/actions/vehicleDocumentMenu.tsx";

type VehicleDocumentSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleDocument?: VehicleDocument;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleDocument>) => void;
    fetchId?: string;
};

function VehicleDocumentSheetView({
    open,
    onOpenChange,
    vehicleDocument: vehicleDocumentProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleDocumentSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleDocumentProp || {_id: fetchId});
    const access = useAccess("vehicledocuments");
    const viewConfig = useViewConfig("vehicledocuments", "sheet");

    useEffect(() => {
        if (!vehicleDocumentProp) return;
        setSheetData(vehicleDocumentProp);
    }, [vehicleDocumentProp]);

    const entityId = vehicleDocumentProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const record = sheetData as VehicleDocument;
    const patched = (row: Partial<VehicleDocument>) => {
        setSheetData((current) => ({...current, ...row}));
        onSheetRowPatched?.(row);
    };

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/vehicleDocument/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            // Named the way people say it, with its code as a badge and its status in tone (UX-01, UX-02).
            headerTitle={<SheetNameTitle name={record.type ? String(resolveLanguageKey(`typeValues.${record.type}`)) : ""} code={record.vehicle?.plate} typeLabel={String(resolveLanguageKey("vehicleDocumentSubtitle"))} />}
            headerDescription={<StatusBadge tableConfigKey="vehicledocuments" field="status" value={record.status} label={String(resolveLanguageKey(`statusValues.${record.status}`))} />}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={`/carRental/documents/edit?vehicleDocumentId=${entityId}`}
            onSheetRowPatched={(row) => patched(row as Partial<VehicleDocument>)}
            // The sheet carries its own actions wherever it opens (list, table, linked record), not only from its card.
            actionMenuAllowCustomChildren
            actionMenuChildren={record.status ? <VehicleDocumentMenu document={record} /> : null}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/documents/center/sheetView/vehicleDocumentSheetView.tsx"),
    withDebug(true, true, "vehicledocuments"),
)(VehicleDocumentSheetView);
