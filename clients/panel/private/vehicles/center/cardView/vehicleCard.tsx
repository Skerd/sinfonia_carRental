import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCategory, IconMapPin} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import {
    STATUS_BADGE_DANGER,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {Vehicle} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.dto.ts";
import type {VehicleReadiness} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.schema-def.ts";
import VehicleSheetView from "@carRentalModule/clients/panel/private/vehicles/center/sheetView/vehicleSheetView.tsx";
import {vehicleEditPath} from "@carRentalModule/clients/panel/private/vehicles/index.tsx";
import VehicleRecordsMenu from "@carRentalModule/clients/panel/private/vehicles/center/actions/vehicleRecordsMenu.tsx";
import VehicleReadinessMenu from "@carRentalModule/clients/panel/private/vehicles/center/actions/vehicleReadinessMenu.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";

const READINESS_BADGE: Record<VehicleReadiness, string> = {
    ready: STATUS_BADGE_SUCCESS,
    needs_cleaning: STATUS_BADGE_WARNING,
    needs_check: STATUS_BADGE_DANGER,
};

type VehicleCardProps = WithLanguageType & {
    vehicle: Vehicle;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Vehicle, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Vehicle> | null>;
};

function VehicleCard({
    vehicle,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleCardProps) {
    return (
        <EntityCard
            resource="vehicles"
            entity={vehicle}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicle/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleEditPath}
            Sheet={VehicleSheetView}
            sheetEntityProp="vehicle"
            deleteUrl="/api/carRental/vehicle"
            restoreUrl="/api/carRental/vehicle/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="plate"
            innerRef={innerRef}
        >
            {({entity: row, read, setEntity}) => (
                <>
                    {/* Vehicles have no separate cover field: the first photo is the cover. */}
                    <div className="-mx-(--density-pad) -mt-(--density-pad) w-[calc(100%+2*var(--density-pad))]">
                        <AccessGatedGalleryCarousel
                            read={read}
                            imageGallery={row.images || []}
                            videoGallery={row.videos || []}
                            mainImagePath="images"
                            imageGalleryPath="images"
                            videoGalleryPath="videos"
                            showThumbnails={false}
                            allowFullScreen={false}
                            coverAfterFirst
                        />
                    </div>
                    <EntityCard.Header
                        titlePath="model"
                        title={`${row.make} ${row.model}`}
                        subtitlePath="plate"
                        subtitle={row.plate}
                        badgesBesideTitle
                        badges={
                            <>
                            {row.status !== "active" ? <StatusBadge tableConfigKey="vehicles" field="status" value={row.status} label={String(resolveLanguageKey(`statusValues.${row.status}`))} /> : null}
                            <DisplayValue path="readiness" value={row.readiness}>
                                {() => (
                                    <Badge variant="outline" className={cn("text-xs", READINESS_BADGE[row.readiness])}>
                                        {String(resolveLanguageKey(`readinessValues.${row.readiness}`))}
                                    </Badge>
                                )}
                            </DisplayValue>
                            </>
                        }

                    >
                        <VehicleReadinessMenu vehicle={row} onUpdated={setEntity} />
                        <VehicleRecordsMenu vehicle={row} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCategory}
                            label={resolveLanguageKey("category")}
                            tooltip={resolveLanguageKey("category")}
                            path="category"
                            value={row.category?.name}
                        />
                        <EntityCardRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("homeLocation")}
                            tooltip={resolveLanguageKey("homeLocation")}
                            path="homeLocation"
                            value={row.homeLocation?.name}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/vehicles/center/cardView/vehicleCard.tsx"),
    withDebug(true, true, "vehicles"),
)(VehicleCard);
