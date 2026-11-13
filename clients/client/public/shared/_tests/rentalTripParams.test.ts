import {afterEach, describe, expect, it, vi} from "vitest";
import {dateInDays, formatAtLocation, formatLocalDateTime} from "../rentalTripParams.ts";

afterEach(() => {
    vi.useRealTimers();
});

describe("dateInDays", () => {
    it("counts from today at the rental location, not in the browser's calendar (TD-B169)", () => {
        vi.useFakeTimers();
        // Already 2 March in Zurich, still 1 March in Los Angeles
        vi.setSystemTime(new Date("2026-03-01T23:30:00Z"));

        expect(dateInDays(0, "Europe/Zurich")).toBe("2026-03-02");
        expect(dateInDays(1, "Europe/Zurich")).toBe("2026-03-03");
        expect(dateInDays(0, "America/Los_Angeles")).toBe("2026-03-01");
        expect(dateInDays(30, "America/Los_Angeles")).toBe("2026-03-31");
    });
});

describe("trip date display", () => {
    it("keeps the typed calendar day and time, whatever the browser's zone", () => {
        const text = formatLocalDateTime("2026-11-14", "10:00");
        expect(text).toMatch(/14/);
        expect(text.endsWith(", 10:00")).toBe(true);
    });

    it("shows an instant at the rental location's wall clock", () => {
        // 23:30 UTC on 14 Nov is already 00:30 on 15 Nov in Tirana
        expect(formatAtLocation("2026-11-14T23:30:00Z", "Europe/Tirane")).toMatch(/15.*00:30/);
    });
});
