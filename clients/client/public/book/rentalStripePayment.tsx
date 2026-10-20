import {useState} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import {Lock} from "lucide-react";
import {PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {RENT_PRIMARY_BUTTON} from "../shared/rentalStyles.ts";

type Props = WithLanguageType & {
    clientSecret: string;
    /** Where Stripe sends redirect-based methods back to, and where the site goes once paid. */
    returnPath: string;
    onPaid: () => void;
};

/** Card (or other method) entry for a held reservation. Rendered inside Stripe `<Elements>`. */
function RentalStripePayment({clientSecret, returnPath, onPaid, resolveLanguageKey}: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);

    async function handlePay() {
        if (!stripe || !elements) return;
        setSubmitting(true);
        try {
            // A previous attempt may already have been charged — never charge twice.
            const {paymentIntent} = await stripe.retrievePaymentIntent(clientSecret);
            if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
                onPaid();
                return;
            }
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {return_url: `${window.location.origin}${returnPath}`},
                redirect: "if_required",
            });
            if (result.error) {
                toast.error(result.error.message ?? String(resolveLanguageKey("paymentFailed")));
                return;
            }
            onPaid();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <PaymentElement />
            <button type="button" onClick={() => void handlePay()} disabled={!stripe || submitting} className={RENT_PRIMARY_BUTTON}>
                <Lock className="h-4 w-4" aria-hidden />
                {resolveLanguageKey(submitting ? "processing" : "pay")}
            </button>
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/book/rentalStripePayment.tsx"))(RentalStripePayment);
