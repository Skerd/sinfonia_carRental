import {useEffect, useState} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {normalizeError} from "@coreModule/helpers/general/errors.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import type {RentalSearchResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalSearchForm from "../shared/rentalSearchForm.tsx";
import RentalCategoryFacts from "../shared/rentalCategoryFacts.tsx";
import {tripFromSearch, tripToSearch} from "../shared/rentalTripParams.ts";
import {RENT_CARD, RENT_HEADING, RENT_PRIMARY_BUTTON} from "../shared/rentalStyles.ts";

type Results = RentalSearchResponse["data"]["results"];

function SearchPage({resolveLanguageKey}: WithLanguageType) {
    const [params] = useSearchParams();
    const {formatMoney} = useRentalConfig();
    const trip = tripFromSearch(params);
    const tripKey = trip ? tripToSearch(trip) : "";
    const [results, setResults] = useState<Results | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!trip) return;
        const controller = new AbortController();
        setResults(null);
        setError(null);
        apiClient
            .post<RentalSearchResponse>("/api/carRental/rentalStorefront/search", trip, {signal: controller.signal})
            .then((res) => setResults(res.data.data.results))
            .catch((e) => {
                if (!controller.signal.aborted) setError(normalizeError(e).displayMessage ?? String(resolveLanguageKey("searchFailed")));
            });
        return () => controller.abort();
        // The trip is fully described by its query string.
    }, [tripKey]);

    return (
        <div className="flex flex-col gap-6">
            <div className={RENT_CARD}>
                <RentalSearchForm key={tripKey} initial={trip} />
            </div>

            {!trip ? <p className="text-rent-ink-muted">{resolveLanguageKey("noTrip")}</p> : null}
            {error ? <div className={`${RENT_CARD} text-rent-danger`} role="alert">{error}</div> : null}
            {trip && !results && !error ? <Loader /> : null}

            {results ? (
                <section className="flex flex-col gap-4" aria-live="polite">
                    <h1 className={`${RENT_HEADING} text-2xl`}>{resolveLanguageKey("resultsTitle")}</h1>
                    {results.length === 0 ? <p className="text-rent-ink-muted">{resolveLanguageKey("noCategories")}</p> : null}
                    <ul className="flex flex-col gap-4">
                        {results.map(({category, available, quote}) => (
                            <li key={category._id} className="grid overflow-hidden rounded-2xl border border-rent-border bg-rent-card sm:grid-cols-[240px_1fr]">
                                {category.images[0] ? (
                                    <img src={category.images[0]} alt={category.name} className="h-full max-h-56 w-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="min-h-32 bg-rent-surface" aria-hidden />
                                )}
                                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex flex-col gap-1.5">
                                        <h2 className={`${RENT_HEADING} text-xl`}>{category.name}</h2>
                                        <p className="text-sm text-rent-ink-faded">{resolveLanguageKey("orSimilar")}</p>
                                        <RentalCategoryFacts category={category} />
                                        <p className="text-sm text-rent-ink-muted">
                                            {category.mileagePolicy === "unlimited"
                                                ? resolveLanguageKey("unlimitedKm")
                                                : `${category.includedKmPerDay ?? 0} ${resolveLanguageKey("kmPerDayIncluded")}`}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start gap-2 sm:items-end">
                                        <p className="text-2xl font-semibold">{formatMoney(quote.grandTotal)}</p>
                                        <p className="text-sm text-rent-ink-muted">
                                            {quote.rentalDays} {resolveLanguageKey(quote.rentalDays === 1 ? "day" : "days")}
                                            {quote.pricesIncludeVat && quote.vatRate > 0 ? ` · ${resolveLanguageKey("vatIncluded")}` : ""}
                                        </p>
                                        {available ? (
                                            <Link to={`/book/${category._id}?${tripKey}`} className={RENT_PRIMARY_BUTTON}>{resolveLanguageKey("choose")}</Link>
                                        ) : (
                                            <span className="text-sm font-medium text-rent-danger">{resolveLanguageKey("soldOut")}</span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/search/index.tsx"))(SearchPage);
