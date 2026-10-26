import {compose} from "redux";
import {useState} from "react";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import type {RentalPortalSearchResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalPortal/rentalPortal.response.types.ts";
import {dateInDays, tripToSearch} from "@carRentalModule/clients/client/public/shared/rentalTripParams.ts";

const FIELD = "w-full rounded-xl border border-portal-border bg-portal-card px-3 py-2.5 outline-none focus:border-portal-accent";

/** Cars free for the same dates at every listed rental company in the city; booking opens the company's page. */
function RentalPortalSearch({city, resolveLanguageKey}: WithLanguageType & {city: string}) {
    const [trip, setTrip] = useState({pickupDate: dateInDays(1), pickupTime: "10:00", returnDate: dateInDays(4), returnTime: "10:00"});
    const [results, setResults] = useState<RentalPortalSearchResponse["data"] | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    const search = async () => {
        setLoading(true);
        setFailed(false);
        try {
            const res = await apiClient.post<RentalPortalSearchResponse>("/api/carRental/rentalPortal/search", {...trip, city: city || undefined});
            setResults(res.data.data);
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    };

    const field = (key: keyof typeof trip, type: "date" | "time") => (
        <label className="flex flex-col gap-1 text-sm">
            <span className="text-portal-ink-muted">{resolveLanguageKey(key)}</span>
            <input type={type} className={FIELD} value={trip[key]} onChange={(e) => setTrip({...trip, [key]: e.target.value})} />
        </label>
    );

    return (
        <div className="flex flex-col gap-5">
            <form className="grid gap-3 sm:grid-cols-[repeat(4,1fr)_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); void search(); }}>
                {field("pickupDate", "date")}
                {field("pickupTime", "time")}
                {field("returnDate", "date")}
                {field("returnTime", "time")}
                <button type="submit" disabled={loading} className="rounded-xl bg-portal-accent px-5 py-2.5 font-semibold text-white hover:bg-portal-accent-strong disabled:opacity-60">
                    {resolveLanguageKey("search")}
                </button>
            </form>
            {loading ? <Loader /> : failed ? (
                <p className="text-portal-danger">{resolveLanguageKey("failed")}</p>
            ) : results === null ? null : results.length === 0 ? (
                <p className="text-portal-ink-muted">{resolveLanguageKey("noCars")}</p>
            ) : (
                <ul className="flex flex-col gap-4">
                    {results.map((result) => {
                        const tripQuery = tripToSearch({...trip, pickupLocation: result.location._id, returnLocation: result.location._id});
                        return (
                            <li key={result.company._id} className="flex flex-col gap-3 rounded-xl border border-portal-border p-4">
                                <p className="font-semibold">{result.company.name} <span className="font-normal text-portal-ink-muted">· {result.location.name}</span></p>
                                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {result.results.map(({category, quote}) => (
                                        <li key={category._id} className="flex items-center justify-between gap-3 rounded-lg bg-portal-surface px-3 py-2">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{category.name}</p>
                                                <p className="text-sm text-portal-ink-muted">{formatCurrency(quote.grandTotal, quote.currency.abbreviation)}</p>
                                            </div>
                                            <Link to={`/car-rental/${result.company.slug}/book/${category._id}?${tripQuery}`} className="shrink-0 text-sm font-semibold text-portal-accent hover:underline">
                                                {resolveLanguageKey("book")}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/portal/rentalPortalSearch.tsx"))(RentalPortalSearch);
