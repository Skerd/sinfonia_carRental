import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import ReservationActionDialogShell from "@carRentalModule/clients/panel/private/reservations/center/dialogs/reservationActionDialogShell.tsx";
import type {VehicleFineAction} from "../actions/vehicleFineMenu.tsx";

type DialogProps = {fine: VehicleFine; onClose: () => void; onUpdated: (updated: VehicleFine) => void};
type Props = WithLanguageType & WithAxiosType<VehicleFine, {_id: string}> & DialogProps & {action: VehicleFineAction};

/** Confirms one fine action; the dictionary holds the title, text and button per action. */
function FineActionDialog({action, fine, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey(`${action}.title`)}
            description={String(resolveLanguageKey(`${action}.description`)).replace("{driver}", fine.driverName ?? "").replace("{booking}", fine.reservation?.number ?? "")}
            confirmLabel={resolveLanguageKey(`${action}.confirm`)}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: fine._id})}
        />
    );
}

const dialogFor = (action: VehicleFineAction) => compose(
    withLanguage("src/modules/carRental/clients/panel/private/fines/center/dialogs/vehicleFineDialogs.tsx"),
    withAxios<VehicleFine, {_id: string}>({url: `/api/carRental/vehicleFine/${action}`, method: "POST", data: {}}, true),
    withDebug(true, true, "vehiclefines"),
)((props: Omit<Props, "action">) => <FineActionDialog {...props} action={action} />);

const MatchDriverDialog = dialogFor("matchDriver");
const ChargeCustomerDialog = dialogFor("chargeCustomer");

/** The dialog for the action picked in a fine's menu. */
export default function VehicleFineDialogs({action, ...props}: DialogProps & {action: string}) {
    if (action === "matchDriver") return <MatchDriverDialog {...props} />;
    if (action === "chargeCustomer") return <ChargeCustomerDialog {...props} />;
    return null;
}
