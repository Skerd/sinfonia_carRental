import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";

/** Downloads the rental agreement as the customer received it at pickup. */
export async function downloadAgreementPdf(reservation: Pick<RentalReservation, "_id" | "number">): Promise<void> {
    const res = await apiClient.get<Blob>(`/api/carRental/rentalAgreementPdf/${reservation._id}`, {responseType: "blob"});
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reservation.number}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
