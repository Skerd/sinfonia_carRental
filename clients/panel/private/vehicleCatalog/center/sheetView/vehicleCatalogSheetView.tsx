import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {VehicleCatalogEntry} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/vehicleCatalog.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {vehicleCatalogEditPath} from "@carRentalModule/clients/panel/private/vehicleCatalog/editPath.ts";

export type VehicleCatalogSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** `vehicleCatalogEntry` is how a linked card (a model's make, a car's model) hands the entry over. */
    entry?: VehicleCatalogEntry;
    vehicleCatalogEntry?: VehicleCatalogEntry;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function VehicleCatalogSheetView({
    open,
    onOpenChange,
    entry: entryProp,
    vehicleCatalogEntry,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: VehicleCatalogSheetViewOwnProps & WithLanguageType) {
    const given = entryProp ?? vehicleCatalogEntry;
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(given || {_id: fetchId});
    const access = useAccess("vehiclecatalogentries");
    const viewConfig = useViewConfig("vehiclecatalogentries", "sheet");

    useEffect(() => {
        if (!given) return;
        setSheetData(given);
    }, [given]);

    const entityId = given?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/vehicleCatalog/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={vehicleCatalogEditPath({_id: entityId})}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/vehicleCatalog/center/sheetView/vehicleCatalogSheetView.tsx"),
    withDebug(true, true, "vehiclecatalogentries"),
)(VehicleCatalogSheetView);
