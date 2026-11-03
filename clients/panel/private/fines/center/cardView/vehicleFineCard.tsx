import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconAlertTriangle, IconCalendarEvent, IconCar, IconCash, IconId, IconStatusChange, IconUser} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleFine} from "armonia/src/modules/carRental/api/carRental/private/vehicleFine/vehicleFine.dto.ts";
import VehicleFineMenu from "@carRentalModule/clients/panel/private/fines/center/actions/vehicleFineMenu.tsx";
import VehicleFineDialogs from "@carRentalModule/clients/panel/private/fines/center/dialogs/vehicleFineDialogs.tsx";
import VehicleFineSheetView from "@carRentalModule/clients/panel/private/fines/center/sheetView/vehicleFineSheetView.tsx";
import {vehicleFineEditPath} from "@carRentalModule/clients/panel/private/fines/index.tsx";

type VehicleFineCardProps = WithLanguageType & {
    vehicleFine: VehicleFine;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleFine, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleFine> | null>;
};

function VehicleFineCard({
    vehicleFine,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleFineCardProps) {
    return (
        <EntityCard
            resource="vehiclefines"
            entity={vehicleFine}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleFine/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleFineEditPath}
            Sheet={VehicleFineSheetView}
            sheetEntityProp="vehicleFine"
            deleteUrl="/api/carRental/vehicleFine"
            restoreUrl="/api/carRental/vehicleFine/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="reference"
            innerRef={innerRef}
            sheetProps={({entity, setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: <VehicleFineMenu fine={entity} onAction={setAction} />,
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <VehicleFineDialogs action={action} fine={entity} onClose={() => setAction("")} onUpdated={(updated: VehicleFine) => setEntity({...entity, ...updated})} />
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="reference" title={row.reference}>
                        <VehicleFineMenu fine={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCar}
                            label={resolveLanguageKey("vehicle")}
                            tooltip={resolveLanguageKey("vehicle")}
                            path="vehicle"
                            value={row.vehicle?.plate}
                        />
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("offenceAt")}
                            tooltip={resolveLanguageKey("offenceAt")}
                            path="offenceAt"
                            type="dateTime"
                            value={row.offenceAt}
                        />
                        <EntityCardRow
                            icon={IconAlertTriangle}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="typeValues"
                            value={row.type}
                        />
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("amount")}
                            tooltip={resolveLanguageKey("amount")}
                            path="amount"
                            type="number"
                            value={row.amount}
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
                        <EntityCardRow
                            icon={IconId}
                            label={resolveLanguageKey("reservation")}
                            tooltip={resolveLanguageKey("reservation")}
                            path="reservation"
                            value={row.reservation?.number}
                        />
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("driverName")}
                            tooltip={resolveLanguageKey("driverName")}
                            path="driverName"
                            value={row.driverName}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/fines/center/cardView/vehicleFineCard.tsx"),
    withDebug(true, true, "vehiclefines"),
)(VehicleFineCard);
