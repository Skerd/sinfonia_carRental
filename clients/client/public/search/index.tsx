import {useEffect, useState} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {usePortalTitle} from "@coreModule/clients/portal/shared/portalTitle.ts";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import type {RentalSearchResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalSearchForm from "../shared/rentalSearchForm.tsx";
import RentalCategoryFacts from "../shared/rentalCategoryFacts.tsx";
import RentalCategoryMedia from "../shared/rentalCategoryMedia.tsx";
import {tripFromSearch, tripToSearch} from "../shared/rentalTripParams.ts";
import {Button} from "@coreModule/components/ui/button.tsx";

const SEARCH_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalStorefront/search", cache: true};

function SearchPage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const [params] = useSearchParams();
    const {formatMoney} = useRentalConfig();
    const trip = tripFromSearch(params);
    const tripKey = trip ? tripToSearch(trip) : "";
    const [searchCount, setSearchCount] = useState(0);
    // The trip is fully described by its query string.
    useEffect(() => {
        if (trip) setSearchCount((count) => count + 1);
    }, [tripKey]);
    const search = useHttpRequest<RentalSearchResponse>(SEARCH_REQUEST, trip ?? {}, searchCount);
    const results = search.loading || search.error ? null : search.data?.data.results ?? null;
    const error = search.error ? search.error.message || search.error.error || String(resolveLanguageKey("searchFailed")) : null;
    usePortalTitle(resolveLanguageKey("resultsTitle"));

    return (
        <div className="flex flex-col gap-10">
            <div className="rounded-3xl bg-muted p-5 sm:p-8">
                <RentalSearchForm key={tripKey} initial={trip} />
            </div>

            {!trip ? <p className="text-muted-foreground">{resolveLanguageKey("noTrip")}</p> : null}
            {error ? <p className="text-destructive" role="alert">{error}</p> : null}
            {trip && !results && !error ? <Loader /> : null}

            {results ? (
                <section className="flex flex-col gap-6" aria-live="polite">
                    <h1 className="font-display font-bold tracking-tight text-3xl sm:text-4xl">{resolveLanguageKey("resultsTitle")}</h1>
                    {results.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 rounded-3xl bg-muted px-6 py-20 text-center">
                            <p className="font-display font-bold tracking-tight text-2xl">{resolveLanguageKey("noCategories")}</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-10">
                            {results.map(({category, available, quote}) => (
                                <li key={category._id} className="grid gap-6 sm:grid-cols-[240px_1fr] sm:items-center">
                                    <RentalCategoryMedia category={category} coverClassName="aspect-[4/5] w-full rounded-2xl" />
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div className="flex flex-col gap-1.5">
                                            <h2 className="font-display font-bold tracking-tight text-xl">{category.name}</h2>
                                            <p className="text-sm text-muted-foreground">{resolveLanguageKey("orSimilar")}</p>
                                            <RentalCategoryFacts category={category} />
                                            <p className="text-sm text-muted-foreground">
                                                {category.mileagePolicy === "unlimited"
                                                    ? resolveLanguageKey("unlimitedKm")
                                                    : `${category.includedKmPerDay ?? 0} ${resolveLanguageKey("kmPerDayIncluded")}`}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-start gap-2 sm:items-end">
                                            <p className="font-display text-2xl font-semibold tabular-nums">{formatMoney(quote.grandTotal)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {quote.rentalDays} {resolveLanguageKey(quote.rentalDays === 1 ? "day" : "days")}
                                                {quote.pricesIncludeVat && quote.vatRate > 0 ? ` · ${resolveLanguageKey("vatIncluded")}` : ""}
                                            </p>
                                            {available ? (
                                                <Button asChild size="lg"><Link to={`${base}/book/${category.slug || category._id}?${tripKey}`}>{resolveLanguageKey("choose")}</Link></Button>
                                            ) : (
                                                <span className="text-sm font-medium text-destructive">{resolveLanguageKey("soldOut")}</span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/search/index.tsx"))(SearchPage);
