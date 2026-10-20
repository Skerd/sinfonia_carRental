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

type CrudPages = {list: () => ReactNode; create?: () => ReactNode; edit?: (entityId: string) => ReactNode; idParam: string};

const PAGES: Record<string, CrudPages> = {
    reservations: {list: () => <AllRentalReservations />, create: () => <CreateRentalReservation />, idParam: "rentalReservationId"},
    vehicles: {list: () => <AllVehicles />, create: () => <CreateVehicle />, edit: (id) => <EditVehicle entityId={id} />, idParam: "vehicleId"},
    blocks: {list: () => <AllVehicleBlocks />, create: () => <CreateVehicleBlock />, edit: (id) => <EditVehicleBlock entityId={id} />, idParam: "vehicleBlockId"},
    categories: {list: () => <AllVehicleCategories />, create: () => <CreateVehicleCategory />, edit: (id) => <EditVehicleCategory entityId={id} />, idParam: "vehicleCategoryId"},
    extras: {list: () => <AllRentalExtras />, create: () => <CreateRentalExtra />, edit: (id) => <EditRentalExtra entityId={id} />, idParam: "rentalExtraId"},
    locations: {list: () => <AllRentalLocations />, create: () => <CreateRentalLocation />, edit: (id) => <EditRentalLocation entityId={id} />, idParam: "rentalLocationId"},
};

const carRentalRouteConfigContribution: RouteConfigContribution = {
    id: "carRental",
    order: 36,
    contributeRoutes({menu, subview, segments, searchParams}: RouteConfigArgs) {
        if (menu !== "carRental") return undefined;
        if (subview === "settings") return <CarRentalSettings />;

        const pages = subview ? PAGES[subview] : undefined;
        if (!pages) return undefined;
        const action = segments[2];
        const entityId = searchParams.get(pages.idParam);
        if (action === "create" && pages.create) return pages.create();
        if (action === "edit" && entityId && pages.edit) return pages.edit(entityId);
        return pages.list();
    },
};

export default carRentalRouteConfigContribution;
