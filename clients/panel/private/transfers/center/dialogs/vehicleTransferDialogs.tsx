import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleTransfer} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.dto.ts";
import ReservationActionDialogShell from "@carRentalModule/clients/panel/private/reservations/center/dialogs/reservationActionDialogShell.tsx";
import type {VehicleTransferAction} from "../actions/vehicleTransferMenu.tsx";

type DialogProps = {transfer: VehicleTransfer; onClose: () => void; onUpdated: (updated: VehicleTransfer) => void};
type Props = WithLanguageType & WithAxiosType<VehicleTransfer, {_id: string}> & DialogProps & {action: VehicleTransferAction};

/** Confirms one transfer action; the dictionary holds the title, text and button per action. */
function TransferActionDialog({action, transfer, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey(`${action}.title`)}
            description={String(resolveLanguageKey(`${action}.description`)).replace("{plate}", transfer.vehicle?.plate ?? "")}
            confirmLabel={resolveLanguageKey(`${action}.confirm`)}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: transfer._id})}
        />
    );
}

const dialogFor = (action: VehicleTransferAction) => compose(
    withLanguage("src/modules/carRental/clients/panel/private/transfers/center/dialogs/vehicleTransferDialogs.tsx"),
    withAxios<VehicleTransfer, {_id: string}>({url: `/api/carRental/vehicleTransfer/${action}`, method: "POST", data: {}}, true),
    withDebug(true, true, "vehicletransfers"),
)((props: Omit<Props, "action">) => <TransferActionDialog {...props} action={action} />);

const StartDialog = dialogFor("start");
const CompleteDialog = dialogFor("complete");
const CancelDialog = dialogFor("cancel");

/** The dialog for the action picked in a transfer's menu. */
export default function VehicleTransferDialogs({action, ...props}: DialogProps & {action: string}) {
    if (action === "start") return <StartDialog {...props} />;
    if (action === "complete") return <CompleteDialog {...props} />;
    if (action === "cancel") return <CancelDialog {...props} />;
    return null;
}
