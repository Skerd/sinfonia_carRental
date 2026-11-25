import {lazy, type ReactNode} from "react";
import {Navigate} from "react-router-dom";
import type {
    RouteConfigArgs,
    RouteConfigContribution,
} from "@coreModule/helpers/types/routeConfigContribution.types.ts";
import {
    carRentalConfigSectionPath,
    isCarRentalConfigSection,
} from "@carRentalModule/clients/panel/private/settings/carRentalConfigSections.ts";

// Pages load on first visit (D21); the panel shell's Suspense boundary shows the loader.
const RentalPlannerPage = lazy(() => import("@carRentalModule/clients/panel/private/planner/index.tsx"));
const RentalCounterPage = lazy(() => import("@carRentalModule/clients/panel/private/counter/index.tsx"));
const RentalReportsPage = lazy(() => import("@carRentalModule/clients/panel/private/reports/index.tsx"));
const AllRentalReservations = lazy(() => import("@carRentalModule/clients/panel/private/reservations/index.tsx"));
const CreateRentalReservation = lazy(() => import("@carRentalModule/clients/panel/private/reservations/createRentalReservation.tsx"));
const AllVehicles = lazy(() => import("@carRentalModule/clients/panel/private/vehicles/index.tsx"));
const CreateVehicle = lazy(() => import("@carRentalModule/clients/panel/private/vehicles/createVehicle.tsx"));
const EditVehicle = lazy(() => import("@carRentalModule/clients/panel/private/vehicles/editVehicle.tsx"));
const AllVehicleBlocks = lazy(() => import("@carRentalModule/clients/panel/private/blocks/index.tsx"));
const CreateVehicleBlock = lazy(() => import("@carRentalModule/clients/panel/private/blocks/createVehicleBlock.tsx"));
const EditVehicleBlock = lazy(() => import("@carRentalModule/clients/panel/private/blocks/editVehicleBlock.tsx"));
const AllVehicleCategories = lazy(() => import("@carRentalModule/clients/panel/private/categories/index.tsx"));
const CreateVehicleCategory = lazy(() => import("@carRentalModule/clients/panel/private/categories/createVehicleCategory.tsx"));
const EditVehicleCategory = lazy(() => import("@carRentalModule/clients/panel/private/categories/editVehicleCategory.tsx"));
const AllRentalExtras = lazy(() => import("@carRentalModule/clients/panel/private/extras/index.tsx"));
const CreateRentalExtra = lazy(() => import("@carRentalModule/clients/panel/private/extras/createRentalExtra.tsx"));
const EditRentalExtra = lazy(() => import("@carRentalModule/clients/panel/private/extras/editRentalExtra.tsx"));
const AllRentalLocations = lazy(() => import("@carRentalModule/clients/panel/private/locations/index.tsx"));
const CreateRentalLocation = lazy(() => import("@carRentalModule/clients/panel/private/locations/createRentalLocation.tsx"));
const EditRentalLocation = lazy(() => import("@carRentalModule/clients/panel/private/locations/editRentalLocation.tsx"));
const CarRentalSettings = lazy(() => import("@carRentalModule/clients/panel/private/settings/index.tsx"));
const AllVehicleInsurances = lazy(() => import("@carRentalModule/clients/panel/private/insurance/index.tsx"));
const CreateVehicleInsurance = lazy(() => import("@carRentalModule/clients/panel/private/insurance/createVehicleInsurance.tsx"));
const EditVehicleInsurance = lazy(() => import("@carRentalModule/clients/panel/private/insurance/editVehicleInsurance.tsx"));
const AllVehicleDocuments = lazy(() => import("@carRentalModule/clients/panel/private/documents/index.tsx"));
const CreateVehicleDocument = lazy(() => import("@carRentalModule/clients/panel/private/documents/createVehicleDocument.tsx"));
const EditVehicleDocument = lazy(() => import("@carRentalModule/clients/panel/private/documents/editVehicleDocument.tsx"));
const AllVehicleMaintenances = lazy(() => import("@carRentalModule/clients/panel/private/maintenance/index.tsx"));
const CreateVehicleMaintenance = lazy(() => import("@carRentalModule/clients/panel/private/maintenance/createVehicleMaintenance.tsx"));
const EditVehicleMaintenance = lazy(() => import("@carRentalModule/clients/panel/private/maintenance/editVehicleMaintenance.tsx"));
const AllVehicleDamages = lazy(() => import("@carRentalModule/clients/panel/private/damages/index.tsx"));
const CreateVehicleDamage = lazy(() => import("@carRentalModule/clients/panel/private/damages/createVehicleDamage.tsx"));
const EditVehicleDamage = lazy(() => import("@carRentalModule/clients/panel/private/damages/editVehicleDamage.tsx"));
const AllRentalPromoCodes = lazy(() => import("@carRentalModule/clients/panel/private/promoCodes/index.tsx"));
const CreateRentalPromoCode = lazy(() => import("@carRentalModule/clients/panel/private/promoCodes/createRentalPromoCode.tsx"));
const EditRentalPromoCode = lazy(() => import("@carRentalModule/clients/panel/private/promoCodes/editRentalPromoCode.tsx"));
const AllVehicleFines = lazy(() => import("@carRentalModule/clients/panel/private/fines/index.tsx"));
const CreateVehicleFine = lazy(() => import("@carRentalModule/clients/panel/private/fines/createVehicleFine.tsx"));
const EditVehicleFine = lazy(() => import("@carRentalModule/clients/panel/private/fines/editVehicleFine.tsx"));
const AllVehicleTransfers = lazy(() => import("@carRentalModule/clients/panel/private/transfers/index.tsx"));
const CreateVehicleTransfer = lazy(() => import("@carRentalModule/clients/panel/private/transfers/createVehicleTransfer.tsx"));
const EditVehicleTransfer = lazy(() => import("@carRentalModule/clients/panel/private/transfers/editVehicleTransfer.tsx"));
const AllRentalBusinessAccounts = lazy(() => import("@carRentalModule/clients/panel/private/businessAccounts/index.tsx"));
const CreateRentalBusinessAccount = lazy(() => import("@carRentalModule/clients/panel/private/businessAccounts/createRentalBusinessAccount.tsx"));
const EditRentalBusinessAccount = lazy(() => import("@carRentalModule/clients/panel/private/businessAccounts/editRentalBusinessAccount.tsx"));
const AllRentalDenyEntrys = lazy(() => import("@carRentalModule/clients/panel/private/denyList/index.tsx"));
const CreateRentalDenyEntry = lazy(() => import("@carRentalModule/clients/panel/private/denyList/createRentalDenyEntry.tsx"));
const EditRentalDenyEntry = lazy(() => import("@carRentalModule/clients/panel/private/denyList/editRentalDenyEntry.tsx"));
const AllRentalReviews = lazy(() => import("@carRentalModule/clients/panel/private/reviews/index.tsx"));
const AllRentalSubscriptions = lazy(() => import("@carRentalModule/clients/panel/private/subscriptions/index.tsx"));
const CreateRentalSubscription = lazy(() => import("@carRentalModule/clients/panel/private/subscriptions/createRentalSubscription.tsx"));
const EditRentalSubscription = lazy(() => import("@carRentalModule/clients/panel/private/subscriptions/editRentalSubscription.tsx"));

