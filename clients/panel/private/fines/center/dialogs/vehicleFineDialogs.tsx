import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import ReservationActionDialogShell from "@carRentalModule/clients/panel/private/reservations/center/dialogs/reservationActionDialogShell.tsx";
import type {VehicleFineAction} from "../actions/vehicleFineMenu.tsx";
import RecordFinePaymentDialog from "./recordFinePaymentDialog.tsx";

type DialogProps = {fine: VehicleFine; onClose: () => void; onUpdated: (updated: VehicleFine) => void};
type ConfirmAction = Exclude<VehicleFineAction, "recordPayment">;
type Props = WithLanguageType & WithAxiosType<VehicleFine, {_id: string}> & DialogProps & {action: ConfirmAction};

/** Confirms one fine action; the dictionary holds the title, text and button per action. */
function FineActionDialog({action, fine, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading, error}: Props) {
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey(`${action}.title`)}
            description={String(resolveLanguageKey(`${action}.description`)).replace("{driver}", fine.driverName ?? "").replace("{booking}", fine.reservation?.number ?? "")}
            confirmLabel={resolveLanguageKey(`${action}.confirm`)}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            error={error?.message}
            destructive={action === "annul"}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: fine._id})}
        />
    );
}

const dialogFor = (action: ConfirmAction) => compose(
    withLanguage("src/modules/carRental/clients/panel/private/fines/center/dialogs/vehicleFineDialogs.tsx"),
    withAxios<VehicleFine, {_id: string}>({url: `/api/carRental/vehicleFine/${action}`, method: "POST", data: {}}, true),
    withDebug(true, true, "vehiclefines"),
)((props: Omit<Props, "action">) => <FineActionDialog {...props} action={action} />);

const MatchDriverDialog = dialogFor("matchDriver");
const ChargeCustomerDialog = dialogFor("chargeCustomer");
const NominateDriverDialog = dialogFor("nominateDriver");
const DisputeDialog = dialogFor("dispute");
const AnnulDialog = dialogFor("annul");

/** The dialog for the action picked in a fine's menu. */
export default function VehicleFineDialogs({action, ...props}: DialogProps & {action: string}) {
    if (action === "matchDriver") return <MatchDriverDialog {...props} />;
    if (action === "chargeCustomer") return <ChargeCustomerDialog {...props} />;
    if (action === "nominateDriver") return <NominateDriverDialog {...props} />;
    if (action === "recordPayment") return <RecordFinePaymentDialog {...props} />;
    if (action === "dispute") return <DisputeDialog {...props} />;
    if (action === "annul") return <AnnulDialog {...props} />;
    return null;
}
