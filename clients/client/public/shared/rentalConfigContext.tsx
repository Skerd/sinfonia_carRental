import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
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

/** Loads the business, locations, categories and rules once for the whole site. */
export function RentalConfigProvider({children}: {children: ReactNode}) {
    const [config, setConfig] = useState<RentalConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        apiClient
            .post<RentalStorefrontConfigResponse>("/api/carRental/rentalStorefront/config", {})
            .then((res) => {
                if (!cancelled) setConfig(res.data.data);
            })
            .catch(() => {
                if (!cancelled) setConfig(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo<RentalConfigContextValue>(() => ({
        config,
        loading,
        unavailable: !loading && !config,
        formatMoney: (amount) => {
            if (amount == null || Number.isNaN(amount)) return "";
            const code = config?.currency.abbreviation;
            return code ? formatCurrency(amount, code, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : amount.toFixed(2);
        },
    }), [config, loading]);

    return <RentalConfigContext.Provider value={value}>{children}</RentalConfigContext.Provider>;
}

export function useRentalConfig(): RentalConfigContextValue {
    return useContext(RentalConfigContext);
}
