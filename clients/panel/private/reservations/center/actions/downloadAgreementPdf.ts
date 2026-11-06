import {downloadFromApi} from "@coreModule/helpers/media/downloadFromApi.ts";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";

/** Downloads the rental agreement as the customer received it at pickup. */
export function downloadAgreementPdf(reservation: Pick<RentalReservation, "_id" | "number">): Promise<boolean> {
    return downloadFromApi({url: `/api/carRental/rentalAgreementPdf/${reservation._id}`, fileName: `${reservation.number}.pdf`});
}
