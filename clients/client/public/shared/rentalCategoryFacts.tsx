import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {RentalStorefrontCategory} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";

/** A category's specs, or a car's own (they are its category's unless it has its own, TD-B291). */
type Props = WithLanguageType & {category: Pick<RentalStorefrontCategory, "seats" | "doors" | "luggage" | "transmission" | "fuelType">};

/** "5 seats · 4 doors · 2 bags · Automatic · Petrol" for a category or car card. */
function RentalCategoryFacts({category, resolveLanguageKey}: Props) {
    const facts = [
        `${category.seats} ${resolveLanguageKey("seats")}`,
        category.doors ? `${category.doors} ${resolveLanguageKey("doors")}` : null,
        category.luggage !== undefined ? `${category.luggage} ${resolveLanguageKey("bags")}` : null,
        resolveLanguageKey(`transmission.${category.transmission}`),
        resolveLanguageKey(`fuel.${category.fuelType}`),
    ].filter(Boolean);
    return <p className="text-sm text-muted-foreground">{facts.join(" · ")}</p>;
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/shared/rentalCategoryFacts.tsx"))(RentalCategoryFacts);
