import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalExtra} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateRentalExtra from "@carRentalModule/clients/panel/private/extras/center/actions/activateRentalExtra.tsx";
import DeactivateRentalExtra from "@carRentalModule/clients/panel/private/extras/center/actions/deactivateRentalExtra.tsx";
import ActivateRentalExtraDialog from "@carRentalModule/clients/panel/private/extras/center/dialogs/activateRentalExtraDialog.tsx";
import DeactivateRentalExtraDialog from "@carRentalModule/clients/panel/private/extras/center/dialogs/deactivateRentalExtraDialog.tsx";

type RentalExtraSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalExtra?: RentalExtra;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<RentalExtra>) => void;
    onActiveChanged?: (isActive: boolean) => void;
    fetchId?: string;
};

function RentalExtraSheetView({
    open,
    onOpenChange,
    rentalExtra: rentalExtraProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    onActiveChanged,
    fetchId,
}: RentalExtraSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(rentalExtraProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("rentalextras");
    const viewConfig = useViewConfig("rentalextras", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!rentalExtraProp) return;
        setSheetData(rentalExtraProp);
    }, [rentalExtraProp]);

    const entityId = rentalExtraProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const asEntity = sheetData as RentalExtra;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/rentalExtra/single"
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
                editPath={`/tenancy/systemSettings/rentalExtras/edit?rentalExtraId=${entityId}`}
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<RentalExtra>);
                }}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ActivateRentalExtra entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivateRentalExtra entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activateRentalExtra" && (
                <ActivateRentalExtraDialog
                    open
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: true}));
                        onSheetRowPatched?.({isActive: true});
                        onActiveChanged?.(true);
                    }}
                />
            )}
            {action === "deactivateRentalExtra" && (
                <DeactivateRentalExtraDialog
                    open
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: false}));
                        onSheetRowPatched?.({isActive: false});
                        onActiveChanged?.(false);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/extras/center/sheetView/rentalExtraSheetView.tsx"),
    withDebug(true, true, "rentalextras"),
)(RentalExtraSheetView);