/** `list` gets the URL's query. A car's records menu opens these filtered (`?vehicleId=`). */
type CrudPages = {
    list: (searchParams: URLSearchParams) => ReactNode;
    create?: () => ReactNode;
    edit?: (entityId: string) => ReactNode;
    idParam: string;
};

const PAGES: Record<string, CrudPages> = {
    planner: {list: () => <RentalPlannerPage />, idParam: ""},
    counter: {list: () => <RentalCounterPage />, idParam: ""},
    reports: {list: () => <RentalReportsPage />, idParam: ""},
    reservations: {
        list: () => <AllRentalReservations />,
        create: () => <CreateRentalReservation />,
        idParam: "rentalReservationId",
    },
    vehicles: {
        list: () => <AllVehicles />,
        create: () => <CreateVehicle />,
        edit: (id) => <EditVehicle entityId={id} />,
        idParam: "vehicleId",
    },
    blocks: {
        list: () => <AllVehicleBlocks />,
        create: () => <CreateVehicleBlock />,
        edit: (id) => <EditVehicleBlock entityId={id} />,
        idParam: "vehicleBlockId",
    },
    insurance: {
        list: () => <AllVehicleInsurances />,
        create: () => <CreateVehicleInsurance />,
        edit: (id) => <EditVehicleInsurance entityId={id} />,
        idParam: "vehicleInsuranceId",
    },
    documents: {
        list: () => <AllVehicleDocuments />,
        create: () => <CreateVehicleDocument />,
        edit: (id) => <EditVehicleDocument entityId={id} />,
        idParam: "vehicleDocumentId",
    },
    maintenance: {
        list: () => <AllVehicleMaintenances />,
        create: () => <CreateVehicleMaintenance />,
        edit: (id) => <EditVehicleMaintenance entityId={id} />,
        idParam: "vehicleMaintenanceId",
    },
    damages: {
        list: () => <AllVehicleDamages />,
        create: () => <CreateVehicleDamage />,
        edit: (id) => <EditVehicleDamage entityId={id} />,
        idParam: "vehicleDamageId",
    },
    fines: {
        list: () => <AllVehicleFines />,
        create: () => <CreateVehicleFine />,
        edit: (id) => <EditVehicleFine entityId={id} />,
        idParam: "vehicleFineId",
    },
    transfers: {
        list: () => <AllVehicleTransfers />,
        create: () => <CreateVehicleTransfer />,
        edit: (id) => <EditVehicleTransfer entityId={id} />,
        idParam: "vehicleTransferId",
    },
    businessAccounts: {
        list: () => <AllRentalBusinessAccounts />,
        create: () => <CreateRentalBusinessAccount />,
        edit: (id) => <EditRentalBusinessAccount entityId={id} />,
        idParam: "rentalBusinessAccountId",
    },
    denyList: {
        list: () => <AllRentalDenyEntrys />,
        create: () => <CreateRentalDenyEntry />,
        edit: (id) => <EditRentalDenyEntry entityId={id} />,
        idParam: "rentalDenyEntryId",
    },
    // Customers write reviews from their booking's manage link; staff only publish them, so no create or edit page.
    reviews: {
        list: () => <AllRentalReviews />,
        idParam: "rentalReviewId",
    },
    subscriptions: {
        list: () => <AllRentalSubscriptions />,
        create: () => <CreateRentalSubscription />,
        edit: (id) => <EditRentalSubscription entityId={id} />,
        idParam: "rentalSubscriptionId",
    },
};

