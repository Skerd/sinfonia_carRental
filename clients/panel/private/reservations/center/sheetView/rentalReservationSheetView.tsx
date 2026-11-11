import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalReservationMenu, {type RentalReservationAction} from "@carRentalModule/clients/panel/private/reservations/center/actions/rentalReservationMenu.tsx";
import RentalReservationDialogs from "@carRentalModule/clients/panel/private/reservations/center/dialogs/rentalReservationDialogs.tsx";

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

/** Reservations change only through their lifecycle actions, so the sheet owns that menu and has no Edit. */
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
    const [action, setAction] = useState("");
    const access = useAccess("rentalreservations");
    const viewConfig = useViewConfig("rentalreservations", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!rentalReservationProp) return;
        setSheetData(rentalReservationProp);
    }, [rentalReservationProp]);

    const entityId = rentalReservationProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const reservation = sheetData as RentalReservation;
    const patched = (row: Partial<RentalReservation>) => {
        setSheetData((current) => ({...current, ...row}));
        onSheetRowPatched?.(row);
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/rentalReservation/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                // Named the way people say it, with its code as a badge and its status in tone (UX-01, UX-02).
                headerTitle={<SheetNameTitle name={`${reservation.contact?.firstName ?? ""} ${reservation.contact?.lastName ?? ""}`.trim()} code={reservation.number} typeLabel={String(resolveLanguageKey("rentalReservationSubtitle"))} />}
                headerDescription={<StatusBadge tableConfigKey="rentalreservations" field="status" value={reservation.status} label={String(resolveLanguageKey(`statusValues.${reservation.status}`))} />}
                access={access}
                hideActions={hideActions}
                hideEdit
                onDelete={onDelete}
                onRestore={onRestore}
                editPath=""
                onSheetRowPatched={(row) => patched(row as Partial<RentalReservation>)}
                actionMenuAllowCustomChildren
                actionMenuChildren={reservation.status ? <RentalReservationMenu reservation={reservation} onAction={(next: RentalReservationAction) => setAction(next)} /> : null}
            />
            {action ? (
                <RentalReservationDialogs
                    action={action}
                    reservation={reservation}
                    onClose={() => setAction("")}
                    onUpdated={patched}
                />
            ) : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/sheetView/rentalReservationSheetView.tsx"),
    withDebug(true, true, "rentalreservations"),
)(RentalReservationSheetView);
