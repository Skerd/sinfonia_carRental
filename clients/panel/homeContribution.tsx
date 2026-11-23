import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new car rental company sets up before it can take customers (D178), in the order it needs them; each step is
 * done once its list has a row. Each step's guide points at the fields that matter most (D179), and the tour walks every
 * page of the module (D180). Texts are in this module's `menus.json` (`setup`, `guide`).
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
    // Every page of the module, desk first, each explained by its own ⓘ help (D180); a page the person may not read is
    // left out. The settings pages share one help, so the tour opens the first of them.
    getTour: ({resolveLanguageKey: t}) => [
        {
            target: "page.help",
            to: "/carRental/counter",
            accessModel: "rentalreservations",
            title: t("menus.carRental.guide.tour.introTitle"),
            text: t("menus.carRental.guide.tour.introText"),
        },
        ...([
            ["/carRental/counter", "rentalreservations"],
            ["/carRental/planner", "rentalreservations"],
            ["/carRental/reservations", "rentalreservations"],
            ["/carRental/vehicles", "vehicles"],
            ["/carRental/blocks", "vehicleblocks"],
            ["/carRental/maintenance", "vehiclemaintenances"],
            ["/carRental/damages", "vehicledamages"],
            ["/carRental/insurance", "vehicleinsurances"],
            ["/carRental/documents", "vehicledocuments"],
            ["/carRental/fines", "vehiclefines"],
            ["/carRental/transfers", "vehicletransfers"],
            ["/carRental/businessAccounts", "rentalbusinessaccounts"],
            ["/carRental/subscriptions", "rentalsubscriptions"],
            ["/carRental/reviews", "rentalreviews"],
            ["/carRental/denyList", "rentaldenyentries"],
            ["/carRental/reports", "rentalreservations"],
            ["/tenancy/systemSettings/carRentalConfig/booking", "carrentalconfigs"],
            ["/tenancy/systemSettings/vehicleCategories", "vehiclecategories"],
            ["/tenancy/systemSettings/rentalExtras", "rentalextras"],
            ["/tenancy/systemSettings/rentalLocations", "rentallocations"],
            ["/tenancy/systemSettings/rentalPromoCodes", "rentalpromocodes"],
        ] as const).map(([page, accessModel]) => ({page, accessModel})),
    ],
};

export default contribution;
