import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalSearchForm from "../shared/rentalSearchForm.tsx";
import RentalCategoryFacts from "../shared/rentalCategoryFacts.tsx";
import {RENT_CARD, RENT_HEADING} from "../shared/rentalStyles.ts";

function HomePage({resolveLanguageKey}: WithLanguageType) {
    const {config, formatMoney} = useRentalConfig();
    if (!config) return null;

    return (
        <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-6">
                <div className="max-w-2xl">
                    <h1 className={`${RENT_HEADING} text-3xl sm:text-4xl`}>{resolveLanguageKey("title")}</h1>
                    <p className="mt-3 text-lg text-rent-ink-muted">{resolveLanguageKey("subtitle")}</p>
                </div>
                <div className={RENT_CARD}>
                    <RentalSearchForm />
                </div>
            </section>

            {config.categories.length ? (
                <section className="flex flex-col gap-4">
                    <h2 className={`${RENT_HEADING} text-2xl`}>{resolveLanguageKey("fleetTitle")}</h2>
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {config.categories.map((category) => (
                            <li key={category._id} className="overflow-hidden rounded-2xl border border-rent-border bg-rent-card">
                                {category.images[0] ? (
                                    <img src={category.images[0]} alt={category.name} className="aspect-[16/10] w-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="aspect-[16/10] w-full bg-rent-surface" aria-hidden />
                                )}
                                <div className="flex flex-col gap-2 p-5">
                                    <h3 className={`${RENT_HEADING} text-lg`}>{category.name}</h3>
                                    <RentalCategoryFacts category={category} />
                                    <p className="text-sm">
                                        {resolveLanguageKey("from")} <span className="font-semibold">{formatMoney(category.dailyRate)}</span> {resolveLanguageKey("perDay")}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/home/index.tsx"))(HomePage);
