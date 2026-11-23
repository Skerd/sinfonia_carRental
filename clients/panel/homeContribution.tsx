import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new car rental company sets up before it can take customers (D178), in the order it needs them; each step is
 * done once its list has a row. Labels are in this module's `menus.json`.
 */
const contribution: HomeContribution = {
    id: "carRental",
    order: 20,
    getSetupSteps: ({resolveLanguageKey: t}) => [
        {
            key: "carRental.location",
            title: t("menus.carRental.setup.location"),
            to: "/tenancy/systemSettings/rentalLocations/create",
            accessModel: "rentallocations",
            doneWhen: {list: {url: "/api/carRental/rentalLocation"}},
        },
        {
            key: "carRental.category",
            title: t("menus.carRental.setup.category"),
            description: t("menus.carRental.setup.categoryHint"),
            to: "/tenancy/systemSettings/vehicleCategories/create",
            accessModel: "vehiclecategories",
            doneWhen: {list: {url: "/api/carRental/vehicleCategory"}},
        },
        {
            key: "carRental.vehicle",
            title: t("menus.carRental.setup.vehicle"),
            to: "/carRental/vehicles/create",
            accessModel: "vehicles",
            doneWhen: {list: {url: "/api/carRental/vehicle"}},
        },
    ],
};

export default contribution;
