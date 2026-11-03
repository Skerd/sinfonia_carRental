import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconMapPin, IconMapPinFilled, IconStatusChange, IconUser} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleTransfer} from "armonia/src/modules/carRental/api/carRental/private/vehicleTransfer/vehicleTransfer.dto.ts";
import VehicleTransferMenu from "@carRentalModule/clients/panel/private/transfers/center/actions/vehicleTransferMenu.tsx";
import VehicleTransferDialogs from "@carRentalModule/clients/panel/private/transfers/center/dialogs/vehicleTransferDialogs.tsx";
import VehicleTransferSheetView from "@carRentalModule/clients/panel/private/transfers/center/sheetView/vehicleTransferSheetView.tsx";
import {vehicleTransferEditPath} from "@carRentalModule/clients/panel/private/transfers/index.tsx";

type VehicleTransferCardProps = WithLanguageType & {
    vehicleTransfer: VehicleTransfer;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleTransfer, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleTransfer> | null>;
};

function VehicleTransferCard({
    vehicleTransfer,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleTransferCardProps) {
    return (
        <EntityCard
            resource="vehicletransfers"
            entity={vehicleTransfer}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleTransfer/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleTransferEditPath}
            Sheet={VehicleTransferSheetView}
            sheetEntityProp="vehicleTransfer"
            deleteUrl="/api/carRental/vehicleTransfer"
            restoreUrl="/api/carRental/vehicleTransfer/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="vehicle"
            innerRef={innerRef}
            sheetProps={({entity, setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: <VehicleTransferMenu transfer={entity} onAction={setAction} />,
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <VehicleTransferDialogs action={action} transfer={entity} onClose={() => setAction("")} onUpdated={(updated: VehicleTransfer) => setEntity({...entity, ...updated})} />
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="vehicle" title={row.vehicle?.plate}>
                        <VehicleTransferMenu transfer={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("fromLocation")}
                            tooltip={resolveLanguageKey("fromLocation")}
                            path="fromLocation"
                            value={row.fromLocation?.name}
                        />
                        <EntityCardRow
                            icon={IconMapPinFilled}
                            label={resolveLanguageKey("toLocation")}
                            tooltip={resolveLanguageKey("toLocation")}
                            path="toLocation"
                            value={row.toLocation?.name}
                        />
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("departAt")}
                            tooltip={resolveLanguageKey("departAt")}
                            path="departAt"
                            type="dateTime"
                            value={row.departAt}
                        />
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("driver")}
                            tooltip={resolveLanguageKey("driver")}
                            path="driver"
                            value={row.driver?.name}
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
    withLanguage("src/modules/carRental/clients/panel/private/transfers/center/cardView/vehicleTransferCard.tsx"),
    withDebug(true, true, "vehicletransfers"),
)(VehicleTransferCard);
