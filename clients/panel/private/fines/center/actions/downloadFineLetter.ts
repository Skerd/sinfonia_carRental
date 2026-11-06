import {downloadFromApi} from "@coreModule/helpers/media/downloadFromApi.ts";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";

/** Downloads the letter naming the driver, to send to the authority. */
export function downloadFineLetter(fine: Pick<VehicleFine, "_id" | "reference">): Promise<boolean> {
    return downloadFromApi({url: `/api/carRental/vehicleFineLetter/${fine._id}`, fileName: `${fine.reference}.pdf`});
}
