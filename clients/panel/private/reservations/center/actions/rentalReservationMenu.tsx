import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconArrowBackUp, IconCalendarPlus, IconCash, IconKey, IconSwitchHorizontal, IconUserOff, IconX} from "@tabler/icons-react";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";

/** The lifecycle moves a reservation allows in its current state, for the row and sheet menus. */
export type RentalReservationAction = "recordPayment" | "handover" | "returnVehicle" | "extend" | "reassignVehicle" | "noShow" | "cancel";

type Props = WithLanguageType & {
    reservation: RentalReservation;
    onAction: (action: RentalReservationAction) => void;
};

function RentalReservationMenu({reservation, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("rentalreservations");
    const canMove = !!write?.status;
    const canTakePayment = !!write?.amountPaid;
    if (reservation.deletedAt) return null;

    const {status} = reservation;
    const due = (reservation.pricing?.grandTotal ?? 0) - (reservation.amountPaid ?? 0);
    const item = (action: RentalReservationAction, Icon: typeof IconCash, destructive = false) => (
        <DropdownMenuItem key={action} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(action); }}>
            <Icon size={16} className={destructive ? "text-destructive" : undefined} />
            <p className={destructive ? "text-destructive" : undefined}>{resolveLanguageKey(action)}</p>
        </DropdownMenuItem>
    );

    return (
        <>
            {canTakePayment && due > 0 && ["confirmed", "in_progress", "completed"].includes(status) && item("recordPayment", IconCash)}
            {canMove && status === "confirmed" && item("handover", IconKey)}
            {canMove && status === "in_progress" && item("returnVehicle", IconArrowBackUp)}
            {canMove && (status === "confirmed" || status === "in_progress") && item("extend", IconCalendarPlus)}
            {canMove && (status === "held" || status === "confirmed") && item("reassignVehicle", IconSwitchHorizontal)}
            {canMove && status === "confirmed" && item("noShow", IconUserOff, true)}
            {canMove && (status === "held" || status === "confirmed") && item("cancel", IconX, true)}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/actions/rentalReservationMenu.tsx"),
    withDebug(true, true, "rentalreservations"),
)(RentalReservationMenu);
