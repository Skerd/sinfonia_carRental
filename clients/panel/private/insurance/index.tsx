import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleInsurance} from "armonia/src/modules/carRental/api/carRental/private/vehicleInsurance/vehicleInsurance.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleInsuranceCard from "./center/cardView/vehicleInsuranceCard.tsx";
import VehicleInsuranceSheetView from "./center/sheetView/vehicleInsuranceSheetView.tsx";

export function vehicleInsuranceEditPath(row: {_id: string}) {
    return `/carRental/insurance/edit?vehicleInsuranceId=${row._id}`;
}

/** `vehicleId` narrows the list to one car (opened from that car's records menu). */
function AllVehicleInsurances({resolveLanguageKey, vehicleId}: WithLanguageType & {vehicleId?: string}) {
    return (
        <EntityListPage<VehicleInsurance>
            apiUrl="/api/carRental/vehicleInsurance"
            collectionName="vehicleinsurances"
            accessModel="vehicleinsurances"
            tableConfigKey="vehicleinsurances"
            createPath="/carRental/insurance/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleInsuranceEditPath}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={vehicleId ? {vehicle: vehicleId} : undefined}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/insurance/center/sheetView/vehicleInsuranceSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleInsuranceSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    vehicleInsurance={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
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
