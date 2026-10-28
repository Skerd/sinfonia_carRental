import {useEffect, useState} from "react";
import {compose} from "redux";
import {Link, useNavigate, useParams, useSearchParams} from "react-router-dom";
import type {LucideIcon} from "lucide-react";
import {Cog, DoorOpen, Fuel, Luggage, Users} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {normalizeError} from "@coreModule/helpers/general/errors.ts";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import DetailPage, {DetailFacts, DetailHeading, DetailPrice, DetailSection, DetailSpecs, DetailStatus, DetailText} from "@coreModule/clients/portal/shared/detailPage.tsx";
import DetailGallery from "@coreModule/clients/portal/shared/detailGallery.tsx";
import PortalProviderCard from "@coreModule/clients/portal/shared/portalProviderCard.tsx";
import type {QuoteRentalFormType} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.forms.ts";
import type {RentalQuote, RentalQuoteResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalSearchForm from "../shared/rentalSearchForm.tsx";
import {tripFromSearch, tripToSearch, type RentalTripParams} from "../shared/rentalTripParams.ts";

const LANGUAGE_PATH = "src/modules/carRental/clients/client/public/category/index.tsx";

function CategoryPage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {categoryId = ""} = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const {config, loading, formatMoney} = useRentalConfig();
    const category = config?.categories.find((entry) => entry._id === categoryId);
    const initial = tripFromSearch(params);
    const [trip, setTrip] = useState<RentalTripParams | null>(initial);
    const [quote, setQuote] = useState<RentalQuote | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const tripKey = trip ? tripToSearch(trip) : "";

    useEffect(() => {
        if (!trip || !category) return;
        const returnsBeforePickup = `${trip.returnDate}T${trip.returnTime}` <= `${trip.pickupDate}T${trip.pickupTime}`;
        if (!trip.pickupLocation || returnsBeforePickup) {
            setQuote(null);
            setQuoteError(null);
            return;
        }
        const controller = new AbortController();
        setQuoteError(null);
        const body: QuoteRentalFormType = {...trip, category: category._id, extras: []};
        apiClient
            .post<RentalQuoteResponse>("/api/carRental/rentalStorefront/quote", body, {signal: controller.signal})
            .then((res) => setQuote(res.data.data))
            .catch((e) => {
                if (controller.signal.aborted) return;
                setQuote(null);
                setQuoteError(normalizeError(e).displayMessage ?? resolveLanguageKey("quoteFailed"));
            });
        return () => controller.abort();
    }, [tripKey, category?._id]);

    if (loading) {
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
        {icon: Users, label: resolveLanguageKey("facts.seats"), value: String(category.seats)},
        category.doors != null && {icon: DoorOpen, label: resolveLanguageKey("facts.doors"), value: String(category.doors)},
        category.luggage != null && {icon: Luggage, label: resolveLanguageKey("facts.bags"), value: String(category.luggage)},
        {icon: Cog, label: resolveLanguageKey("facts.transmission"), value: resolveLanguageKey(`transmission.${category.transmission}`)},
        {icon: Fuel, label: resolveLanguageKey("facts.fuel"), value: resolveLanguageKey(`fuel.${category.fuelType}`)},
    ].filter((fact): fact is {icon: LucideIcon; label: string; value: string} => Boolean(fact));

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
        navigate(`${base}/book/${category._id}?${tripToSearch(next)}`);
    };

    return (
        <DetailPage
            kind="vehicleCategory"
            title={category.name}
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
        </DetailPage>
    );
}

export default compose(withLanguage(LANGUAGE_PATH))(CategoryPage);
