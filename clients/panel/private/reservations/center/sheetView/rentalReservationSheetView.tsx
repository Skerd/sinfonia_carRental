import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type RentalReservationSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalReservation?: RentalReservation;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<RentalReservation>) => void;
    fetchId?: string;
};

function RentalReservationSheetView({
    open,
    onOpenChange,
    rentalReservation: rentalReservationProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: RentalReservationSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(rentalReservationProp || {_id: fetchId});
    const access = useAccess("rentalreservations");
    const viewConfig = useViewConfig("rentalreservations", "sheet");

    useEffect(() => {
        if (!rentalReservationProp) return;
        setSheetData(rentalReservationProp);
    }, [rentalReservationProp]);

    const entityId = rentalReservationProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/carRental/rentalReservation/single"
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
            editPath={""}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<RentalReservation>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/sheetView/rentalReservationSheetView.tsx"),
    withDebug(true, true, "rentalreservations"),
)(RentalReservationSheetView);
