import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";
import {RENT_CARD, RENT_HEADING} from "../shared/rentalStyles.ts";

/** The rental terms the business publishes; plain text, kept as the business wrote it. */
function TermsPage({resolveLanguageKey}: WithLanguageType) {
    const {config} = useRentalConfig();
    return (
        <article className={`${RENT_CARD} flex flex-col gap-4`}>
            <h1 className={`${RENT_HEADING} text-2xl`}>{resolveLanguageKey("title")}</h1>
            {config?.termsVersion ? <p className="text-sm text-rent-ink-faded">{resolveLanguageKey("version")} {config.termsVersion}</p> : null}
            <div className="whitespace-pre-line leading-relaxed text-rent-ink">{config?.termsText || resolveLanguageKey("empty")}</div>
        </article>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/terms/index.tsx"))(TermsPage);
