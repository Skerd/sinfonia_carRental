import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import type {RecordVehicleFinePaymentFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.schema-def.ts";
import ReservationActionDialogShell from "@carRentalModule/clients/panel/private/reservations/center/dialogs/reservationActionDialogShell.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";

type Props = WithLanguageType & WithAxiosType<VehicleFine, RecordVehicleFinePaymentFormType> & {
    fine: VehicleFine;
    onClose: () => void;
    onUpdated: (updated: VehicleFine) => void;
};

/** What the company paid the authority, and when: it can differ from the fine (early discount, late surcharge). */
function RecordFinePaymentDialog({fine, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
    const [paidAmount, setPaidAmount] = useState(String(fine.amount));
    const [paymentReference, setPaymentReference] = useState("");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={String(resolveLanguageKey(fine.reservation ? "descriptionBooking" : "descriptionCompany")).replace("{reference}", fine.reference)}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={!!paidAt && paidAmount !== "" && Number(paidAmount) >= 0}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: fine._id, paidAt, paidAmount: Number(paidAmount), ...(paymentReference ? {paymentReference} : {})})}
        >
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="rental-fine-paid-at">{resolveLanguageKey("paidAtLabel")}</Label>
                    <Input id="rental-fine-paid-at" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} disabled={loading} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="rental-fine-paid-amount">{resolveLanguageKey("paidAmountLabel")}</Label>
                    <Input id="rental-fine-paid-amount" type="number" min={0} step="any" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} disabled={loading} />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-fine-payment-reference">{resolveLanguageKey("paymentReferenceLabel")}</Label>
                <Input id="rental-fine-payment-reference" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/fines/center/dialogs/recordFinePaymentDialog.tsx"),
    withAxios<VehicleFine, RecordVehicleFinePaymentFormType>({url: "/api/carRental/vehicleFine/recordPayment", method: "POST", data: {}}, true),
    withDebug(true, true, "vehiclefines"),
)(RecordFinePaymentDialog);
