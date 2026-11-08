import {render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi, type MockInstance} from "vitest";
import {Provider} from "react-redux";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import type {RentalQuoteResponse, RentalStorefrontConfigResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";

const {apiClientMock} = vi.hoisted(() => ({apiClientMock: vi.fn()}));

vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: apiClientMock}));

import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {RentalConfigProvider} from "../../shared/rentalConfigContext.tsx";
import CategoryPage from "../index.tsx";

// Shaped like the live `rentalStorefront/config` and `quote` responses.
const CONFIG: RentalStorefrontConfigResponse = {
    data: {
        company: {name: "Echo Rentals"},
        currency: {_id: "eur", name: "Euro", symbol: "€", abbreviation: "EUR", decimalPlaces: 2},
        paymentPolicy: "pay_at_pickup",
        onlinePaymentAvailable: false,
        guestBookingAllowed: true,
        minRentalHours: 1,
        maxRentalDays: 30,
        minLeadTimeHours: 0,
        maxAdvanceDays: 90,
        freeCancellationHours: 48,
        cancellationFeePercent: 0,
        vatRate: 8.1,
        pricesIncludeVat: true,
        locations: [{
            _id: "loc1",
            name: "Zurich Airport",
            timezone: "Europe/Zurich",
            openingHours: [],
            closures: [],
            pickupAllowed: true,
            returnAllowed: true,
        }],
        categories: [{
            _id: "cat1",
            name: "Compact",
            slug: "compact",
            description: "A small car.",
            images: ["/a.jpg", "/b.jpg"],
            videos: [],
            seats: 5,
            doors: 4,
            luggage: 2,
            transmission: "automatic",
            fuelType: "petrol",
            features: [],
            dailyRate: 49,
            depositAmount: 300,
            mileagePolicy: "limited",
            includedKmPerDay: 200,
            minDriverAge: 21,
            crossBorderAllowed: false,
        }],
        extras: [],
    },
};

const QUOTE: RentalQuoteResponse = {
    data: {
        rentalDays: 3,
        lines: [{label: "Compact", kind: "rental", quantity: 3, unitPrice: 49, total: 147}],
        subtotal: 147,
        vatRate: 8.1,
        vatAmount: 11.01,
        pricesIncludeVat: true,
        grandTotal: 147,
        depositAmount: 300,
    },
};

const TRIP = "pickupLocation=loc1&returnLocation=loc1&pickupDate=2099-06-01&pickupTime=10:00&returnDate=2099-06-04&returnTime=10:00";

describe("public car page", () => {
    let consoleError: MockInstance<typeof console.error>;

    beforeEach(() => {
        consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        apiClientMock.mockReset();
        apiClientMock.mockImplementation(({url}: {url: string}) =>
            Promise.resolve({data: url.endsWith("/quote") ? QUOTE : CONFIG}));
    });

    afterEach(() => {
        consoleError.mockRestore();
    });

    it("renders without React duplicate-key warnings, also while its translations are still loading", async () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[`/cat1?${TRIP}`]}>
                    <RentalConfigProvider>
                        <Routes>
                            <Route path="/:categoryId" element={<CategoryPage />} />
                        </Routes>
                    </RentalConfigProvider>
                </MemoryRouter>
            </Provider>,
        );

        // The quote has arrived and the page's own dictionary has loaded.
        expect(await screen.findByText("Free for these dates")).toBeInTheDocument();
        expect(screen.getByText("Seats")).toBeInTheDocument();

        const duplicateKeyWarnings = consoleError.mock.calls.filter((call) => String(call[0]).includes("same key"));
        expect(duplicateKeyWarnings).toEqual([]);
    });
});
