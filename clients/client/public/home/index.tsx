import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import RentalSearchForm from "../shared/rentalSearchForm.tsx";
import RentalCategoryFacts from "../shared/rentalCategoryFacts.tsx";

function HomePage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {config, formatMoney} = useRentalConfig();
    if (!config) return null;

    return (
        <div className="flex flex-col gap-16 sm:gap-20">
            <section className="rounded-3xl bg-muted px-6 py-16 sm:px-12 sm:py-24">
                <h1 className="font-display font-bold tracking-tight max-w-3xl text-4xl leading-[1.05] sm:text-6xl">{resolveLanguageKey("title")}</h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{resolveLanguageKey("subtitle")}</p>
                <div className="mt-8">
                    <RentalSearchForm />
                </div>
            </section>

            {config.categories.length ? (
                <section className="flex flex-col gap-6">
                    <h2 className="font-display font-bold tracking-tight text-2xl sm:text-3xl">{resolveLanguageKey("fleetTitle")}</h2>
                    <ul className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-6">
                        {config.categories.map((category) => (
                            <li key={category._id}>
                                <Link to={`${base}/categories/${category._id}`} className="group flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                                    {category.images[0] ? (
                                        <img src={category.images[0]} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" loading="lazy" />
                                    ) : (
                                        <div className="aspect-[4/5] w-full rounded-2xl bg-muted" aria-hidden />
                                    )}
                                    <h3 className="font-display text-lg font-bold tracking-tight">{category.name}</h3>
                                    <RentalCategoryFacts category={category} />
                                    <p className="font-display text-[15px] font-semibold tabular-nums">
                                        {resolveLanguageKey("from")} {formatMoney(category.dailyRate)} {resolveLanguageKey("perDay")}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/home/index.tsx"))(HomePage);
