import {IconAdjustments, IconCar, IconCategory, IconMapPin, IconPlus} from "@tabler/icons-react";
import type {TenancySettingsContribution} from "@coreModule/helpers/types/tenancySettingsContribution.types.ts";
import type {NavLinkItem} from "@coreModule/helpers/types/sidebarNav.types.ts";

/** Car-rental setup under Tenancy → Configurations; daily work stays in the Car rental sidebar group. */
const carRentalTenancySettingsContribution: TenancySettingsContribution = {
    id: "carRental",
    order: 36,
    getTenancySettingsItems(resolveLanguageKey) {
        const item = (key: string, resource: string, icon: NavLinkItem["icon"], permission: string): NavLinkItem => ({
            title: resolveLanguageKey(`menus.carRental.${key}.title`),
            url: `/tenancy/systemSettings/${resource}`,
            icon,
            permissions: [permission],
            usersPermissions: [],
            atLeastOnePermission: true,
        });
        return {
            title: resolveLanguageKey("menus.carRental.title"),
            icon: IconCar,
            permissions: [],
            usersPermissions: [],
            atLeastOnePermission: true,
            items: [
                item("settings", "carRentalConfig", IconAdjustments, "carrentalconfigs"),
                item("categories", "vehicleCategories", IconCategory, "vehiclecategories"),
                item("extras", "rentalExtras", IconPlus, "rentalextras"),
                item("locations", "rentalLocations", IconMapPin, "rentallocations"),
            ],
        };
    },
};

export default carRentalTenancySettingsContribution;
