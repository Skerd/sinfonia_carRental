import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {Provider} from "react-redux";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import type {RentalSearchResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";

const {apiClientMock} = vi.hoisted(() => ({apiClientMock: vi.fn()}));
vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: apiClientMock}));

import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {RentalConfigProvider} from "../../shared/rentalConfigContext.tsx";
import {CAR_QUOTE, SITE_CONFIG, TRIP, TRIP_QUERY} from "../../shared/_tests/rentalSiteFixtures.ts";
import SearchPage from "../index.tsx";

const SEARCH: RentalSearchResponse = {
    data: {
        pickupAt: "2099-06-01T08:00:00.000Z",
        returnAt: "2099-06-03T08:00:00.000Z",
        results: [],
        cars: [{car: SITE_CONFIG.data.cars[0], quote: CAR_QUOTE.data}],
    },
};

describe("search results with cars rented on their own (D198)", () => {
    beforeEach(() => {
        apiClientMock.mockReset();
        apiClientMock.mockImplementation(({url}: {url: string}) => Promise.resolve({data: url.endsWith("/search") ? SEARCH : SITE_CONFIG}));
    });

    it("shows each free car as this exact car, with its group's facts, its transfer and its total", async () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[`/search?${TRIP}`]}>
                    <RentalConfigProvider>
                        <Routes><Route path="/search" element={<SearchPage />} /></Routes>
                    </RentalConfigProvider>
                </MemoryRouter>
            </Provider>,
        );
        expect(await screen.findByText("This exact car")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "BMW 5 Series"})).toHaveAttribute("href", `/cars/car1?${TRIP_QUERY}`);
        expect(screen.getByText("2024 · Black")).toBeInTheDocument();
        expect(screen.getByText(/Bringing the car from Durrës Port/)).toBeInTheDocument();
        expect(screen.getByText("€320.00")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Choose"})).toHaveAttribute("href", `/book/premium?${TRIP_QUERY}&vehicle=car1`);
        // Results are not empty: no "no cars" message.
        expect(screen.queryByText("No cars are listed for online booking.")).not.toBeInTheDocument();
    });
});
