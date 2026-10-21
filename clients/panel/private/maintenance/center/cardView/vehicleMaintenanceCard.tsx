import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconCash, IconGauge, IconStatusChange, IconTool} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleMaintenance} from "armonia/src/modules/carRental/api/carRental/private/vehicleMaintenance/vehicleMaintenance.dto.ts";
import VehicleMaintenanceSheetView from "@carRentalModule/clients/panel/private/maintenance/center/sheetView/vehicleMaintenanceSheetView.tsx";
import {vehicleMaintenanceEditPath} from "@carRentalModule/clients/panel/private/maintenance/index.tsx";

type VehicleMaintenanceCardProps = WithLanguageType & {
    vehicleMaintenance: VehicleMaintenance;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleMaintenance, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleMaintenance> | null>;
};

function VehicleMaintenanceCard({
    vehicleMaintenance,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleMaintenanceCardProps) {
    return (
        <EntityCard
            resource="vehiclemaintenances"
            entity={vehicleMaintenance}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleMaintenance/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleMaintenanceEditPath}
            Sheet={VehicleMaintenanceSheetView}
            sheetEntityProp="vehicleMaintenance"
            deleteUrl="/api/carRental/vehicleMaintenance"
            restoreUrl="/api/carRental/vehicleMaintenance/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="vehicle"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="vehicle" title={row.vehicle?.plate} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconTool}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="typeValues"
                            value={row.type}
                        />
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("serviceDate")}
                            tooltip={resolveLanguageKey("serviceDate")}
                            path="serviceDate"
                            type="date"
                            value={row.serviceDate}
                        />
                        <EntityCardRow
                            icon={IconGauge}
                            label={resolveLanguageKey("odometerKm")}
                            tooltip={resolveLanguageKey("odometerKm")}
                            path="odometerKm"
                            type="number"
                            value={row.odometerKm}
                        />
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("cost")}
                            tooltip={resolveLanguageKey("cost")}
                            path="cost"
                            type="number"
                            value={row.cost}
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
    withLanguage("src/modules/carRental/clients/panel/private/maintenance/center/cardView/vehicleMaintenanceCard.tsx"),
    withDebug(true, true, "vehiclemaintenances"),
)(VehicleMaintenanceCard);
