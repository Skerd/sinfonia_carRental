import {createContext, useContext, useMemo, type ReactNode} from "react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import type {RentalStorefrontConfigResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";

export type RentalConfig = RentalStorefrontConfigResponse["data"];

type RentalConfigContextValue = {
    config: RentalConfig | null;
    loading: boolean;
    /** Set when the business has no online car rental (or the request failed). */
    unavailable: boolean;
    formatMoney: (amount: number | undefined | null) => string;
};

const RentalConfigContext = createContext<RentalConfigContextValue>({
    config: null,
    loading: true,
    unavailable: false,
    formatMoney: () => "",
});

/** The rental site's settings and fleet; the section asks them ahead for a hovered link into a company's site. */
export const RENTAL_CONFIG_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalStorefront/config", cache: true};

/** Loads the business, locations, categories and rules once for the whole site. */
export function RentalConfigProvider({children}: {children: ReactNode}) {
    const {data, loading} = useHttpRequest<RentalStorefrontConfigResponse>(RENTAL_CONFIG_REQUEST, {}, 1);
    const config = data?.data ?? null;

    const value = useMemo<RentalConfigContextValue>(() => ({
        config,
        loading,
        unavailable: !loading && !config,
        formatMoney: (amount) => {
            if (amount == null || Number.isNaN(amount)) return "";
            // At the currency's own decimals (D90): two for the euro, none for the yen.
            const code = config?.currency.abbreviation;
            const digits = config?.currency.decimalPlaces ?? 2;
            return code ? formatCurrency(amount, code, {minimumFractionDigits: digits, maximumFractionDigits: digits}) : amount.toFixed(digits);
        },
    }), [config, loading]);

    return <RentalConfigContext.Provider value={value}>{children}</RentalConfigContext.Provider>;
}

export function useRentalConfig(): RentalConfigContextValue {
    return useContext(RentalConfigContext);
}
