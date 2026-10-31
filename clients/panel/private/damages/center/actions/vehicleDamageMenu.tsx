import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconReceipt} from "@tabler/icons-react";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";

export type VehicleDamageAction = "chargeToCustomer";

type Props = WithLanguageType & {
    damage: VehicleDamage;
    onAction: (action: VehicleDamageAction) => void;
};

/** Charging a damage needs a linked booking and the right to change bookings. */
function VehicleDamageMenu({damage, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("rentalreservations");
    if (damage.deletedAt || !damage.reservation || damage.chargedAmount || !write?.status) return null;
    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction("chargeToCustomer"); }}>
            <IconReceipt size={16} />
            <p>{resolveLanguageKey("chargeToCustomer")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/damages/center/actions/vehicleDamageMenu.tsx"),
    withDebug(true, true, "vehicledamages"),
)(VehicleDamageMenu);
