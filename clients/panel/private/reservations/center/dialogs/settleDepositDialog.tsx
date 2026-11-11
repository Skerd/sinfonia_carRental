import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {SettleRentalDepositFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {roundToCurrency, subtractMoney, toMinor} from "armonia/src/modules/core/helpers/money.ts";

type Props = WithLanguageType & WithAxiosType<RentalReservation, SettleRentalDepositFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** Keeps what the customer still owes from the deposit and releases the rest. */
function SettleDepositDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading, error}: Props) {
    // Exact money at the currency's own decimals (GLB-08), shown with its currency (UX-07).
    const currency = reservation.pricing?.currency;
    const decimals = currency?.decimalPlaces ?? 2;
    const money = (amount: number) => (currency?.abbreviation ? formatCurrency(amount, currency.abbreviation) : String(amount));
    const held = reservation.deposit?.amount ?? 0;
    const due = Math.max(0, subtractMoney(reservation.pricing?.grandTotal ?? 0, reservation.amountPaid ?? 0, decimals));
    const most = Math.min(held, due);
    const [keep, setKeep] = useState(String(roundToCurrency(most, decimals)));
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={String(resolveLanguageKey("description")).replace("{held}", money(held)).replace("{due}", money(due))}
            confirmLabel={resolveLanguageKey(Number(keep) > 0 ? "confirmKeep" : "confirmRelease")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            error={error?.message}
            canConfirm={keep !== "" && Number(keep) >= 0 && toMinor(Number(keep), decimals) <= toMinor(most, decimals)}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id, keepAmount: Number(keep)})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-deposit-keep">{resolveLanguageKey("keepLabel")}{currency?.abbreviation ? ` (${currency.abbreviation})` : ""}</Label>
                <Input id="rental-deposit-keep" type="number" min={0} step="any" value={keep} onChange={(e) => setKeep(e.target.value)} disabled={loading} />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/settleDepositDialog.tsx"),
    withAxios<RentalReservation, SettleRentalDepositFormType>({url: "/api/carRental/rentalReservation/settleDeposit", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(SettleDepositDialog);
