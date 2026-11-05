import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import RecordPaymentDialog from "./recordPaymentDialog.tsx";
import HandoverDialog from "./handoverDialog.tsx";
import ReturnVehicleDialog from "./returnVehicleDialog.tsx";
import CancelReservationDialog from "./cancelReservationDialog.tsx";
import NoShowDialog from "./noShowDialog.tsx";
import ReassignVehicleDialog from "./reassignVehicleDialog.tsx";
import ExtendReservationDialog from "./extendReservationDialog.tsx";
import DriversDialog from "./driversDialog.tsx";
import DepositDialog from "./depositDialog.tsx";
import SettleDepositDialog from "./settleDepositDialog.tsx";
import FullReservation from "./fullReservation.tsx";

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
        // Drivers are identity data a list row leaves out (SEC-06): these two start from the whole reservation.
        case "handover": return <FullReservation filter={{_id: reservation._id}}>{(full) => <HandoverDialog {...props} reservation={full} />}</FullReservation>;
        case "returnVehicle": return <ReturnVehicleDialog {...props} />;
        case "cancel": return <CancelReservationDialog {...props} />;
        case "noShow": return <NoShowDialog {...props} />;
        case "reassignVehicle": return <ReassignVehicleDialog {...props} />;
        case "extend": return <ExtendReservationDialog {...props} />;
        case "drivers": return <FullReservation filter={{_id: reservation._id}}>{(full) => <DriversDialog {...props} reservation={full} />}</FullReservation>;
        case "takeDeposit": return <DepositDialog {...props} />;
        case "settleDeposit": return <SettleDepositDialog {...props} />;
        default: return null;
    }
}
