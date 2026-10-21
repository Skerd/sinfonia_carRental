import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBuildingBank, IconCalendarDue, IconCar, IconShieldCheck, IconStatusChange} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";
import VehicleInsuranceSheetView from "@carRentalModule/clients/panel/private/insurance/center/sheetView/vehicleInsuranceSheetView.tsx";
import {vehicleInsuranceEditPath} from "@carRentalModule/clients/panel/private/insurance/index.tsx";

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
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="policyNumber"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="policyNumber" title={row.policyNumber} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCar}
                            label={resolveLanguageKey("vehicle")}
                            tooltip={resolveLanguageKey("vehicle")}
                            path="vehicle"
                            value={row.vehicle?.plate}
                        />
                        <EntityCardRow
                            icon={IconBuildingBank}
                            label={resolveLanguageKey("insurer")}
                            tooltip={resolveLanguageKey("insurer")}
                            path="insurer"
                            value={row.insurer}
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
    withLanguage("src/modules/carRental/clients/panel/private/insurance/center/cardView/vehicleInsuranceCard.tsx"),
    withDebug(true, true, "vehicleinsurances"),
)(VehicleInsuranceCard);
