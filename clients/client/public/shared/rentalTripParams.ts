import {addCalendarDays, companyToday, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import type {SearchRentalFormType} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.forms.ts";

/** A trip as the site keeps it: in the URL, so search results and booking pages can be shared and reloaded. */
export type RentalTripParams = SearchRentalFormType;

const KEYS = ["pickupLocation", "returnLocation", "pickupDate", "pickupTime", "returnDate", "returnTime"] as const;

export function tripFromSearch(params: URLSearchParams): RentalTripParams | null {
    const values = KEYS.map((key) => params.get(key) ?? "");
    if (values.some((value) => !value)) return null;
    const [pickupLocation, returnLocation, pickupDate, pickupTime, returnDate, returnTime] = values;
    return {pickupLocation, returnLocation, pickupDate, pickupTime, returnDate, returnTime};
}

export function tripToSearch(trip: RentalTripParams): string {
    const params = new URLSearchParams();
    for (const key of KEYS) params.set(key, trip[key]);
    return params.toString();
}

/**
 * `YYYY-MM-DD` of the day `daysAhead` from today at a rental location, in its own `timeZone` (GLB-09); the visitor's
 * zone only while no location is known yet (a starting suggestion, which the location's hours then correct).
 */
export function dateInDays(daysAhead: number, timeZone?: string): string {
    return addCalendarDays(companyToday(timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone), daysAhead);
}

const TRIP_DAY = {weekday: "short", day: "numeric", month: "short"} satisfies Intl.DateTimeFormatOptions;

/** An instant shown as the local date and time at the place it happens, in the app's language (GLB-09: core formatDate). */
export function formatAtLocation(iso: string, timeZone: string): string {
    return formatDate(iso, {timeZone, format: {...TRIP_DAY, hour: "2-digit", minute: "2-digit"}});
}

/** A wall-clock date and time as typed for a location (no time zone involved), in the app's language. */
export function formatLocalDateTime(date: string, time: string): string {
    return `${formatDate(`${date}T12:00:00Z`, {timeZone: "UTC", format: TRIP_DAY})}, ${time}`;
}
