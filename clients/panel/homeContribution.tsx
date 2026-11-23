import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new car rental company sets up before it can take customers (D178), in the order it needs them; each step is
 * done once its list has a row. Each step's guide points at the fields that matter most (D179), and the tour shows the
 * pages a rental desk uses every day. Texts are in this module's `menus.json` (`setup`, `guide`).
 */
const contribution: HomeContribution = {
    id: "carRental",
    order: 20,
    getSetupSteps: ({resolveLanguageKey: t}) => {
        const tip = (target: string, name: string) => ({
            target,
            title: t(`menus.carRental.guide.${name}Title`),
            text: t(`menus.carRental.guide.${name}Text`),
        });
        const save = {target: "form.save", title: t("home.guide.saveTitle"), text: t("home.guide.saveText")};
        return [
            {
                key: "carRental.location",
                title: t("menus.carRental.setup.location"),
                to: "/tenancy/systemSettings/rentalLocations/create",
                accessModel: "rentallocations",
                doneWhen: {list: {url: "/api/carRental/rentalLocation"}},
                guide: [
                    tip("field.name", "locationName"),
                    tip("field.address.country", "locationAddress"),
                    tip("field.pickupAllowed", "locationPickup"),
                    tip("field.openingHours", "locationHours"),
                    save,
                ],
            },
            {
                key: "carRental.category",
                title: t("menus.carRental.setup.category"),
                description: t("menus.carRental.setup.categoryHint"),
                to: "/tenancy/systemSettings/vehicleCategories/create",
                accessModel: "vehiclecategories",
                doneWhen: {list: {url: "/api/carRental/vehicleCategory"}},
                guide: [
                    tip("field.name", "categoryName"),
                    tip("field.images", "categoryPhotos"),
                    tip("field.dailyRate", "categoryRate"),
                    tip("field.depositAmount", "categoryDeposit"),
                    tip("field.isPublic", "categoryPublic"),
                    save,
                ],
            },
            {
                key: "carRental.vehicle",
                title: t("menus.carRental.setup.vehicle"),
                to: "/carRental/vehicles/create",
                accessModel: "vehicles",
                doneWhen: {list: {url: "/api/carRental/vehicle"}},
                guide: [
                    tip("field.category", "vehicleCategory"),
                    tip("field.plate", "vehiclePlate"),
                    tip("field.homeLocation", "vehicleHome"),
                    tip("field.status", "vehicleStatus"),
                    save,
                ],
            },
        ];
    },
    // Sidebar links, shown from wherever the person is; the tour then ends at the last one's page help. A stop the
    // person may not read is left out, so the tour never ends on a page they cannot open.
    getTour: ({resolveLanguageKey: t}) => ([
        ["counter", "rentalreservations"],
        ["planner", "rentalreservations"],
        ["reservations", "rentalreservations"],
        ["vehicles", "vehicles"],
    ] as const).map(([page, accessModel]) => ({
        target: `nav:/carRental/${page}`,
        accessModel,
        // Named as the sidebar names them.
        title: t(`menus.carRental.${page}.title`),
        text: t(`menus.carRental.guide.tour.${page}`),
    })),
};

export default contribution;
