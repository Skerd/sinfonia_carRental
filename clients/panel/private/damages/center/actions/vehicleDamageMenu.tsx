import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconReceipt, IconTool} from "@tabler/icons-react";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";

export type VehicleDamageAction = "scheduleRepair" | "chargeToCustomer";

type Props = WithLanguageType & {
    damage: VehicleDamage;
    onAction: (action: VehicleDamageAction) => void;
};

/**
 * An open damage can be sent to repair; one with a linked booking can be charged to that
 * customer once. Both need the right to change bookings.
 */
function VehicleDamageMenu({damage, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("rentalreservations");
    if (damage.deletedAt || !write?.status) return null;
    const open = (action: VehicleDamageAction) => (e: {preventDefault(): void; stopPropagation(): void}) => {
        e.preventDefault();
        e.stopPropagation();
        onAction(action);
    };
    return (
        <>
            {damage.status === "open" && (
                <DropdownMenuItem onClick={open("scheduleRepair")}>
                    <IconTool size={16} />
                    <p>{resolveLanguageKey("scheduleRepair")}</p>
                </DropdownMenuItem>
            )}
            {damage.reservation && !damage.chargedAmount && (
                <DropdownMenuItem onClick={open("chargeToCustomer")}>
                    <IconReceipt size={16} />
                    <p>{resolveLanguageKey("chargeToCustomer")}</p>
                </DropdownMenuItem>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/damages/center/actions/vehicleDamageMenu.tsx"),
    withDebug(true, true, "vehicledamages"),
)(VehicleDamageMenu);
