import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {RENT_CARD, RENT_HEADING, RENT_PRIMARY_BUTTON} from "../shared/rentalStyles.ts";

function NotFoundPage({resolveLanguageKey}: WithLanguageType) {
    return (
        <div className={`${RENT_CARD} flex flex-col items-start gap-3`}>
            <h1 className={`${RENT_HEADING} text-2xl`}>{resolveLanguageKey("title")}</h1>
            <p className="text-rent-ink-muted">{resolveLanguageKey("text")}</p>
            <Link to="/" className={RENT_PRIMARY_BUTTON}>{resolveLanguageKey("backHome")}</Link>
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/notFound/index.tsx"))(NotFoundPage);
