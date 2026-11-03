import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconCircleCheck, IconX} from "@tabler/icons-react";
import type {VehicleMaintenance} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.dto.ts";

export type VehicleMaintenanceAction = "complete" | "cancel";

type Props = WithLanguageType & {record: VehicleMaintenance; onAction: (action: VehicleMaintenanceAction) => void};

/** A scheduled service is completed when the car is back, or cancelled. Status is not a form field. */
function VehicleMaintenanceMenu({record, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("rentalreservations");
    if (record.deletedAt || record.status !== "scheduled" || !write?.status) return null;
    const item = (action: VehicleMaintenanceAction, Icon: typeof IconX, destructive = false) => (
        <DropdownMenuItem key={action} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(action); }}>
            <Icon size={16} className={destructive ? "text-destructive" : undefined} />
            <p className={destructive ? "text-destructive" : undefined}>{resolveLanguageKey(action)}</p>
        </DropdownMenuItem>
    );
    return (
        <>
            {item("complete", IconCircleCheck)}
            {item("cancel", IconX, true)}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/maintenance/center/actions/vehicleMaintenanceMenu.tsx"),
    withDebug(true, true, "vehiclemaintenances"),
)(VehicleMaintenanceMenu);
