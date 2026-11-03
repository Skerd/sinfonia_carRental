import {useMemo} from "react";
import {useSearchParams} from "react-router-dom";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import type {QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {buildPageTitle} from "@coreModule/helpers/general/pageTitle.ts";
import {buildUrlWithExistingParams} from "@coreModule/helpers/general/url.ts";
import {
    buildListNavigationUrl,
    pendingScopeFilterId,
    quickFilterScopeEntries,
    quickOrScopeLabel,
    quickOrScopeParam,
    type ScopeQuickFilter,
} from "@coreModule/helpers/filter/filterUrl.ts";
import {usePromoteScopeToQuickFilters} from "@coreModule/helpers/filter/usePromoteScopeToQuickFilters.ts";

/** Legacy `vehicleId` / `vehicleName` links become the vehicle quick filter. */
export const VEHICLE_LIST_SCOPE: readonly ScopeQuickFilter[] = [
    {field: "vehicle", idParam: "vehicleId", nameParam: "vehicleName"},
];

/** A car a records menu can open lists for. Category is only needed to prefill a booking. */
export type VehicleScopeTarget = {
    _id: string;
    plate?: string;
    make?: string;
    model?: string;
    category?: {_id: string; name?: string} | string | null;
};

/** Category ref as stored on a vehicle, or the id string a select leaves behind. */
export function vehicleCategoryScope(value: unknown): VehicleScopeTarget["category"] {
    if (typeof value === "string") return value;
    if (value == null || typeof value !== "object") return undefined;
    if (!("_id" in value) || typeof value._id !== "string") return undefined;
    const name = "name" in value && typeof value.name === "string" ? value.name : undefined;
    return {_id: value._id, name};
}

/** Same label the vehicle select shows (`plate · make model`). */
export function vehicleScopeLabel(vehicle: Pick<VehicleScopeTarget, "plate" | "make" | "model">): string {
    const plate = vehicle.plate?.trim() ?? "";
    const name = [vehicle.make?.trim(), vehicle.model?.trim()].filter((part): part is string => Boolean(part)).join(" ");
    if (plate && name) return `${plate} · ${name}`;
    return plate || name;
}

/** List URL filtered to one car, with the plate in the query so the header and create form can name it. */
export function vehicleRecordsPath(key: string, vehicle: VehicleScopeTarget, from?: string): string {
    const label = vehicleScopeLabel(vehicle);
    const category = key === "reservations" ? vehicle.category : undefined;
    const categoryId = typeof category === "string" ? category : category?._id;
    const categoryName = typeof category === "string" ? undefined : category?.name;
    return buildListNavigationUrl({
        path: `/carRental/${key}`,
        from,
        policy: "scoped",
        scope: {
            vehicleId: vehicle._id,
            vehicleName: label || undefined,
            ...(categoryId ? {categoryId, ...quickFilterScopeEntries("category", categoryId, categoryName)} : {}),
            ...(categoryName ? {categoryName} : {}),
            ...quickFilterScopeEntries("vehicle", vehicle._id, label || undefined),
        },
    });
}

export function vehicleIdFromSearch(params: URLSearchParams): string {
    return quickOrScopeParam(params, "vehicle", "vehicleId");
}

export function categoryIdFromSearch(params: URLSearchParams): string {
    return quickOrScopeParam(params, "category", "categoryId");
}

export function categoryNameFromSearch(params: URLSearchParams): string {
    return quickOrScopeLabel(params, "category", "categoryName");
}

/** Plate shown on a create form opened from a car's records list. */
export function vehicleExtraTitles(params: URLSearchParams): string[] {
    const label = quickOrScopeLabel(params, "vehicle", "vehicleName");
    return label ? [label] : [];
}

/**
 * Lets the vehicle select show the plate before its options load, and lets the
 * create-form heading follow the vehicle field instead of the URL.
 */
export function vehicleFormExtras(params: URLSearchParams): Record<string, unknown> {
    const id = vehicleIdFromSearch(params);
    const label = quickOrScopeLabel(params, "vehicle", "vehicleName");
    const contextTitleLabels: Record<string, string> = {};
    if (id && label) contextTitleLabels[id] = label;
    return {
        contextTitleField: "vehicle",
        contextTitleLabels,
        ...(id && label ? {vehicleDefaultOptions: [{value: id, label}]} : {}),
    };
}

/**
 * A records list opened from one car: the vehicle is the quick filter, the header
 * names it, and Create keeps that scope in the URL.
 */
export function useVehicleScopedList(resolveLanguageKey: ResolveLanguageKey, createPath: string) {
    const [searchParams] = useSearchParams();
    usePromoteScopeToQuickFilters(VEHICLE_LIST_SCOPE);

    const pendingVehicleId = pendingScopeFilterId(searchParams, "vehicle", "vehicleId");
    const vehicleName = quickOrScopeLabel(searchParams, "vehicle", "vehicleName");

    const extraFilters = useMemo(
        () => (pendingVehicleId ? {vehicle: pendingVehicleId} : undefined),
        [pendingVehicleId],
    );
    const headerTitle = buildPageTitle(resolveLanguageKey("title"), vehicleName ? [vehicleName] : []);
    const quickFilters = useMemo<QuickFilterDef[]>(
        () => [
            {
                field: "vehicle",
                label: resolveLanguageKey("fields.vehicle"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/carRental/vehicle/select",
            },
        ],
        [resolveLanguageKey],
    );

    return {
        extraFilters,
        headerTitle,
        quickFilters,
        createPath: buildUrlWithExistingParams(window.location.href, createPath),
    };
}
