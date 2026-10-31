import {useState} from "react";
import {Lock} from "lucide-react";
import {PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {Button} from "@coreModule/components/ui/button.tsx";

type Props = {
    kind: "payment" | "setup";
    confirmLabel: string;
    onConfirmed: () => void;
    onError: (message: string) => void;
};

/**
 * The customer enters their card on the counter device: a hold (payment, manual
 * capture) or a card saved for later (setup). Rendered inside Stripe `<Elements>`.
 */
export default function DepositCardForm({kind, confirmLabel, onConfirmed, onError}: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);

    const confirm = async () => {
        if (!stripe || !elements) return;
        setSubmitting(true);
        try {
            const confirmParams = {return_url: window.location.href};
            const result = kind === "payment"
                ? await stripe.confirmPayment({elements, confirmParams, redirect: "if_required"})
                : await stripe.confirmSetup({elements, confirmParams, redirect: "if_required"});
            if (result.error) {
                onError(result.error.message ?? "");
                return;
            }
            onConfirmed();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <PaymentElement />
            <Button type="button" onClick={() => void confirm()} disabled={!stripe || submitting}>
                <Lock className="h-4 w-4" aria-hidden />
                {confirmLabel}
            </Button>
        </div>
    );
}
