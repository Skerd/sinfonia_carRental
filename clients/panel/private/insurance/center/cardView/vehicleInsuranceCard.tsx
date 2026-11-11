import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarDue, IconCar, IconShieldCheck} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";
import VehicleInsuranceSheetView from "@carRentalModule/clients/panel/private/insurance/center/sheetView/vehicleInsuranceSheetView.tsx";
import VehicleInsuranceMenu from "@carRentalModule/clients/panel/private/insurance/center/actions/vehicleInsuranceMenu.tsx";
import VehicleInsuranceDialogs from "@carRentalModule/clients/panel/private/insurance/center/dialogs/vehicleInsuranceDialogs.tsx";
import {vehicleInsuranceEditPath} from "@carRentalModule/clients/panel/private/insurance/index.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";

type VehicleInsuranceCardProps = WithLanguageType & {
    vehicleInsurance: VehicleInsurance;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: VehicleInsurance, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<VehicleInsurance> | null>;
};

function VehicleInsuranceCard({
    vehicleInsurance,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: VehicleInsuranceCardProps) {
    return (
        <EntityCard
            resource="vehicleinsurances"
            entity={vehicleInsurance}
            fetchId={fetchId}
            singleUrl="/api/carRental/vehicleInsurance/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={vehicleInsuranceEditPath}
            Sheet={VehicleInsuranceSheetView}
            sheetEntityProp="vehicleInsurance"
            deleteUrl="/api/carRental/vehicleInsurance"
            restoreUrl="/api/carRental/vehicleInsurance/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="policyNumber"
            innerRef={innerRef}
            hideEdit={(row) => row.status === "cancelled"}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <VehicleInsuranceDialogs
                    action={action}
                    policy={entity}
                    onClose={() => setAction("")}
                    onUpdated={(updated) => setEntity({...entity, ...updated})}
                />
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="insurer"
                        title={row.insurer}
                        subtitlePath="policyNumber"
                        subtitle={row.policyNumber}
                        badgesBesideTitle
                        badges={<StatusBadge tableConfigKey="vehicleinsurances" field="status" value={row.status} label={String(resolveLanguageKey(`statusValues.${row.status}`))} />}>
                        <VehicleInsuranceMenu policy={row} onAction={setAction} />
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
                            icon={IconShieldCheck}
                            label={resolveLanguageKey("coverage")}
                            tooltip={resolveLanguageKey("coverage")}
                            path="coverage"
                            type="enum"
                            languageKeyCategory="coverageValues"
                            value={row.coverage}
                        />
                        <EntityCardRow
                            icon={IconCalendarDue}
                            label={resolveLanguageKey("expiresAt")}
                            tooltip={resolveLanguageKey("expiresAt")}
                            path="expiresAt"
                            type="date"
                            value={row.expiresAt}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/insurance/center/cardView/vehicleInsuranceCard.tsx"),
    withDebug(true, true, "vehicleinsurances"),
)(VehicleInsuranceCard);
