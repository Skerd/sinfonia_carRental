import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconArmchair, IconCash, IconManualGearbox, IconWorld} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
import VehicleCategorySheetView from "@carRentalModule/clients/panel/private/categories/center/sheetView/vehicleCategorySheetView.tsx";
import {vehicleCategoryEditPath} from "@carRentalModule/clients/panel/private/categories/index.tsx";

type VehicleCategoryCardProps = WithLanguageType & {
    vehicleCategory: VehicleCategory;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleCategory, response?: DeletedData) => void;
    onRestore?: () => void;
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
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name} />
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
                            icon={IconWorld}
                            label={resolveLanguageKey("isPublic")}
                            tooltip={resolveLanguageKey("isPublic")}
                            path="isPublic"
                            type="boolean"
                            value={row.isPublic}
                        />
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
