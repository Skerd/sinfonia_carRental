import type {VehicleCatalogEntry} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/vehicleCatalog.dto.ts";

export const VEHICLE_CATALOG_BASE = "/tenancy/systemSettings/vehiclecatalogentries";

/** The edit page of a catalog entry; the route reads `vehicleCatalogEntryId`. */
export function vehicleCatalogEditPath(entry: Pick<VehicleCatalogEntry, "_id">): string {
    return `${VEHICLE_CATALOG_BASE}/edit?vehicleCatalogEntryId=${encodeURIComponent(entry._id)}`;
}
