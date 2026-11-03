import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {VEHICLE_INSURANCE_COVERAGES, VEHICLE_INSURANCE_STATUSES} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.schema-def.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleInsuranceCard from "./center/cardView/vehicleInsuranceCard.tsx";
import VehicleInsuranceSheetView from "./center/sheetView/vehicleInsuranceSheetView.tsx";
import VehicleInsuranceMenu from "./center/actions/vehicleInsuranceMenu.tsx";
import VehicleInsuranceDialogs from "./center/dialogs/vehicleInsuranceDialogs.tsx";
import {useVehicleScopedList} from "@carRentalModule/clients/panel/vehicleScope.ts";

export function vehicleInsuranceEditPath(row: {_id: string}) {
    return `/carRental/insurance/edit?vehicleInsuranceId=${row._id}`;
}

/** Opened from a car's records menu, the list is that car and the header names it. */
function AllVehicleInsurances({resolveLanguageKey}: WithLanguageType) {
    const scope = useVehicleScopedList(resolveLanguageKey, "/carRental/insurance/create");
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_INSURANCE_STATUSES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.status.${value}`),
            })),
        },
        {
            field: "coverage",
            label: resolveLanguageKey("fields.coverage"),
            type: COLUMN_TYPE.ENUM,
            enumValues: VEHICLE_INSURANCE_COVERAGES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.coverage.${value}`),
            })),
        },
        ...scope.quickFilters,
    ], [resolveLanguageKey, scope.quickFilters]);
    return (
        <EntityListPage<VehicleInsurance>
            apiUrl="/api/carRental/vehicleInsurance"
            collectionName="vehicleinsurances"
            accessModel="vehicleinsurances"
            tableConfigKey="vehicleinsurances"
            createPath={scope.createPath}
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleInsuranceEditPath}
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={scope.headerTitle}
            extraFilters={scope.extraFilters}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/insurance/center/sheetView/vehicleInsuranceSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: (row) => row.status === "cancelled"}}
            renderActionMenuChildren={(row, bindRowAction) => <VehicleInsuranceMenu policy={row} onAction={bindRowAction} />}
            renderFloatingModals={({action, entity, resetAction, listRef}) => (
                <VehicleInsuranceDialogs
                    action={action}
                    policy={entity}
                    onClose={resetAction}
                    onUpdated={(updated) => listRef.current?.updateRow?.(entity._id, updated)}
                />
            )}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <VehicleInsuranceSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    vehicleInsurance={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(patch: Partial<VehicleInsurance>) => listRef.current?.updateRow?.(entity._id, patch)}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleInsuranceCard
                    vehicleInsurance={row}
                    onDelete={(deleted: VehicleInsurance | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/insurance/index.tsx"),
    withDebug(true, true, "vehicleinsurances"),
)(AllVehicleInsurances);
