import type {ReactNode} from "react";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/helpers/types/routeConfigContribution.types.ts";
import AllRentalReservations from "@carRentalModule/clients/panel/private/reservations/index.tsx";
import CreateRentalReservation from "@carRentalModule/clients/panel/private/reservations/createRentalReservation.tsx";
import AllVehicles from "@carRentalModule/clients/panel/private/vehicles/index.tsx";
import CreateVehicle from "@carRentalModule/clients/panel/private/vehicles/createVehicle.tsx";
import EditVehicle from "@carRentalModule/clients/panel/private/vehicles/editVehicle.tsx";
import AllVehicleBlocks from "@carRentalModule/clients/panel/private/blocks/index.tsx";
import CreateVehicleBlock from "@carRentalModule/clients/panel/private/blocks/createVehicleBlock.tsx";
import EditVehicleBlock from "@carRentalModule/clients/panel/private/blocks/editVehicleBlock.tsx";
import AllVehicleCategories from "@carRentalModule/clients/panel/private/categories/index.tsx";
import CreateVehicleCategory from "@carRentalModule/clients/panel/private/categories/createVehicleCategory.tsx";
import EditVehicleCategory from "@carRentalModule/clients/panel/private/categories/editVehicleCategory.tsx";
import AllRentalExtras from "@carRentalModule/clients/panel/private/extras/index.tsx";
import CreateRentalExtra from "@carRentalModule/clients/panel/private/extras/createRentalExtra.tsx";
import EditRentalExtra from "@carRentalModule/clients/panel/private/extras/editRentalExtra.tsx";
import AllRentalLocations from "@carRentalModule/clients/panel/private/locations/index.tsx";
import CreateRentalLocation from "@carRentalModule/clients/panel/private/locations/createRentalLocation.tsx";
import EditRentalLocation from "@carRentalModule/clients/panel/private/locations/editRentalLocation.tsx";
import CarRentalSettings from "@carRentalModule/clients/panel/private/settings/index.tsx";
import AllVehicleInsurances from "@carRentalModule/clients/panel/private/insurance/index.tsx";
import CreateVehicleInsurance from "@carRentalModule/clients/panel/private/insurance/createVehicleInsurance.tsx";
import EditVehicleInsurance from "@carRentalModule/clients/panel/private/insurance/editVehicleInsurance.tsx";
import AllVehicleDocuments from "@carRentalModule/clients/panel/private/documents/index.tsx";
import CreateVehicleDocument from "@carRentalModule/clients/panel/private/documents/createVehicleDocument.tsx";
import EditVehicleDocument from "@carRentalModule/clients/panel/private/documents/editVehicleDocument.tsx";
import AllVehicleMaintenances from "@carRentalModule/clients/panel/private/maintenance/index.tsx";
import CreateVehicleMaintenance from "@carRentalModule/clients/panel/private/maintenance/createVehicleMaintenance.tsx";
import EditVehicleMaintenance from "@carRentalModule/clients/panel/private/maintenance/editVehicleMaintenance.tsx";
import AllVehicleDamages from "@carRentalModule/clients/panel/private/damages/index.tsx";
import CreateVehicleDamage from "@carRentalModule/clients/panel/private/damages/createVehicleDamage.tsx";
import EditVehicleDamage from "@carRentalModule/clients/panel/private/damages/editVehicleDamage.tsx";

/** `list` gets the URL's query, so a list can open filtered (`?vehicleId=` from a car's records menu). */
type CrudPages = {list: (searchParams: URLSearchParams) => ReactNode; create?: () => ReactNode; edit?: (entityId: string) => ReactNode; idParam: string};
const vehicleOf = (searchParams: URLSearchParams) => searchParams.get("vehicleId") ?? undefined;

const PAGES: Record<string, CrudPages> = {
    reservations: {list: (p) => <AllRentalReservations vehicleId={vehicleOf(p)} />, create: () => <CreateRentalReservation />, idParam: "rentalReservationId"},
    vehicles: {list: () => <AllVehicles />, create: () => <CreateVehicle />, edit: (id) => <EditVehicle entityId={id} />, idParam: "vehicleId"},
    blocks: {list: () => <AllVehicleBlocks />, create: () => <CreateVehicleBlock />, edit: (id) => <EditVehicleBlock entityId={id} />, idParam: "vehicleBlockId"},
    insurance: {list: (p) => <AllVehicleInsurances vehicleId={vehicleOf(p)} />, create: () => <CreateVehicleInsurance />, edit: (id) => <EditVehicleInsurance entityId={id} />, idParam: "vehicleInsuranceId"},
    documents: {list: (p) => <AllVehicleDocuments vehicleId={vehicleOf(p)} />, create: () => <CreateVehicleDocument />, edit: (id) => <EditVehicleDocument entityId={id} />, idParam: "vehicleDocumentId"},
    maintenance: {list: (p) => <AllVehicleMaintenances vehicleId={vehicleOf(p)} />, create: () => <CreateVehicleMaintenance />, edit: (id) => <EditVehicleMaintenance entityId={id} />, idParam: "vehicleMaintenanceId"},
    damages: {list: (p) => <AllVehicleDamages vehicleId={vehicleOf(p)} />, create: () => <CreateVehicleDamage />, edit: (id) => <EditVehicleDamage entityId={id} />, idParam: "vehicleDamageId"},
};

/** Setup pages, under Tenancy → Configurations (`tenancySettingsContribution.tsx`). */
const SETTINGS_PAGES: Record<string, CrudPages> = {
    vehicleCategories: {list: () => <AllVehicleCategories />, create: () => <CreateVehicleCategory />, edit: (id) => <EditVehicleCategory entityId={id} />, idParam: "vehicleCategoryId"},
    rentalExtras: {list: () => <AllRentalExtras />, create: () => <CreateRentalExtra />, edit: (id) => <EditRentalExtra entityId={id} />, idParam: "rentalExtraId"},
    rentalLocations: {list: () => <AllRentalLocations />, create: () => <CreateRentalLocation />, edit: (id) => <EditRentalLocation entityId={id} />, idParam: "rentalLocationId"},
};

function renderPage(pageMap: Record<string, CrudPages>, key: string | undefined, action: string | undefined, searchParams: URLSearchParams): ReactNode {
    if (!key || !Object.hasOwn(pageMap, key)) return undefined;
    const pages = pageMap[key];
    const entityId = searchParams.get(pages.idParam);
    if (action === "create" && pages.create) return pages.create();
    if (action === "edit" && entityId && pages.edit) return pages.edit(entityId);
    return pages.list(searchParams);
}

const carRentalRouteConfigContribution: RouteConfigContribution = {
    id: "carRental",
    order: 36,
    contributeRoutes({menu, subview, segments, searchParams}: RouteConfigArgs) {
        if (menu === "tenancy" && subview === "systemSettings") {
            if (segments[2] === "carRentalConfig") return <CarRentalSettings />;
            return renderPage(SETTINGS_PAGES, segments[2], segments[3], searchParams);
        }
        if (menu !== "carRental") return undefined;
        return renderPage(PAGES, subview, segments[2], searchParams);
    },
};

export default carRentalRouteConfigContribution;
