import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {ComponentType} from "react";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";

const {apiClientMock} = vi.hoisted(() => ({apiClientMock: vi.fn()}));

vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: apiClientMock}));
vi.mock("sonner", () => ({toast: Object.assign(vi.fn(), {loading: vi.fn(), success: vi.fn(), error: vi.fn(), dismiss: vi.fn()})}));
vi.mock("@coreModule/helpers/general/config.ts", () => ({
    getClientConfig: () => ({debugging: {enableFormPostInfo: false, enableFormResponseSuccessInfo: false, enableFormResponseErrorInfo: false}}),
}));
vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) =>
        (props: Record<string, unknown>) => <Wrapped {...props} resolveLanguageKey={(key: string) => key}/>,
}));
// The shared date picker needs the app's store; this test is about which reservation the dialog starts from.
vi.mock("@coreModule/components/custom/inputs/dateInput.tsx", () => ({
    DateInput: ({id, value}: {id?: string; value?: string}) => <input id={id} value={value ?? ""} readOnly />,
}));
vi.mock("@coreModule/helpers/hocs/withDebug.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) => Wrapped,
}));

import RentalReservationDialogs from "../rentalReservationDialogs.tsx";

// A list row leaves the drivers out (SEC-06); the reservation's own read has them.
const row = {_id: "r1", contact: {firstName: "Ada", lastName: "Lovelace"}} as RentalReservation;
const full = {...row, drivers: [{role: "primary", firstName: "Ada", lastName: "Lovelace", birthDate: "1990-12-10", licenseNumber: "CH-123456"}]} as RentalReservation;

describe("reservation driver dialogs", () => {
    it("start from the whole reservation, not the list row, so saving never drops the stored drivers", async () => {
        apiClientMock.mockResolvedValue({data: full});
        render(<RentalReservationDialogs action="drivers" reservation={row} onClose={() => {}} onUpdated={() => {}} />);

        expect(await screen.findByDisplayValue("CH-123456")).toBeTruthy();
        expect(apiClientMock).toHaveBeenCalledWith(expect.objectContaining({url: "/api/carRental/rentalReservation/single", data: {_id: "r1"}}));
    });
});
