import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {VehicleCatalogEntry} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/vehicleCatalog.dto.ts";
import {IconArmchair, IconCar, IconCategory2, IconGasStation} from "@tabler/icons-react";
import VehicleCatalogSheetView from "@carRentalModule/clients/panel/private/vehicleCatalog/center/sheetView/vehicleCatalogSheetView.tsx";
import {vehicleCatalogEditPath} from "@carRentalModule/clients/panel/private/vehicleCatalog/editPath.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type VehicleCatalogCardProps = WithLanguageType & {
    entry: VehicleCatalogEntry;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleCatalogEntry, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleCatalogEntry> | null>;
};

/** A type, a make (under its type) or a model (under its make, with its body, seats and fuel). */
function VehicleCatalogCard({
    entry,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleCatalogCardProps) {
    return (
        <EntityCard
            resource="vehiclecatalogentries"
            entity={entry}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleCatalog/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleCatalogEditPath}
            Sheet={VehicleCatalogSheetView}
            sheetEntityProp="entry"
            deleteUrl="/api/carRental/vehicleCatalog"
            restoreUrl="/api/carRental/vehicleCatalog/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        badgesBesideTitle
                        badges={
                            <DisplayValue path="level" value={entity.level}>
                                {() => (
                                    <Badge variant="outline" className="text-xs">
                                        {resolveLanguageKey(`levelValues.${entity.level}`)}
                                    </Badge>
                                )}
                            </DisplayValue>
                        }
                    />
                    <EntityCard.Body>
                        {entity.parentEntry?.name ? (
                            <EntityCardRow
                                icon={IconCategory2}
                                label={resolveLanguageKey(`parentEntry.${entity.level}`)}
                                tooltip={resolveLanguageKey(`parentEntry.${entity.level}`)}
                                path="parentEntry.name"
                                value={entity.parentEntry.name}
                            />
                        ) : null}
                        {entity.bodyStyle ? (
                            <EntityCardRow
                                icon={IconCar}
                                label={resolveLanguageKey("bodyStyle")}
                                tooltip={resolveLanguageKey("bodyStyle")}
                                path="bodyStyle"
                                value={resolveLanguageKey(`bodyStyleValues.${entity.bodyStyle}`)}
                            />
                        ) : null}
                        {entity.seats ? (
                            <EntityCardRow
                                icon={IconArmchair}
                                label={resolveLanguageKey("seats")}
                                tooltip={resolveLanguageKey("seats")}
                                path="seats"
                                type="number"
                                value={entity.seats}
                            />
                        ) : null}
                        {entity.fuelType ? (
                            <EntityCardRow
                                icon={IconGasStation}
                                label={resolveLanguageKey("fuelType")}
                                tooltip={resolveLanguageKey("fuelType")}
                                path="fuelType"
                                value={resolveLanguageKey(`fuelTypeValues.${entity.fuelType}`)}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/vehicleCatalog/center/cardView/vehicleCatalogCard.tsx"),
    withDebug(true, true, "vehiclecatalogentries"),
)(VehicleCatalogCard);
