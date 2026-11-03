import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconCash, IconFileTypePdf, IconGavel, IconReceipt, IconSend, IconUserSearch, IconX} from "@tabler/icons-react";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import {downloadFineLetter} from "./downloadFineLetter.ts";

export type VehicleFineAction = "matchDriver" | "chargeCustomer" | "nominateDriver" | "recordPayment" | "dispute" | "annul";

type Props = WithLanguageType & {
    fine: VehicleFine;
    onAction: (action: VehicleFineAction) => void;
};

/**
 * The steps a fine's status allows: find the driver again, recharge it to the booking or
 * name the driver to the authority, record what the company paid, contest or annul it,
 * and download the letter for the authority.
 */
function VehicleFineMenu({fine, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("rentalreservations");
    const {read} = useAccess("vehiclefines");
    if (fine.deletedAt) return null;
    const open = (action: VehicleFineAction) => (e: {preventDefault(): void; stopPropagation(): void}) => {
        e.preventDefault();
        e.stopPropagation();
        onAction(action);
    };
    const item = (action: VehicleFineAction, Icon: typeof IconX, destructive = false) => (
        <DropdownMenuItem key={action} onClick={open(action)}>
            <Icon size={16} className={destructive ? "text-destructive" : undefined} />
            <p className={destructive ? "text-destructive" : undefined}>{resolveLanguageKey(action)}</p>
        </DropdownMenuItem>
    );
    const status = fine.status;
    // Not yet charged, named, paid, contested or annulled.
    const undecided = status === "received" || status === "driver_identified";
    return (
        <>
            {write?.status && (undecided || status === "disputed") && item("matchDriver", IconUserSearch)}
            {write?.status && status === "driver_identified" && fine.reservation && item("chargeCustomer", IconReceipt)}
            {write?.status && status === "driver_identified" && item("nominateDriver", IconSend)}
            {write?.status && (undecided || status === "charged") && !fine.paidAt && item("recordPayment", IconCash)}
            {write?.status && undecided && !fine.paidAt && item("dispute", IconGavel)}
            {write?.status && status !== "cancelled" && status !== "paid_by_company" && !fine.paidAt && item("annul", IconX, true)}
            {read?.driverName ? (
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); void downloadFineLetter(fine); }}>
                    <IconFileTypePdf size={16} />
                    <p>{resolveLanguageKey("driverLetter")}</p>
                </DropdownMenuItem>
            ) : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/fines/center/actions/vehicleFineMenu.tsx"),
    withDebug(true, true, "vehiclefines"),
)(VehicleFineMenu);
