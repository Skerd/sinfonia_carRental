import {render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {Provider} from "react-redux";
import {MemoryRouter, Route, Routes} from "react-router-dom";

const {apiClientMock} = vi.hoisted(() => ({apiClientMock: vi.fn()}));
vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: apiClientMock}));

import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {RentalConfigProvider} from "../../shared/rentalConfigContext.tsx";
import {CAR_QUOTE, SITE_CONFIG, TRIP} from "../../shared/_tests/rentalSiteFixtures.ts";
import BookPage from "../index.tsx";

describe("booking a car rented on its own (D198)", () => {
    beforeEach(() => {
        apiClientMock.mockReset();
        apiClientMock.mockImplementation(({url}: {url: string}) => Promise.resolve({data: url.endsWith("/quote") ? CAR_QUOTE : SITE_CONFIG}));
    });

    it("prices this exact car and names it instead of the class", async () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[`/book/premium?${TRIP}&vehicle=car1`]}>
                    <RentalConfigProvider>
                        <Routes><Route path="/book/:categoryId" element={<BookPage />} /></Routes>
                    </RentalConfigProvider>
                </MemoryRouter>
            </Provider>,
        );
        expect(await screen.findByRole("heading", {level: 1, name: "BMW 5 Series"})).toBeInTheDocument();
        await waitFor(() => {
            const quotes = apiClientMock.mock.calls.map(([request]) => request).filter((request) => request.url.endsWith("/quote"));
            expect(quotes.at(-1)?.data).toMatchObject({category: "cat2", vehicle: "car1"});
        });
        expect(await screen.findByText("This exact car")).toBeInTheDocument();
        expect(screen.queryByText("or similar")).not.toBeInTheDocument();
    });
});
