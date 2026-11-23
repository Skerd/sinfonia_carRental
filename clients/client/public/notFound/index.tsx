import {compose} from "redux";
import {Link} from "react-router-dom";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {usePortalTitle} from "@coreModule/clients/portal/shared/portalTitle.ts";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";

function NotFoundPage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    usePortalTitle(resolveLanguageKey("title"));
    return (
        <div className="py-20 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
            <h1 className="font-display font-bold tracking-tight mt-2 text-4xl">{resolveLanguageKey("title")}</h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">{resolveLanguageKey("text")}</p>
            <div className="mt-8 flex justify-center">
                <Button asChild size="lg"><Link to={base}>{resolveLanguageKey("backHome")}</Link></Button>
            </div>
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/notFound/index.tsx"))(NotFoundPage);
