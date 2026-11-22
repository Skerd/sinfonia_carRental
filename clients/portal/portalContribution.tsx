import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import {prefetchHttpRequest} from "@coreModule/helpers/apiClient/responseCache.ts";
import {RENTAL_CONFIG_REQUEST} from "@carRentalModule/clients/client/public/shared/rentalConfigContext.tsx";
import RentalSiteRoutes from "@carRentalModule/clients/client/public/shared/rentalSiteRoutes.tsx";
import MyRentalReservations from "./myRentalReservations.tsx";
import RentalCatalogFilters from "./rentalCatalogFilters.tsx";
import {IconCar} from "@tabler/icons-react";
import BusinessTypeSummary from "./businessTypeSummary.tsx";

/** Car rental on the portal: each company's rental site, its cars in the home catalog, and the visitor's reservations. */
const contribution: PortalContribution = {
    id: "carRental",
    order: 20,
    section: "carRental",
    path: "car-rental",
    CompanySite: RentalSiteRoutes,
    catalogs: [{kind: "vehicleCategory", Filters: RentalCatalogFilters}],
    AccountSection: MyRentalReservations,
    // A link into a company's site about to be followed: the page's code and the site's settings and fleet.
    prefetch: ({path, siteCompany}) => {
        if (path === "/") void import("@carRentalModule/clients/client/public/home/index.tsx");
        else if (path.startsWith("/categories/")) void import("@carRentalModule/clients/client/public/category/index.tsx");
        else if (path === "/search") void import("@carRentalModule/clients/client/public/search/index.tsx");
        else return;
        prefetchHttpRequest(RENTAL_CONFIG_REQUEST, {}, {siteCompany});
    },
    // A person may create this kind of business on the portal (D178); the API declares the same key.
    businessType: {key: "carRental", Icon: IconCar, Summary: BusinessTypeSummary},
};

export default contribution;
