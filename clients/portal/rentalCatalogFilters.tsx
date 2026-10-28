import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {CatalogFilterInput, CatalogFilterSelect} from "@coreModule/clients/portal/shared/catalogFilters.tsx";
import {
    VEHICLE_FUEL_TYPES,
    VEHICLE_TRANSMISSIONS,
} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.schema-def.ts";

const SEATS = ["2", "4", "5", "7", "9"] as const;

/** The car catalog's filters: a trip (cars free for it, priced for it) and what the car should be. */
function RentalCatalogFilters({resolveLanguageKey}: WithLanguageType) {
    const any = resolveLanguageKey("any");
    return (
        <>
            <CatalogFilterInput name="pickupDate" type="date" label={resolveLanguageKey("pickupDate")} />
            <CatalogFilterInput name="pickupTime" type="time" label={resolveLanguageKey("pickupTime")} />
            <CatalogFilterInput name="returnDate" type="date" label={resolveLanguageKey("returnDate")} />
            <CatalogFilterInput name="returnTime" type="time" label={resolveLanguageKey("returnTime")} />
            <CatalogFilterSelect
                name="transmission"
                label={resolveLanguageKey("transmission")}
                anyLabel={any}
                options={VEHICLE_TRANSMISSIONS.map((value) => ({value, label: resolveLanguageKey(`transmissions.${value}`)}))}
            />
            <CatalogFilterSelect
                name="fuel"
                label={resolveLanguageKey("fuel")}
                anyLabel={any}
                options={VEHICLE_FUEL_TYPES.map((value) => ({value, label: resolveLanguageKey(`fuels.${value}`)}))}
            />
            <CatalogFilterSelect
                name="seats"
                label={resolveLanguageKey("seats")}
                anyLabel={any}
                options={SEATS.map((value) => ({value, label: resolveLanguageKey("seatsAtLeast").replace("{count}", value)}))}
            />
        </>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/portal/rentalCatalogFilters.tsx"))(RentalCatalogFilters);
