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

/** `YYYY-MM-DD` of the day `daysAhead` from today, in the browser's calendar (a starting suggestion only). */
export function dateInDays(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** An instant shown as the local date and time at the place it happens. */
export function formatAtLocation(iso: string, timeZone: string, locale?: string): string {
    return new Intl.DateTimeFormat(locale, {timeZone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}).format(new Date(iso));
}

/** A wall-clock date and time as typed for a location (no time zone involved). */
export function formatLocalDateTime(date: string, time: string, locale?: string): string {
    const [year, month, day] = date.split("-").map(Number);
    const weekdayAndDate = new Intl.DateTimeFormat(locale, {timeZone: "UTC", weekday: "short", day: "numeric", month: "short"})
        .format(new Date(Date.UTC(year, month - 1, day)));
    return `${weekdayAndDate}, ${time}`;
}
