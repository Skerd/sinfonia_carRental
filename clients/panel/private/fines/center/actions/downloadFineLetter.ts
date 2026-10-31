import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";

/** Downloads the letter naming the driver, to send to the authority. */
export async function downloadFineLetter(fine: Pick<VehicleFine, "_id" | "reference">): Promise<void> {
    const res = await apiClient.get<Blob>(`/api/carRental/vehicleFineLetter/${fine._id}`, {responseType: "blob"});
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fine.reference}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