/** Setup pages, under Tenancy → Configurations (`tenancySettingsContribution.tsx`). */
const SETTINGS_PAGES: Record<string, CrudPages> = {
    vehicleCategories: {
        list: () => <AllVehicleCategories />,
        create: () => <CreateVehicleCategory />,
        edit: (id) => <EditVehicleCategory entityId={id} />,
        idParam: "vehicleCategoryId",
    },
    rentalExtras: {
        list: () => <AllRentalExtras />,
        create: () => <CreateRentalExtra />,
        edit: (id) => <EditRentalExtra entityId={id} />,
        idParam: "rentalExtraId",
    },
    rentalLocations: {
        list: () => <AllRentalLocations />,
        create: () => <CreateRentalLocation />,
        edit: (id) => <EditRentalLocation entityId={id} />,
        idParam: "rentalLocationId",
    },
    rentalPromoCodes: {
        list: () => <AllRentalPromoCodes />,
        create: () => <CreateRentalPromoCode />,
        edit: (id) => <EditRentalPromoCode entityId={id} />,
        idParam: "rentalPromoCodeId",
    },
};

function renderPage(
    pageMap: Record<string, CrudPages>,
    key: string | undefined,
    action: string | undefined,
    searchParams: URLSearchParams,
): ReactNode {
    if (!key || !Object.hasOwn(pageMap, key)) return undefined;
    const pages = pageMap[key];
    const entityId = searchParams.get(pages.idParam);
    if (action === "create" && pages.create) return pages.create();
    if (action === "edit" && entityId && pages.edit)
        return pages.edit(entityId);
    return pages.list(searchParams);
}

const carRentalRouteConfigContribution: RouteConfigContribution = {
    id: "carRental",
    order: 36,
    contributeRoutes({menu, subview, segments, searchParams}: RouteConfigArgs) {
        if (menu === "tenancy" && subview === "systemSettings") {
            if (segments[2] === "carRentalConfig") {
                if (!isCarRentalConfigSection(segments[3]))
                    return (
                        <Navigate
                            to={carRentalConfigSectionPath("booking")}
                            replace
                        />
                    );
                return <CarRentalSettings />;
            }
            return renderPage(
                SETTINGS_PAGES,
                segments[2],
                segments[3],
                searchParams,
            );
        }
        if (menu !== "carRental") return undefined;
        return renderPage(PAGES, subview, segments[2], searchParams);
    },
};

export default carRentalRouteConfigContribution;
