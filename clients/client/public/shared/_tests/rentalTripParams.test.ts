import {afterEach, describe, expect, it, vi} from "vitest";
import {dateInDays} from "../rentalTripParams.ts";

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
