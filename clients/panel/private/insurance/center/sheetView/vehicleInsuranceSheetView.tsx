import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleInsuranceMenu from "@carRentalModule/clients/panel/private/insurance/center/actions/vehicleInsuranceMenu.tsx";
import VehicleInsuranceDialogs from "@carRentalModule/clients/panel/private/insurance/center/dialogs/vehicleInsuranceDialogs.tsx";

function insuranceStatus(value: unknown): VehicleInsurance["status"] | undefined {
    if (value === "active" || value === "expired" || value === "cancelled") return value;
    return undefined;
}

type VehicleInsuranceSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleInsurance?: VehicleInsurance;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleInsurance>) => void;
    fetchId?: string;
};

function VehicleInsuranceSheetView({
    open,
    onOpenChange,
    vehicleInsurance: vehicleInsuranceProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleInsuranceSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleInsuranceProp || {_id: fetchId});
    const [policy, setPolicy] = useState(vehicleInsuranceProp);
    const [menuAction, setMenuAction] = useState("");
    const access = useAccess("vehicleinsurances");
    const viewConfig = useViewConfig("vehicleinsurances", "sheet");

    useEffect(() => {
        if (!vehicleInsuranceProp) return;
        setSheetData(vehicleInsuranceProp);
        setPolicy(vehicleInsuranceProp);
    }, [vehicleInsuranceProp]);

    const entityId = vehicleInsuranceProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const record = sheetData as VehicleInsurance;

    return (
        <>
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/vehicleInsurance/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => {
                setSheetData(data);
                if (data && typeof data._id === "string") setPolicy(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            // Named the way people say it, with its code as a badge and its status in tone (UX-01, UX-02).
            headerTitle={<SheetNameTitle name={record.insurer ?? ""} code={record.policyNumber} typeLabel={String(resolveLanguageKey("vehicleInsuranceSubtitle"))} />}
            headerDescription={<StatusBadge tableConfigKey="vehicleinsurances" field="status" value={record.status} label={String(resolveLanguageKey(`statusValues.${record.status}`))} />}
            access={access}
            hideActions={hideActions}
            hideEdit={policy?.status === "cancelled"}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={`/carRental/insurance/edit?vehicleInsuranceId=${entityId}`}
            actionMenuAllowCustomChildren
            actionMenuChildren={policy ? <VehicleInsuranceMenu policy={policy} onAction={setMenuAction} /> : undefined}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                const status = insuranceStatus(row.status);
                if (status) setPolicy((current) => (current ? {...current, status} : current));
                onSheetRowPatched?.(row);
            }}
        />
        {policy ? (
            <VehicleInsuranceDialogs
                action={menuAction}
                policy={policy}
                onClose={() => setMenuAction("")}
                onUpdated={(updated) => {
                    setPolicy(updated);
                    setSheetData(updated);
                    onSheetRowPatched?.(updated);
                }}
            />
        ) : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/insurance/center/sheetView/vehicleInsuranceSheetView.tsx"),
    withDebug(true, true, "vehicleinsurances"),
)(VehicleInsuranceSheetView);
