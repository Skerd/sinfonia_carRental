import {lazy} from "react";
import type {WidgetContribution} from "@coreModule/helpers/types/widgetContribution.types.ts";
import VehicleDamageCard from "@carRentalModule/clients/panel/private/damages/center/cardView/vehicleDamageCard.tsx";

const VehicleSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/vehicles/center/sheetView/vehicleSheetView.tsx"),
);
const VehicleDamageSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/damages/center/sheetView/vehicleDamageSheetView.tsx"),
);
const VehicleMaintenanceSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/maintenance/center/sheetView/vehicleMaintenanceSheetView.tsx"),
);
const VehicleInsuranceSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/insurance/center/sheetView/vehicleInsuranceSheetView.tsx"),
);
const VehicleDocumentSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/documents/center/sheetView/vehicleDocumentSheetView.tsx"),
);
const VehicleFineSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/fines/center/sheetView/vehicleFineSheetView.tsx"),
);
const VehicleTransferSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/transfers/center/sheetView/vehicleTransferSheetView.tsx"),
);
const RentalReservationSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/reservations/center/sheetView/rentalReservationSheetView.tsx"),
);
const RentalLocationSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/locations/center/sheetView/rentalLocationSheetView.tsx"),
);
const VehicleCategorySheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/categories/center/sheetView/vehicleCategorySheetView.tsx"),
);
const VehicleBlockSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/blocks/center/sheetView/vehicleBlockSheetView.tsx"),
);
const RentalExtraSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/extras/center/sheetView/rentalExtraSheetView.tsx"),
);
const RentalPromoCodeSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/promoCodes/center/sheetView/rentalPromoCodeSheetView.tsx"),
);
const RentalBusinessAccountSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/businessAccounts/center/sheetView/rentalBusinessAccountSheetView.tsx"),
);
const RentalSubscriptionSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/subscriptions/center/sheetView/rentalSubscriptionSheetView.tsx"),
);
const RentalReviewSheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/reviews/center/sheetView/rentalReviewSheetView.tsx"),
);
const RentalDenyEntrySheetViewLazy = lazy(
    () => import("@carRentalModule/clients/panel/private/denyList/center/sheetView/rentalDenyEntrySheetView.tsx"),
);

const carRentalWidgetContribution: WidgetContribution = {
    id: "carRental",
    order: 40,
    widgets: {
        "#VehicleSheetView": VehicleSheetViewLazy,
        "#VehicleDamageSheetView": VehicleDamageSheetViewLazy,
        "#VehicleMaintenanceSheetView": VehicleMaintenanceSheetViewLazy,
        "#VehicleInsuranceSheetView": VehicleInsuranceSheetViewLazy,
        "#VehicleDocumentSheetView": VehicleDocumentSheetViewLazy,
        "#VehicleFineSheetView": VehicleFineSheetViewLazy,
        "#VehicleTransferSheetView": VehicleTransferSheetViewLazy,
        "#RentalReservationSheetView": RentalReservationSheetViewLazy,
        "#RentalLocationSheetView": RentalLocationSheetViewLazy,
        "#VehicleCategorySheetView": VehicleCategorySheetViewLazy,
        "#VehicleBlockSheetView": VehicleBlockSheetViewLazy,
        "#RentalExtraSheetView": RentalExtraSheetViewLazy,
        "#RentalPromoCodeSheetView": RentalPromoCodeSheetViewLazy,
        "#RentalBusinessAccountSheetView": RentalBusinessAccountSheetViewLazy,
        "#RentalSubscriptionSheetView": RentalSubscriptionSheetViewLazy,
        "#RentalReviewSheetView": RentalReviewSheetViewLazy,
        "#RentalDenyEntrySheetView": RentalDenyEntrySheetViewLazy,
        "#VehicleDamageCard": VehicleDamageCard,
    },
    referencesDefaultItemProps: {
        "#VehicleDamageCard": "vehicleDamage",
    },
    auditSinglePostHints: {
        "#VehicleSheetView": {url: "/api/carRental/vehicle/single", labelFields: ["plate"]},
        "#VehicleDamageSheetView": {url: "/api/carRental/vehicleDamage/single", labelFields: ["description"]},
        "#VehicleMaintenanceSheetView": {url: "/api/carRental/vehicleMaintenance/single", labelFields: ["provider", "description"]},
        "#VehicleInsuranceSheetView": {url: "/api/carRental/vehicleInsurance/single", labelFields: ["policyNumber"]},
        "#VehicleDocumentSheetView": {url: "/api/carRental/vehicleDocument/single", labelFields: ["documentNumber", "type"]},
        "#VehicleFineSheetView": {url: "/api/carRental/vehicleFine/single", labelFields: ["reference"]},
        "#VehicleTransferSheetView": {url: "/api/carRental/vehicleTransfer/single", labelFields: []},
        "#RentalReservationSheetView": {url: "/api/carRental/rentalReservation/single", labelFields: ["number"]},
        "#RentalLocationSheetView": {url: "/api/carRental/rentalLocation/single", labelFields: ["name"]},
        "#VehicleCategorySheetView": {url: "/api/carRental/vehicleCategory/single", labelFields: ["name"]},
        "#VehicleBlockSheetView": {url: "/api/carRental/vehicleBlock/single", labelFields: ["reason"]},
        "#RentalExtraSheetView": {url: "/api/carRental/rentalExtra/single", labelFields: ["name"]},
        "#RentalPromoCodeSheetView": {url: "/api/carRental/rentalPromoCode/single", labelFields: ["code"]},
        "#RentalBusinessAccountSheetView": {url: "/api/carRental/rentalBusinessAccount/single", labelFields: ["name"]},
        "#RentalSubscriptionSheetView": {url: "/api/carRental/rentalSubscription/single", labelFields: ["contactName"]},
        "#RentalReviewSheetView": {url: "/api/carRental/rentalReview/single", labelFields: ["authorName"]},
        "#RentalDenyEntrySheetView": {url: "/api/carRental/rentalDenyEntry/single", labelFields: ["reason"]},
    },
};

export default carRentalWidgetContribution;
