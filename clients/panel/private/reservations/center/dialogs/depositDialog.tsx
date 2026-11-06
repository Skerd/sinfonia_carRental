import {useImperativeHandle, useMemo, useState} from "react";
import {compose} from "redux";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {RentalDepositResponse, RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {TakeRentalDepositFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";
import {RENTAL_CARD_HOLD_MAX_DAYS} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.constants.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import DepositCardForm from "./depositCardForm.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {RadioGroup, RadioGroupItem} from "@coreModule/components/ui/radio-group.tsx";

const REFRESH_DEPOSIT_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalReservation/refreshDeposit"};

type Props = WithLanguageType & WithAxiosType<{data: RentalDepositResponse}, TakeRentalDepositFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/**
 * Takes the deposit at pickup. Cash is held at once. A card is entered by the
 * customer here: a hold for rentals of up to a week, otherwise a card saved for
 * later charges.
 */
function DepositDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [method, setMethod] = useState<"card" | "cash">("card");
    const [amount, setAmount] = useState(String(reservation.pricing.depositAmount || ""));
    const [card, setCard] = useState<NonNullable<RentalDepositResponse["payment"]> | null>(null);
    const [cardError, setCardError] = useState<string | null>(null);
    const stripePromise = useMemo(() => (card?.publishableKey ? loadStripe(card.publishableKey) : null), [card?.publishableKey]);
    useImperativeHandle(innerRef, () => ({
        success: (response) => {
            onUpdated(response.data.reservation);
            if (response.data.payment) setCard(response.data.payment);
            else onClose();
        },
    }));

    // Re-reads the deposit after Stripe confirms the card on the client.
    const [refreshCount, setRefreshCount] = useState(0);
    useHttpRequest<RentalReservation>(REFRESH_DEPOSIT_REQUEST, {_id: reservation._id}, refreshCount, true, {
        success: (updated) => {
            onUpdated(updated);
            onClose();
        },
    });
    const savesCard = reservation.pricing.rentalDays > RENTAL_CARD_HOLD_MAX_DAYS;

    if (card && stripePromise) {
        return (
            <ReservationActionDialogShell
                title={resolveLanguageKey("cardTitle")}
                description={resolveLanguageKey(card.kind === "payment" ? "cardHoldHint" : "cardSaveHint")}
                confirmLabel={resolveLanguageKey("close")}
                cancelLabel={resolveLanguageKey("cancel")}
                loading={false}
                canConfirm
                onClose={onClose}
                onConfirm={onClose}
            >
                <Elements stripe={stripePromise} options={{clientSecret: card.clientSecret}}>
                    <DepositCardForm
                        kind={card.kind}
                        confirmLabel={String(resolveLanguageKey(card.kind === "payment" ? "confirmHold" : "confirmSave"))}
                        onConfirmed={() => setRefreshCount((count) => count + 1)}
                        onError={setCardError}
                    />
                </Elements>
                {cardError ? <p className="text-sm text-destructive">{cardError}</p> : null}
            </ReservationActionDialogShell>
        );
    }

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey(savesCard ? "descriptionSaveCard" : "descriptionHold")}
            confirmLabel={resolveLanguageKey(method === "cash" ? "confirmCash" : "continueCard")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={amount !== "" && Number(amount) > 0}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id, method, amount: Number(amount)})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="rental-deposit-amount">{resolveLanguageKey("amountLabel")}</Label>
                <Input id="rental-deposit-amount" type="number" min={0} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} />
            </div>
            <RadioGroup
                className="flex flex-col gap-2"
                value={method}
                onValueChange={(value) => setMethod(value === "cash" ? "cash" : "card")}
                disabled={loading}
            >
                {(["card", "cash"] as const).map((choice) => (
                    <label key={choice} className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value={choice} />
                        {resolveLanguageKey(`method.${choice}`)}
                    </label>
                ))}
            </RadioGroup>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/depositDialog.tsx"),
    withAxios<{data: RentalDepositResponse}, TakeRentalDepositFormType>({url: "/api/carRental/rentalReservation/takeDeposit", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(DepositDialog);
