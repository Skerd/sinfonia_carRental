import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import RecordPaymentDialog from "./recordPaymentDialog.tsx";
import HandoverDialog from "./handoverDialog.tsx";
import ReturnVehicleDialog from "./returnVehicleDialog.tsx";
import CancelReservationDialog from "./cancelReservationDialog.tsx";
import NoShowDialog from "./noShowDialog.tsx";
import ReassignVehicleDialog from "./reassignVehicleDialog.tsx";
import ExtendReservationDialog from "./extendReservationDialog.tsx";

/** The dialog for the action picked in a reservation's menu. */
export default function RentalReservationDialogs({
    action,
    reservation,
    onClose,
    onUpdated,
}: {
    action: string;
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
}) {
    const props = {reservation, onClose, onUpdated};
    switch (action) {
        case "recordPayment": return <RecordPaymentDialog {...props} />;
        case "handover": return <HandoverDialog {...props} />;
        case "returnVehicle": return <ReturnVehicleDialog {...props} />;
        case "cancel": return <CancelReservationDialog {...props} />;
        case "noShow": return <NoShowDialog {...props} />;
        case "reassignVehicle": return <ReassignVehicleDialog {...props} />;
        case "extend": return <ExtendReservationDialog {...props} />;
        default: return null;
    }
}
