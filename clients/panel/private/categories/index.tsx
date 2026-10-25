import {useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {IconArrowsSort, IconPlus} from "@tabler/icons-react";
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleCategoryCard from "./center/cardView/vehicleCategoryCard.tsx";
import VehicleCategorySheetView from "./center/sheetView/vehicleCategorySheetView.tsx";
import ReorderVehicleCategoriesModal from "./reorderVehicleCategoriesModal.tsx";
import ShowVehicleCategoryOnWebsite from "./center/actions/showVehicleCategoryOnWebsite.tsx";
import HideVehicleCategoryFromWebsite from "./center/actions/hideVehicleCategoryFromWebsite.tsx";
import ShowVehicleCategoryOnWebsiteDialog from "./center/dialogs/showVehicleCategoryOnWebsiteDialog.tsx";
import HideVehicleCategoryFromWebsiteDialog from "./center/dialogs/hideVehicleCategoryFromWebsiteDialog.tsx";

export function vehicleCategoryEditPath(row: {_id: string}) {
    return `/tenancy/systemSettings/vehicleCategories/edit?vehicleCategoryId=${row._id}`;
}

function AllVehicleCategories({resolveLanguageKey}: WithLanguageType) {
    const [reorderOpen, setReorderOpen] = useState(false);
    const [listVersion, setListVersion] = useState(0);

    return (
        <>
            <EntityListPage<VehicleCategory>
                key={listVersion}
                apiUrl="/api/carRental/vehicleCategory"
                collectionName="vehiclecategories"
                accessModel="vehiclecategories"
                tableConfigKey="vehiclecategories"
                rowActionMenu={{allowMenuForCustomChildren: true}}
                createPath="/tenancy/systemSettings/vehicleCategories/create"
                createIcon={<IconPlus />}
                createLanguageKey="create"
                buildEditPath={vehicleCategoryEditPath}
                resolveLanguageKey={resolveLanguageKey}
                sheetLanguagePath="src/modules/carRental/clients/panel/private/categories/center/sheetView/vehicleCategorySheetView.tsx"
                cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                headerActions={
                    <Button type="button" variant="outline" size="sm" onClick={() => setReorderOpen(true)}>
                        <IconArrowsSort size={16} className="mr-1" />
                        {String(resolveLanguageKey("reorderCategories") ?? "Reorder categories")}
                    </Button>
                }
                renderActionMenuChildren={(_entity, bindRowAction) => (
                    <>
                        <ShowVehicleCategoryOnWebsite entity={_entity} onAction={bindRowAction} />
                        <HideVehicleCategoryFromWebsite entity={_entity} onAction={bindRowAction} />
                    </>
                )}
                renderCard={(row, onDelete, onRestore, listRef) => (
                    <VehicleCategoryCard
                        vehicleCategory={row}
                        onDelete={(deleted: VehicleCategory | undefined, response?: DeletedData) => onDelete(deleted, response)}
                        onRestore={() => onRestore(row)}
                        onPublicChanged={(isPublic: boolean) => listRef.current?.updateRow?.(row._id, {isPublic})}
                    />
                )}
                renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                    <VehicleCategorySheetView
                        open={open}
                        onOpenChange={onOpenChange}
                        vehicleCategory={entity}
                        onDelete={onDelete}
                        onRestore={onRestore}
                        onSheetRowPatched={(row) => {
                            listRef.current?.updateRow?.(entity._id, row);
                        }}
                    />
                )}
                renderFloatingModals={({action, entity, resetAction, listRef}) => {
                    if (action === "showVehicleCategoryOnWebsite") {
                        return (
                            <ShowVehicleCategoryOnWebsiteDialog
                                open={true}
                                onClose={resetAction}
                                entity={entity}
                                onSuccess={() => listRef.current?.updateRow?.(entity._id, {isPublic: true})}
                            />
                        );
                    }
                    if (action === "hideVehicleCategoryFromWebsite") {
                        return (
                            <HideVehicleCategoryFromWebsiteDialog
                                open={true}
                                onClose={resetAction}
                                entity={entity}
                                onSuccess={() => listRef.current?.updateRow?.(entity._id, {isPublic: false})}
                            />
                        );
                    }
                    return null;
                }}
            />
            <ReorderVehicleCategoriesModal
                open={reorderOpen}
                onOpenChange={setReorderOpen}
                resolveLanguageKey={resolveLanguageKey}
                onSuccess={() => setListVersion((version) => version + 1)}
            />
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/categories/index.tsx"),
    withDebug(true, true, "vehiclecategories"),
)(AllVehicleCategories);
