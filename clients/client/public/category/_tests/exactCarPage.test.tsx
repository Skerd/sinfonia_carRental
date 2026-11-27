import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {Provider} from "react-redux";
import {MemoryRouter, Route, Routes} from "react-router-dom";

const {apiClientMock} = vi.hoisted(() => ({apiClientMock: vi.fn()}));
vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: apiClientMock}));

import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {RentalConfigProvider} from "../../shared/rentalConfigContext.tsx";
import {CAR_QUOTE, SITE_CONFIG, TRIP, TRIP_QUERY} from "../../shared/_tests/rentalSiteFixtures.ts";
import CategoryPage from "../index.tsx";

const page = (entry: string) => render(
    <Provider store={store}>
        <MemoryRouter initialEntries={[entry]}>
            <RentalConfigProvider>
                <Routes>
                    <Route path="/categories/:categoryId" element={<CategoryPage />} />
                    <Route path="/cars/:vehicleId" element={<CategoryPage />} />
                </Routes>
            </RentalConfigProvider>
        </MemoryRouter>
    </Provider>,
);

const posted = (suffix: string) => apiClientMock.mock.calls.map(([request]) => request).filter((request) => request.url.endsWith(suffix));

describe("a car rented on its own on the rental site (D198)", () => {
    beforeEach(() => {
        apiClientMock.mockReset();
        apiClientMock.mockImplementation(({url}: {url: string}) => Promise.resolve({
            data: url.endsWith("/quote") ? CAR_QUOTE : url.endsWith("Reviews") || url.endsWith("/reviews") ? {data: {average: 0, count: 0, reviews: []}} : SITE_CONFIG,
        }));
    });

    it("prices the exact car from its page, with its own name, its group's facts and its reviews", async () => {
        page(`/cars/car1?${TRIP_QUERY}`);
        expect(await screen.findByText("Free for these dates")).toBeInTheDocument();
        expect(screen.getAllByText("BMW 5 Series").length).toBeGreaterThan(0);
        expect(screen.getByText("This exact car · Premium")).toBeInTheDocument();
        expect(screen.queryByText("or similar")).not.toBeInTheDocument();
        expect(posted("/quote").at(-1)?.data).toMatchObject({category: "cat2", vehicle: "car1"});
        expect(posted("/carReviews")[0]?.data).toEqual({vehicle: "car1", limit: 10});
    });

    it("lists a group's cars instead of booking it when it is not sold as a class", async () => {
        page(`/categories/premium?${TRIP}`);
        expect(await screen.findByText("Choose your car")).toBeInTheDocument();
        expect(screen.getByText("Rented car by car: pick the exact one")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: /BMW 5 Series/})).toHaveAttribute("href", `/cars/car1?${TRIP_QUERY}`);
        expect(screen.queryByText("When do you need it?")).not.toBeInTheDocument();
        expect(posted("/quote")).toEqual([]);
    });

    it("shows a car that is no longer listed as not found", async () => {
        page("/cars/gone");
        expect(await screen.findByText("This car is not listed")).toBeInTheDocument();
    });
});
