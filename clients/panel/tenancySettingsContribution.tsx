import {IconBell, IconBook2, IconCalendarEvent, IconCar, IconCategory, IconCreditCard, IconFileText, IconMapPin, IconPlus, IconReceipt, IconTicket} from "@tabler/icons-react";
import type {TenancySettingsContribution} from "@coreModule/helpers/types/tenancySettingsContribution.types.ts";
import type {NavLinkItem, NavSubItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import {carRentalConfigSectionPath, type CarRentalConfigSection} from "@carRentalModule/clients/panel/private/settings/carRentalConfigSections.ts";

const SECTIONS: {section: CarRentalConfigSection; icon: NavLinkItem["icon"]}[] = [
    {section: "booking", icon: IconCalendarEvent},
    {section: "payment", icon: IconCreditCard},
    {section: "fees", icon: IconReceipt},
    {section: "terms", icon: IconFileText},
    {section: "alerts", icon: IconBell},
];

/** Car-rental setup under Tenancy → Configurations; daily work stays in the Car rental sidebar group. */
const carRentalTenancySettingsContribution: TenancySettingsContribution = {
    id: "carRental",
    order: 36,
    getTenancySettingsItems(resolveLanguageKey) {
        const sectionItem = (section: CarRentalConfigSection, icon: NavLinkItem["icon"]): NavLinkItem => ({
            title: resolveLanguageKey(`menus.tenancy.systemSettings.carRentalConfig.${section}.title`),
            url: carRentalConfigSectionPath(section),
            icon,
            permissions: ["carrentalconfigs"],
            usersPermissions: [],
            atLeastOnePermission: true,
        });
        const catalog = (key: string, resource: string, icon: NavLinkItem["icon"], permission: string): NavLinkItem => ({
            title: resolveLanguageKey(`menus.tenancy.systemSettings.${key}.title`),
            url: `/tenancy/systemSettings/${resource}`,
            icon,
            permissions: [permission],
            usersPermissions: [],
            atLeastOnePermission: true,
        });
        const items: NavSubItem[] = [
            ...SECTIONS.map(({section, icon}) => sectionItem(section, icon)),
            catalog("vehicleCategories", "vehicleCategories", IconCategory, "vehiclecategories"),
            catalog("rentalExtras", "rentalExtras", IconPlus, "rentalextras"),
            catalog("rentalLocations", "rentalLocations", IconMapPin, "rentallocations"),
            catalog("rentalPromoCodes", "rentalPromoCodes", IconTicket, "rentalpromocodes"),
            catalog("vehiclecatalogentries", "vehiclecatalogentries", IconBook2, "vehiclecatalogentries"),
        ];
        return {
            title: resolveLanguageKey("menus.tenancy.systemSettings.carRentalConfig.title"),
            icon: IconCar,
            permissions: [],
            usersPermissions: [],
            atLeastOnePermission: true,
            items,
        };
    },
};

export default carRentalTenancySettingsContribution;
