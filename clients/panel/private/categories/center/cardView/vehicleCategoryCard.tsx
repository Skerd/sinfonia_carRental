import {compose} from "redux";
import type {ReactNode, RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconArmchair, IconCash, IconHash, IconManualGearbox, IconWorld, IconWorldOff} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
import VehicleCategorySheetView from "@carRentalModule/clients/panel/private/categories/center/sheetView/vehicleCategorySheetView.tsx";
import {vehicleCategoryEditPath} from "@carRentalModule/clients/panel/private/categories/index.tsx";
import ShowVehicleCategoryOnWebsite from "@carRentalModule/clients/panel/private/categories/center/actions/showVehicleCategoryOnWebsite.tsx";
import HideVehicleCategoryFromWebsite from "@carRentalModule/clients/panel/private/categories/center/actions/hideVehicleCategoryFromWebsite.tsx";
import ShowVehicleCategoryOnWebsiteDialog from "@carRentalModule/clients/panel/private/categories/center/dialogs/showVehicleCategoryOnWebsiteDialog.tsx";
import HideVehicleCategoryFromWebsiteDialog from "@carRentalModule/clients/panel/private/categories/center/dialogs/hideVehicleCategoryFromWebsiteDialog.tsx";

type VehicleCategoryCardProps = WithLanguageType & {
    vehicleCategory: VehicleCategory;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleCategory, response?: DeletedData) => void;
    onRestore?: () => void;
    onPublicChanged?: (isPublic: boolean) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleCategory> | null>;
};

function VehicleCategoryCard({
    vehicleCategory,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onPublicChanged,
    sheetOnly = false,
    innerRef,
}: VehicleCategoryCardProps) {
    return (
        <EntityCard
            resource="vehiclecategories"
            entity={vehicleCategory}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleCategory/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleCategoryEditPath}
            Sheet={VehicleCategorySheetView}
            sheetEntityProp="vehicleCategory"
            deleteUrl="/api/carRental/vehicleCategory"
            restoreUrl="/api/carRental/vehicleCategory/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<VehicleCategory>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isPublic === "boolean") onPublicChanged?.(row.isPublic);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "showVehicleCategoryOnWebsite" && (
                        <ShowVehicleCategoryOnWebsiteDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isPublic: true});
                                onPublicChanged?.(true);
                            }}
                        />
                    )}
                    {action === "hideVehicleCategoryFromWebsite" && (
                        <HideVehicleCategoryFromWebsiteDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isPublic: false});
                                onPublicChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, read, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={row.name}
                        badgesBesideTitle
                        badges={
                            accessFieldPathExists(read, "isPublic") && row.isPublic === false ? (
                                <DisplayValue path="isPublic" value={resolveLanguageKey("hiddenFromWebsite")}>
                                    {(formatted: ReactNode) => (
                                        <span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-destructive/20 text-destructive shrink-0">
                                            <IconWorldOff className="w-3 h-3" />
                                            {formatted}
                                        </span>
                                    )}
                                </DisplayValue>
                            ) : undefined
                        }
                    >
                        <ShowVehicleCategoryOnWebsite entity={row} onAction={setAction} />
                        <HideVehicleCategoryFromWebsite entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("dailyRate")}
                            tooltip={resolveLanguageKey("dailyRate")}
                            path="dailyRate"
                            type="number"
                            value={row.dailyRate}
                        />
                        <EntityCardRow
                            icon={IconArmchair}
                            label={resolveLanguageKey("seats")}
                            tooltip={resolveLanguageKey("seats")}
                            path="seats"
                            type="number"
                            value={row.seats}
                        />
                        <EntityCardRow
                            icon={IconManualGearbox}
                            label={resolveLanguageKey("transmission")}
                            tooltip={resolveLanguageKey("transmission")}
                            path="transmission"
                            type="enum"
                            languageKeyCategory="transmissionValues"
                            value={row.transmission}
                        />
                        <EntityCardRow
                            icon={IconHash}
                            label={resolveLanguageKey("sortOrder")}
                            tooltip={resolveLanguageKey("sortOrder")}
                            path="sortOrder"
                            type="number"
                            value={row.sortOrder}
                        />
                        {row.isPublic ? (
                            <EntityCardRow
                                icon={IconWorld}
                                label={resolveLanguageKey("isPublic")}
                                tooltip={resolveLanguageKey("isPublic")}
                                path="isPublic"
                                type="boolean"
                                value={row.isPublic}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/categories/center/cardView/vehicleCategoryCard.tsx"),
    withDebug(true, true, "vehiclecategories"),
)(VehicleCategoryCard);
