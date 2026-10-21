import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCar, IconCategory, IconMapPin, IconStatusChange} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {Vehicle} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.dto.ts";
import VehicleSheetView from "@carRentalModule/clients/panel/private/vehicles/center/sheetView/vehicleSheetView.tsx";
import {vehicleEditPath} from "@carRentalModule/clients/panel/private/vehicles/index.tsx";
import VehicleRecordsMenu from "@carRentalModule/clients/panel/private/vehicles/center/actions/vehicleRecordsMenu.tsx";

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
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="plate"
            innerRef={innerRef}
        >
            {({entity: row, read}) => (
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
                    <EntityCard.Header titlePath="plate" title={row.plate}>
                        <VehicleRecordsMenu vehicleId={row._id} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCar}
                            label={resolveLanguageKey("model")}
                            tooltip={resolveLanguageKey("model")}
                            path="model"
                            value={`${row.make} ${row.model}`}
                        />
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
                        <EntityCardRow
                            icon={IconStatusChange}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="statusValues"
                            value={row.status}
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
