import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconTool} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleBlock} from "armonia/src/modules/carRental/api/carRental/private/vehicleBlock/vehicleBlock.dto.ts";
import VehicleBlockSheetView from "@carRentalModule/clients/panel/private/blocks/center/sheetView/vehicleBlockSheetView.tsx";
import {vehicleBlockEditPath} from "@carRentalModule/clients/panel/private/blocks/index.tsx";

type VehicleBlockCardProps = WithLanguageType & {
    vehicleBlock: VehicleBlock;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleBlock, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleBlock> | null>;
};

function VehicleBlockCard({
    vehicleBlock,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleBlockCardProps) {
    return (
        <EntityCard
            resource="vehicleblocks"
            entity={vehicleBlock}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleBlock/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleBlockEditPath}
            Sheet={VehicleBlockSheetView}
            sheetEntityProp="vehicleBlock"
            deleteUrl="/api/carRental/vehicleBlock"
            restoreUrl="/api/carRental/vehicleBlock/restore"
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
                            label={resolveLanguageKey("reason")}
                            tooltip={resolveLanguageKey("reason")}
                            path="reason"
                            type="enum"
                            languageKeyCategory="reasonValues"
                            value={row.reason}
                        />
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("startAt")}
                            tooltip={resolveLanguageKey("startAt")}
                            path="startAt"
                            type="dateTime"
                            value={row.startAt}
                        />
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("endAt")}
                            tooltip={resolveLanguageKey("endAt")}
                            path="endAt"
                            type="dateTime"
                            value={row.endAt}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/blocks/center/cardView/vehicleBlockCard.tsx"),
    withDebug(true, true, "vehicleblocks"),
)(VehicleBlockCard);
