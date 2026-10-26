import type {PortalContribution} from "@coreModule/helpers/types/portalContribution.types.ts";
import RentalSiteRoutes from "@carRentalModule/clients/client/public/shared/rentalSiteRoutes.tsx";
import RentalPortalSearch from "./rentalPortalSearch.tsx";
import MyRentalReservations from "./myRentalReservations.tsx";

/** Car rental on the portal: each company's rental site, a date search across them, and the visitor's reservations. */
const contribution: PortalContribution = {
    id: "carRental",
    order: 20,
    section: "carRental",
    path: "car-rental",
    CompanySite: RentalSiteRoutes,
    SectionSearch: RentalPortalSearch,
    AccountSection: MyRentalReservations,
};

export default contribution;
