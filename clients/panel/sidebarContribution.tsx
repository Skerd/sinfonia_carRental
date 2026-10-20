import {IconAdjustments, IconCalendarEvent, IconCar, IconCategory, IconMapPin, IconPlus, IconTool} from "@tabler/icons-react";
import type {SidebarContribution} from "@coreModule/helpers/types/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

const carRentalSidebarContribution: SidebarContribution = {
    id: "carRental",
    order: 36,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const item = (key: string, icon: NavItem["icon"], permission: string): NavItem => ({
            title: resolveLanguageKey(`menus.carRental.${key}.title`),
            url: `/carRental/${key}`,
            icon,
            permissions: [permission],
            usersPermissions: [],
            atLeastOnePermission: true,
        });
        return [
            {
                title: resolveLanguageKey("menus.carRental.title"),
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
                items: [
                    item("reservations", IconCalendarEvent, "rentalreservations"),
                    item("vehicles", IconCar, "vehicles"),
                    item("blocks", IconTool, "vehicleblocks"),
                    item("categories", IconCategory, "vehiclecategories"),
                    item("extras", IconPlus, "rentalextras"),
                    item("locations", IconMapPin, "rentallocations"),
                    item("settings", IconAdjustments, "carrentalconfigs"),
                ],
            },
        ];
    },
};

export default carRentalSidebarContribution;
