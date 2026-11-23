import {compose} from "redux";
import {IconStarFilled} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {DetailSection} from "@coreModule/clients/portal/shared/detailPage.tsx";
import type {RentalCategoryReviewsResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";

const REVIEWS_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalStorefront/reviews", cache: true};

function Stars({rating, label}: {rating: number; label: string}) {
    return (
        <span className="flex items-center gap-0.5" role="img" aria-label={label}>
            {[1, 2, 3, 4, 5].map((value) => (
                <IconStarFilled key={value} className={value <= Math.round(rating) ? "h-4 w-4 text-amber-500" : "h-4 w-4 text-muted"} aria-hidden />
            ))}
        </span>
    );
}

/**
 * A car class's published reviews on the rental site (D178): written after completed rentals and published by staff.
 * Nothing is shown until there is one.
 */
function CategoryReviews({categoryId, resolveLanguageKey}: WithLanguageType & {categoryId: string}) {
    const {data} = useHttpRequest<RentalCategoryReviewsResponse>(REVIEWS_REQUEST, {category: categoryId, limit: 10}, categoryId ? 1 : 0);
    const found = data?.data;
    // Nothing until the class has a review (an answer without a count has none either).
    if (!found?.count) return null;
    const ratingLabel = (rating: number) => resolveLanguageKey("ratingLabel").replace("{rating}", String(rating));

    return (
        <DetailSection title={resolveLanguageKey("title")}>
            <p className="flex items-center gap-2 text-sm">
                <Stars rating={found.average} label={ratingLabel(found.average)} />
                <span className="font-medium tabular-nums">{found.average.toFixed(1)}</span>
                <span className="text-muted-foreground">
                    {resolveLanguageKey(found.count === 1 ? "countOne" : "count").replace("{count}", String(found.count))}
                </span>
            </p>
            <ul className="flex flex-col divide-y">
                {found.reviews.map((review, index) => (
                    <li key={`${review.createdAt}-${index}`} className="flex flex-col gap-1.5 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Stars rating={review.rating} label={ratingLabel(review.rating)} />
                            <span className="text-xs text-muted-foreground">{formatDate(review.createdAt, {format: DATE_FORMATS.mediumDate})}</span>
                        </div>
                        {review.comment ? <p className="text-sm">{review.comment}</p> : null}
                        <p className="text-xs text-muted-foreground">{review.authorName || resolveLanguageKey("guest")}</p>
                    </li>
                ))}
            </ul>
        </DetailSection>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/category/categoryReviews.tsx"))(CategoryReviews);
