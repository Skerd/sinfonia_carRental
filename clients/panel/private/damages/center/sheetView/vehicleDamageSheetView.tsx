import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleDamageMenu, {type VehicleDamageAction} from "@carRentalModule/clients/panel/private/damages/center/actions/vehicleDamageMenu.tsx";
import ScheduleRepairDialog from "@carRentalModule/clients/panel/private/damages/center/dialogs/scheduleRepairDialog.tsx";
import ChargeDamageDialog from "@carRentalModule/clients/panel/private/damages/center/dialogs/chargeDamageDialog.tsx";

type VehicleDamageSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleDamage?: VehicleDamage;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleDamage>) => void;
    fetchId?: string;
};

function VehicleDamageSheetView({
    open,
    onOpenChange,
    vehicleDamage: vehicleDamageProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleDamageSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleDamageProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("vehicledamages");
    const viewConfig = useViewConfig("vehicledamages", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!vehicleDamageProp) return;
        setSheetData(vehicleDamageProp);
    }, [vehicleDamageProp]);

    const entityId = vehicleDamageProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const record = sheetData as VehicleDamage;
    const patched = (row: Partial<VehicleDamage>) => {
        setSheetData((current) => ({...current, ...row}));
        onSheetRowPatched?.(row);
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/vehicleDamage/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                // Named the way people say it, with its code as a badge and its status in tone (UX-01, UX-02).
                headerTitle={<SheetNameTitle name={record.area ? [String(resolveLanguageKey(`areaValues.${record.area}`)), record.severity ? String(resolveLanguageKey(`severityValues.${record.severity}`)) : ""].filter(Boolean).join(" · ") : ""} code={record.vehicle?.plate} typeLabel={String(resolveLanguageKey("vehicleDamageSubtitle"))} />}
                headerDescription={<StatusBadge tableConfigKey="vehicledamages" field="status" value={record.status} label={String(resolveLanguageKey(`statusValues.${record.status}`))} />}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={`/carRental/damages/edit?vehicleDamageId=${entityId}`}
                onSheetRowPatched={(row) => patched(row as Partial<VehicleDamage>)}
                // The sheet carries its own actions wherever it opens (list, table, linked record), not only from its card.
                actionMenuAllowCustomChildren
                actionMenuChildren={record.status ? <VehicleDamageMenu damage={record} onAction={(next: VehicleDamageAction) => setAction(next)} /> : null}
            />
            {action === "scheduleRepair" ? <ScheduleRepairDialog damage={record} onClose={() => setAction("")} onUpdated={patched} /> : null}
            {action === "chargeToCustomer" ? <ChargeDamageDialog damage={record} onClose={() => setAction("")} onUpdated={patched} /> : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/damages/center/sheetView/vehicleDamageSheetView.tsx"),
    withDebug(true, true, "vehicledamages"),
)(VehicleDamageSheetView);
