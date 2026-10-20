import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleCategoryCard from "./center/cardView/vehicleCategoryCard.tsx";
import VehicleCategorySheetView from "./center/sheetView/vehicleCategorySheetView.tsx";

export function vehicleCategoryEditPath(row: {_id: string}) {
    return `/carRental/categories/edit?vehicleCategoryId=${row._id}`;
}

function AllVehicleCategories({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<VehicleCategory>
            apiUrl="/api/carRental/vehicleCategory"
            collectionName="vehiclecategories"
            accessModel="vehiclecategories"
            tableConfigKey="vehiclecategories"
            createPath="/carRental/categories/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={vehicleCategoryEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/categories/center/sheetView/vehicleCategorySheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <VehicleCategorySheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    vehicleCategory={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <VehicleCategoryCard
                    vehicleCategory={row}
                    onDelete={(deleted: VehicleCategory | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/categories/index.tsx"),
    withDebug(true, true, "vehiclecategories"),
)(AllVehicleCategories);
