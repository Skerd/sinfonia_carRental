import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleMaintenance} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.dto.ts";
import ReservationActionDialogShell from "@carRentalModule/clients/panel/private/reservations/center/dialogs/reservationActionDialogShell.tsx";
import type {VehicleMaintenanceAction} from "../actions/vehicleMaintenanceMenu.tsx";

type DialogProps = {record: VehicleMaintenance; onClose: () => void; onUpdated: (updated: VehicleMaintenance) => void};
type Props = WithLanguageType & WithAxiosType<VehicleMaintenance, {_id: string}> & DialogProps & {action: VehicleMaintenanceAction};

/** Confirms completing or cancelling a service; the dictionary holds the title, text and button per action. */
function MaintenanceActionDialog({action, record, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading, error}: Props) {
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey(`${action}.title`)}
            description={String(resolveLanguageKey(`${action}.description`)).replace("{plate}", record.vehicle?.plate ?? "")}
            confirmLabel={resolveLanguageKey(`${action}.confirm`)}
            cancelLabel={resolveLanguageKey("back")}
            loading={loading}
            error={error?.message}
            destructive={action === "cancel"}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: record._id})}
        />
    );
}

const dialogFor = (action: VehicleMaintenanceAction) => compose(
    withLanguage("src/modules/carRental/clients/panel/private/maintenance/center/dialogs/vehicleMaintenanceDialogs.tsx"),
    withAxios<VehicleMaintenance, {_id: string}>({url: `/api/carRental/vehicleMaintenance/${action}`, method: "POST", data: {}}, true),
    withDebug(true, true, "vehiclemaintenances"),
)((props: Omit<Props, "action">) => <MaintenanceActionDialog {...props} action={action} />);

const CompleteDialog = dialogFor("complete");
const CancelDialog = dialogFor("cancel");

/** The dialog for the action picked in a service record's menu. */
export default function VehicleMaintenanceDialogs({action, ...props}: DialogProps & {action: string}) {
    if (action === "complete") return <CompleteDialog {...props} />;
    if (action === "cancel") return <CancelDialog {...props} />;
    return null;
}
