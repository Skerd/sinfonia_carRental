/** Path segments under `/tenancy/systemSettings/carRentalConfig/`. One page per settings block. */
export const CAR_RENTAL_CONFIG_SECTIONS = ["booking", "payment", "terms", "alerts"] as const;

export type CarRentalConfigSection = (typeof CAR_RENTAL_CONFIG_SECTIONS)[number];

export function isCarRentalConfigSection(value: string | undefined): value is CarRentalConfigSection {
    return !!value && (CAR_RENTAL_CONFIG_SECTIONS as readonly string[]).includes(value);
}

export function carRentalConfigSectionPath(section: CarRentalConfigSection): string {
    return `/tenancy/systemSettings/carRentalConfig/${section}`;
}
