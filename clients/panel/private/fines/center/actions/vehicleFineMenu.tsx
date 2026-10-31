import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconFileTypePdf, IconReceipt, IconUserSearch} from "@tabler/icons-react";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import {downloadFineLetter} from "./downloadFineLetter.ts";

export type VehicleFineAction = "matchDriver" | "chargeCustomer";

type Props = WithLanguageType & {
    fine: VehicleFine;
    onAction: (action: VehicleFineAction) => void;
};

/** Find the driver again, charge the customer, or download the letter for the authority. */
function VehicleFineMenu({fine, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("rentalreservations");
    const {read} = useAccess("vehiclefines");
    if (fine.deletedAt) return null;
    const open = (action: VehicleFineAction) => (e: {preventDefault(): void; stopPropagation(): void}) => {
        e.preventDefault();
        e.stopPropagation();
        onAction(action);
    };
    return (
        <>
            {write?.status && !fine.chargedAmount ? (
                <DropdownMenuItem onClick={open("matchDriver")}>
                    <IconUserSearch size={16} />
                    <p>{resolveLanguageKey("matchDriver")}</p>
                </DropdownMenuItem>
            ) : null}
            {write?.status && fine.reservation && !fine.chargedAmount ? (
                <DropdownMenuItem onClick={open("chargeCustomer")}>
                    <IconReceipt size={16} />
                    <p>{resolveLanguageKey("chargeCustomer")}</p>
                </DropdownMenuItem>
            ) : null}
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
