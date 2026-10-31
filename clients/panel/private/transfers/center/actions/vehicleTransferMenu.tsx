import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconFlag, IconPlayerPlay, IconX} from "@tabler/icons-react";
import type {VehicleTransfer} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.dto.ts";

export type VehicleTransferAction = "start" | "complete" | "cancel";

type Props = WithLanguageType & {transfer: VehicleTransfer; onAction: (action: VehicleTransferAction) => void};

/** Leave, arrive or cancel, as the transfer's status allows. */
function VehicleTransferMenu({transfer, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("rentalreservations");
    if (transfer.deletedAt || !write?.status) return null;
    const item = (action: VehicleTransferAction, Icon: typeof IconFlag, destructive = false) => (
        <DropdownMenuItem key={action} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(action); }}>
            <Icon size={16} className={destructive ? "text-destructive" : undefined} />
            <p className={destructive ? "text-destructive" : undefined}>{resolveLanguageKey(action)}</p>
        </DropdownMenuItem>
    );
    return (
        <>
            {transfer.status === "planned" && item("start", IconPlayerPlay)}
            {(transfer.status === "planned" || transfer.status === "in_transit") && item("complete", IconFlag)}
            {transfer.status === "planned" && item("cancel", IconX, true)}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/transfers/center/actions/vehicleTransferMenu.tsx"),
    withDebug(true, true, "vehicletransfers"),
)(VehicleTransferMenu);
