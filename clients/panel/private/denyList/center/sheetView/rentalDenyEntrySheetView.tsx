import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalDenyEntry} from "armonia/src/modules/carRental/api/carRental/private/rentalDenyEntry/rentalDenyEntry.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type RentalDenyEntrySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalDenyEntry?: RentalDenyEntry;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<RentalDenyEntry>) => void;
    fetchId?: string;
};

function RentalDenyEntrySheetView({
    open,
    onOpenChange,
    rentalDenyEntry: rentalDenyEntryProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: RentalDenyEntrySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(rentalDenyEntryProp || {_id: fetchId});
    const access = useAccess("rentaldenyentries");
    const viewConfig = useViewConfig("rentaldenyentries", "sheet");

    useEffect(() => {
        if (!rentalDenyEntryProp) return;
        setSheetData(rentalDenyEntryProp);
    }, [rentalDenyEntryProp]);

    const entityId = rentalDenyEntryProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const record = sheetData as RentalDenyEntry;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/rentalDenyEntry/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            // Named the way people say it, with its code as a badge and its status in tone (UX-01, UX-02).
            headerTitle={<SheetNameTitle name={record.email || record.licenseNumber || ""} typeLabel={String(resolveLanguageKey("rentalDenyEntrySubtitle"))} />}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={`/carRental/denyList/edit?rentalDenyEntryId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<RentalDenyEntry>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/denyList/center/sheetView/rentalDenyEntrySheetView.tsx"),
    withDebug(true, true, "rentaldenyentries"),
)(RentalDenyEntrySheetView);
