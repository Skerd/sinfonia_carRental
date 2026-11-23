import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {usePortalTitle} from "@coreModule/clients/portal/shared/portalTitle.ts";
import {useRentalConfig} from "../shared/rentalConfigContext.tsx";

/** The rental terms the business publishes; plain text, kept as the business wrote it. */
function TermsPage({resolveLanguageKey}: WithLanguageType) {
    const {config} = useRentalConfig();
    usePortalTitle(resolveLanguageKey("title"));
    return (
        <article className="mx-auto flex max-w-3xl flex-col gap-4">
            <h1 className="font-display font-bold tracking-tight text-3xl sm:text-4xl">{resolveLanguageKey("title")}</h1>
            {config?.termsVersion ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("version")} {config.termsVersion}</p> : null}
            <div className="whitespace-pre-line leading-relaxed text-foreground">{config?.termsText || resolveLanguageKey("empty")}</div>
        </article>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/terms/index.tsx"))(TermsPage);
