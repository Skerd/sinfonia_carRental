import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import RentalSiteRoutes from "@carRentalModule/clients/client/public/shared/rentalSiteRoutes.tsx";
import MyRentalReservations from "./myRentalReservations.tsx";
import RentalCatalogFilters from "./rentalCatalogFilters.tsx";

/** Car rental on the portal: each company's rental site, its cars in the home catalog, and the visitor's reservations. */
const contribution: PortalContribution = {
    id: "carRental",
    order: 20,
    section: "carRental",
    path: "car-rental",
    CompanySite: RentalSiteRoutes,
    catalogs: [{kind: "vehicleCategory", Filters: RentalCatalogFilters}],
    AccountSection: MyRentalReservations,
};

export default contribution;
