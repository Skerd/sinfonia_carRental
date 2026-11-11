import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalSubscription} from "armonia/src/modules/carRental/api/carRental/private/rentalSubscription/rentalSubscription.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type RentalSubscriptionSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalSubscription?: RentalSubscription;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<RentalSubscription>) => void;
    fetchId?: string;
};

function RentalSubscriptionSheetView({
    open,
    onOpenChange,
    rentalSubscription: rentalSubscriptionProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: RentalSubscriptionSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(rentalSubscriptionProp || {_id: fetchId});
    const access = useAccess("rentalsubscriptions");
    const viewConfig = useViewConfig("rentalsubscriptions", "sheet");

    useEffect(() => {
        if (!rentalSubscriptionProp) return;
        setSheetData(rentalSubscriptionProp);
    }, [rentalSubscriptionProp]);

    const entityId = rentalSubscriptionProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const record = sheetData as RentalSubscription;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/rentalSubscription/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            // Named the way people say it, with its code as a badge and its status in tone (UX-01, UX-02).
            headerTitle={<SheetNameTitle name={record.contactName ?? ""} typeLabel={String(resolveLanguageKey("rentalSubscriptionSubtitle"))} />}
            headerDescription={<StatusBadge tableConfigKey="rentalsubscriptions" field="status" value={record.status} label={String(resolveLanguageKey(`statusValues.${record.status}`))} />}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={`/carRental/subscriptions/edit?rentalSubscriptionId=${entityId}`}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<RentalSubscription>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/subscriptions/center/sheetView/rentalSubscriptionSheetView.tsx"),
    withDebug(true, true, "rentalsubscriptions"),
)(RentalSubscriptionSheetView);
