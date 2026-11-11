import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleDamage} from "armonia/src/modules/carRental/api/carRental/private/vehicleDamage/vehicleDamage.dto.ts";
import VehicleDamageMenu from "@carRentalModule/clients/panel/private/damages/center/actions/vehicleDamageMenu.tsx";
import ScheduleRepairDialog from "@carRentalModule/clients/panel/private/damages/center/dialogs/scheduleRepairDialog.tsx";
import ChargeDamageDialog from "@carRentalModule/clients/panel/private/damages/center/dialogs/chargeDamageDialog.tsx";
import VehicleDamageSheetView from "@carRentalModule/clients/panel/private/damages/center/sheetView/vehicleDamageSheetView.tsx";
import {vehicleDamageEditPath} from "@carRentalModule/clients/panel/private/damages/index.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";

type VehicleDamageCardProps = WithLanguageType & {
    vehicleDamage: VehicleDamage;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleDamage, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleDamage> | null>;
};

function VehicleDamageCard({
    vehicleDamage,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleDamageCardProps) {
    return (
        <EntityCard
            resource="vehicledamages"
            entity={vehicleDamage}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleDamage/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleDamageEditPath}
            Sheet={VehicleDamageSheetView}
            sheetEntityProp="vehicleDamage"
            deleteUrl="/api/carRental/vehicleDamage"
            restoreUrl="/api/carRental/vehicleDamage/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="vehicle"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const onUpdated = (updated: VehicleDamage) => setEntity({...entity, ...updated});
                if (action === "chargeToCustomer") return <ChargeDamageDialog damage={entity} onClose={() => setAction("")} onUpdated={onUpdated} />;
                if (action === "scheduleRepair") return <ScheduleRepairDialog damage={entity} onClose={() => setAction("")} onUpdated={onUpdated} />;
                return null;
            }}
        >
            {({entity: row, read, setAction}) => (
                <>
                    {/* Most damage reports have no photos: an empty gallery would only add a blank tile. */}
                    {row.photos?.length ? (
                        <div className="-mx-(--density-pad) -mt-(--density-pad) w-[calc(100%+2*var(--density-pad))]">
                            <AccessGatedGalleryCarousel
                                read={read}
                                imageGallery={row.photos}
                                mainImagePath="photos"
                                imageGalleryPath="photos"
                                videoGalleryPath="photos"
                                showThumbnails={false}
                                allowFullScreen={false}
                                coverAfterFirst
                            />
                        </div>
                    ) : null}
                    <EntityCard.Header titlePath="area"
                        title={[String(resolveLanguageKey(`areaValues.${row.area}`)), String(resolveLanguageKey(`severityValues.${row.severity}`))].join(" · ")}
                        subtitlePath="vehicle"
                        subtitle={row.vehicle?.plate}
                        badgesBesideTitle
                        badges={<StatusBadge tableConfigKey="vehicledamages" field="status" value={row.status} label={String(resolveLanguageKey(`statusValues.${row.status}`))} />}>
                        <VehicleDamageMenu damage={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("reportedAt")}
                            tooltip={resolveLanguageKey("reportedAt")}
                            path="reportedAt"
                            type="dateTime"
                            value={row.reportedAt}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/damages/center/cardView/vehicleDamageCard.tsx"),
    withDebug(true, true, "vehicledamages"),
)(VehicleDamageCard);
