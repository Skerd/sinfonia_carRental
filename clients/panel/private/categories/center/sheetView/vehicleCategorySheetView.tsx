import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ShowVehicleCategoryOnWebsite from "@carRentalModule/clients/panel/private/categories/center/actions/showVehicleCategoryOnWebsite.tsx";
import HideVehicleCategoryFromWebsite from "@carRentalModule/clients/panel/private/categories/center/actions/hideVehicleCategoryFromWebsite.tsx";
import ShowVehicleCategoryOnWebsiteDialog from "@carRentalModule/clients/panel/private/categories/center/dialogs/showVehicleCategoryOnWebsiteDialog.tsx";
import HideVehicleCategoryFromWebsiteDialog from "@carRentalModule/clients/panel/private/categories/center/dialogs/hideVehicleCategoryFromWebsiteDialog.tsx";

type VehicleCategorySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleCategory?: VehicleCategory;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<VehicleCategory>) => void;
    fetchId?: string;
};

function VehicleCategorySheetView({
    open,
    onOpenChange,
    vehicleCategory: vehicleCategoryProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: VehicleCategorySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(vehicleCategoryProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("vehiclecategories");
    const viewConfig = useViewConfig("vehiclecategories", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!vehicleCategoryProp) return;
        setSheetData(vehicleCategoryProp);
    }, [vehicleCategoryProp]);

    const entityId = vehicleCategoryProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const asEntity = sheetData as VehicleCategory;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/vehicleCategory/single"
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
                editPath={`/tenancy/systemSettings/vehicleCategories/edit?vehicleCategoryId=${entityId}`}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ShowVehicleCategoryOnWebsite entity={asEntity} onAction={setAction} />
                        <HideVehicleCategoryFromWebsite entity={asEntity} onAction={setAction} />
                    </>
                }
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<VehicleCategory>);
                }}
            />
            {action === "showVehicleCategoryOnWebsite" && (
                <ShowVehicleCategoryOnWebsiteDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isPublic: true}));
                        onSheetRowPatched?.({isPublic: true});
                    }}
                />
            )}
            {action === "hideVehicleCategoryFromWebsite" && (
                <HideVehicleCategoryFromWebsiteDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isPublic: false}));
                        onSheetRowPatched?.({isPublic: false});
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/categories/center/sheetView/vehicleCategorySheetView.tsx"),
    withDebug(true, true, "vehiclecategories"),
)(VehicleCategorySheetView);
