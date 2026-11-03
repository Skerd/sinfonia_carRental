import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";
import ReservationActionDialogShell from "@carRentalModule/clients/panel/private/reservations/center/dialogs/reservationActionDialogShell.tsx";
import type {VehicleInsuranceAction} from "../actions/vehicleInsuranceMenu.tsx";

type DialogProps = {policy: VehicleInsurance; onClose: () => void; onUpdated: (updated: VehicleInsurance) => void};
type Props = WithLanguageType & WithAxiosType<VehicleInsurance, {_id: string}> & DialogProps & {action: VehicleInsuranceAction};

/** Confirms cancel or restore. The dictionary holds the title, text and button per action. */
function InsuranceActionDialog({action, policy, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey(`${action}.title`)}
            description={String(resolveLanguageKey(`${action}.description`)).replace("{policy}", policy.policyNumber ?? "")}
            confirmLabel={resolveLanguageKey(`${action}.confirm`)}
            cancelLabel={resolveLanguageKey("back")}
            loading={loading}
            destructive={action === "cancel"}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: policy._id})}
        />
    );
}

const dialogFor = (action: VehicleInsuranceAction) => compose(
    withLanguage("src/modules/carRental/clients/panel/private/insurance/center/dialogs/vehicleInsuranceDialogs.tsx"),
    withAxios<VehicleInsurance, {_id: string}>({url: `/api/carRental/vehicleInsurance/${action}`, method: "POST", data: {}}, true),
    withDebug(true, true, "vehicleinsurances"),
)((props: Omit<Props, "action">) => <InsuranceActionDialog {...props} action={action} />);

const CancelDialog = dialogFor("cancel");
const UncancelDialog = dialogFor("uncancel");

/** The dialog for the action picked in a policy's menu. */
export default function VehicleInsuranceDialogs({action, ...props}: DialogProps & {action: string}) {
    if (action === "cancel") return <CancelDialog {...props} />;
    if (action === "uncancel") return <UncancelDialog {...props} />;
    return null;
}
