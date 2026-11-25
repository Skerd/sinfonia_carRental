import {useEffect, useState} from "react";
import {compose} from "redux";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {type TablerIcon, IconSettings, IconDoorEnter, IconGasStation, IconLuggage, IconUsers} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import DetailPage, {DetailFacts, DetailHeading, DetailPrice, DetailSection, DetailSpecs, DetailStatus, DetailText} from "@coreModule/clients/portal/shared/detailPage.tsx";
import DetailGallery from "@coreModule/clients/portal/shared/detailGallery.tsx";
import PortalProviderCard from "@coreModule/clients/portal/shared/portalProviderCard.tsx";
import ReportButton from "@coreModule/components/custom/report/reportButton.tsx";
import type {QuoteRentalFormType} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.forms.ts";
import type {RentalQuoteResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalSearchForm from "../shared/rentalSearchForm.tsx";
import CategoryReviews from "./categoryReviews.tsx";
import {tripFromSearch, tripToSearch, type RentalTripParams} from "../shared/rentalTripParams.ts";

const QUOTE_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalStorefront/quote"};

const LANGUAGE_PATH = "src/modules/carRental/clients/client/public/category/index.tsx";

function CategoryPage({resolveLanguageKey, currentLanguage}: WithLanguageType) {
    const base = useSectionBase();
    // A class opens by its web address (slug); links made with its id still open it.
    const {categoryId = ""} = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const {config, loading, formatMoney} = useRentalConfig();
    const category = config?.categories.find((entry) => entry.slug === categoryId || entry._id === categoryId);
    const initial = tripFromSearch(params);
    const [trip, setTrip] = useState<RentalTripParams | null>(initial);
    const tripKey = trip ? tripToSearch(trip) : "";
    const returnsBeforePickup = !!trip && `${trip.returnDate}T${trip.returnTime}` <= `${trip.pickupDate}T${trip.pickupTime}`;
    const quotable = !!trip && !!category && !!trip.pickupLocation && !returnsBeforePickup;
    const [quoteCount, setQuoteCount] = useState(0);
    useEffect(() => {
        if (quotable) setQuoteCount((count) => count + 1);
    }, [tripKey, category?._id]);
    const quoteBody: QuoteRentalFormType | Record<string, never> = trip && category ? {...trip, category: category._id, extras: []} : {};
    const quoteRequest = useHttpRequest<RentalQuoteResponse>(QUOTE_REQUEST, quoteBody, quoteCount);
    const quote = quotable && !quoteRequest.error ? quoteRequest.data?.data ?? null : null;
    const quoteError = quotable && quoteRequest.error
        ? quoteRequest.error.message || quoteRequest.error.error || String(resolveLanguageKey("quoteFailed"))
        : null;

    /* The facts and specs are keyed by their translated labels, which are all "" until this page's
       dictionary arrives; rendering them then gave React duplicate keys (TD-F33). */
    if (loading || !currentLanguage) {
        return (
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
                <div className="flex flex-col gap-4 pt-4">
                    <div className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
                    <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
                <h1 className="font-display text-3xl font-semibold">{resolveLanguageKey("notFound")}</h1>
                <p className="text-muted-foreground">{resolveLanguageKey("notFoundMessage")}</p>
                <Button asChild variant="link" className="h-auto p-0"><Link to={base}>{resolveLanguageKey("backToFleet")}</Link></Button>
            </div>
        );
    }

    const facts = [
        {icon: IconUsers, label: resolveLanguageKey("facts.seats"), value: String(category.seats)},
        category.doors != null && {icon: IconDoorEnter, label: resolveLanguageKey("facts.doors"), value: String(category.doors)},
        category.luggage != null && {icon: IconLuggage, label: resolveLanguageKey("facts.bags"), value: String(category.luggage)},
        {icon: IconSettings, label: resolveLanguageKey("facts.transmission"), value: resolveLanguageKey(`transmission.${category.transmission}`)},
        {icon: IconGasStation, label: resolveLanguageKey("facts.fuel"), value: resolveLanguageKey(`fuel.${category.fuelType}`)},
    ].filter((fact): fact is {icon: TablerIcon; label: string; value: string} => Boolean(fact));

    const specs = [
        {label: resolveLanguageKey("deposit"), value: formatMoney(category.depositAmount)},
        {
            label: resolveLanguageKey("mileage"),
            value: category.mileagePolicy === "unlimited"
                ? resolveLanguageKey("unlimitedKm")
                : `${category.includedKmPerDay ?? 0} ${resolveLanguageKey("kmPerDayIncluded")}`,
        },
        category.minDriverAge != null && {label: resolveLanguageKey("minDriverAge"), value: String(category.minDriverAge)},
    ].filter((row): row is {label: string; value: string} => Boolean(row));

    const continueToBook = (next: RentalTripParams) => {
        if (!quote) return;
        navigate(`${base}/book/${category.slug || category._id}?${tripToSearch(next)}`);
    };

    return (
        <DetailPage
            kind="vehicleCategory"
            title={category.name}
            // The class as the catalog's card lists it, for its heart (TD-F148).
            keep={{kind: "vehicleCategory", id: category._id, section: "carRental", path: `/categories/${category.slug || category._id}`, title: category.name}}
            media={category.images.length || category.videos.length
                ? <DetailGallery title={category.name} images={category.images} videos={category.videos} shape="landscape" />
                : undefined}
            story={(
                <>
                    {category.description ? (
                        <DetailSection title={resolveLanguageKey("description")}>
                            <DetailText>{category.description}</DetailText>
                        </DetailSection>
                    ) : null}
                    <DetailSection title={resolveLanguageKey("details")}>
                        <div className="flex flex-col gap-8">
                            <DetailFacts facts={facts} />
                            <DetailSpecs rows={specs} />
                        </div>
                    </DetailSection>
                    <CategoryReviews categoryId={category._id} />
                </>
            )}
        >
            <PortalProviderCard kind="vehicleCategory" />
            <DetailHeading title={category.name}>
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("orSimilar")}</p>
                <DetailPrice
                    amount={quote ? formatMoney(quote.grandTotal) : formatMoney(category.dailyRate)}
                    note={quote
                        ? resolveLanguageKey(quote.rentalDays === 1 ? "forDay" : "forDays").replace("{days}", String(quote.rentalDays))
                        : resolveLanguageKey("perDay")}
                />
                {quote ? <DetailStatus tone="success">{resolveLanguageKey("available")}</DetailStatus> : null}
                {quoteError ? <DetailStatus tone="destructive">{quoteError}</DetailStatus> : null}
            </DetailHeading>
            <DetailSection title={resolveLanguageKey("tripTitle")}>
                <RentalSearchForm
                    key={initial ? tripToSearch(initial) : "new"}
                    initial={initial}
                    layout="stack"
                    submitLabel={resolveLanguageKey("continue")}
                    submitDisabled={!quote}
                    onTripChange={setTrip}
                    onSubmitTrip={continueToBook}
                />
            </DetailSection>
            {/* Something wrong with the class goes to the platform, not the company (D191). */}
            <ReportButton kind="carRental.carClass" recordId={category._id} className="self-start" />
        </DetailPage>
    );
}

export default compose(withLanguage(LANGUAGE_PATH))(CategoryPage);
