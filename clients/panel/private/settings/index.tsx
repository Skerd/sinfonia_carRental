import {compose} from "redux";
import {useLocation} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import SimpleError from "@coreModule/components/custom/errors/errorViewWrapper.tsx";
import type {CarRentalConfig} from "armonia/src/modules/carRental/api/carRental/private/carRentalConfig/carRentalConfig.dto.ts";
import EditCarRentalConfig from "@carRentalModule/clients/panel/private/settings/editCarRentalConfig.tsx";
import {isCarRentalConfigSection, type CarRentalConfigSection} from "@carRentalModule/clients/panel/private/settings/carRentalConfigSections.ts";

const ENSURE_CONFIG_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/carRentalConfig/ensure"};

/** One settings record per company: make sure it exists, then edit the open section in place. */
function CarRentalSettingsGate({resolveLanguageKey}: WithLanguageType) {
    const {pathname} = useLocation();
    const segment = pathname.split("/").filter(Boolean)[3];
    const section: CarRentalConfigSection = isCarRentalConfigSection(segment) ? segment : "booking";

    const {data: config, error} = useHttpRequest<CarRentalConfig>(ENSURE_CONFIG_REQUEST, {}, 1);

    if (error) return <SimpleError title={String(resolveLanguageKey("loadError"))} />;
    if (!config) return <Loader />;
    const sectionTitle = String(resolveLanguageKey(`menus.tenancy.systemSettings.carRentalConfig.${section}.title`));
    return <EditCarRentalConfig key={section} entityId={config._id} entityName={sectionTitle} />;
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/settings/index.tsx"),
    withDebug(true, true, "carrentalconfigs"),
)(CarRentalSettingsGate);
