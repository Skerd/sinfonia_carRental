import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import PlatformListHierarchy, {PlatformListViewSwitch, usePlatformListView} from "@coreModule/components/entityPage/hierarchy/platformListHierarchy.tsx";
import type {VehicleCatalogEntry} from "armonia/src/modules/carRental/api/carRental/private/vehicleCatalog/vehicleCatalog.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VehicleCatalogCard from "@carRentalModule/clients/panel/private/vehicleCatalog/center/cardView/vehicleCatalogCard.tsx";
import VehicleCatalogSheetView from "@carRentalModule/clients/panel/private/vehicleCatalog/center/sheetView/vehicleCatalogSheetView.tsx";
import {VEHICLE_CATALOG_BASE, vehicleCatalogEditPath} from "@carRentalModule/clients/panel/private/vehicleCatalog/editPath.ts";

/**
 * The platform's vehicle catalog (D199): one tree of types, makes and models every company reads. The platform company
 * edits it; another company requests a missing make or model with the same create form (the button turns into a request).
 */
function AllVehicleCatalogEntries({resolveLanguageKey}: WithLanguageType) {
    const [view, setView] = usePlatformListView();
    const viewSwitch = <PlatformListViewSwitch view={view} onChange={setView} resolveLanguageKey={resolveLanguageKey} />;

    if (view === "hierarchy") {
        return (
            <div className="min-w-0 flex-full gap-4">
                <EntityListHeader ctx={{resolveLanguageKey, canCreate: false, canRequest: false}}>{viewSwitch}</EntityListHeader>
                <PlatformListHierarchy
                    treeUrl="/api/carRental/vehicleCatalog/tree"
                    renderSheet={({id, onClose, onDeleted}) => (
                        <VehicleCatalogSheetView
                            open
                            onOpenChange={(next: boolean) => {
                                if (!next) onClose();
                            }}
                            fetchId={id}
                            onDelete={onDeleted}
                        />
                    )}
                />
            </div>
        );
    }

    return (
        <EntityListPage<VehicleCatalogEntry>
            apiUrl="/api/carRental/vehicleCatalog"
            collectionName="vehiclecatalogentries"
            accessModel="vehiclecatalogentries"
            tableConfigKey="vehiclecatalogentries"
            header={(ctx) => (
                <EntityListHeader ctx={ctx}>
                    {viewSwitch}
                    <EntityListCreateButton
                        ctx={ctx}
                        path={`${VEHICLE_CATALOG_BASE}/create`}
                        icon={<IconPlus />}
                        labelKey="createEntry"
                    />
                </EntityListHeader>
            )}
            buildEditPath={vehicleCatalogEditPath}
            resolveLanguageKey={resolveLanguageKey}
            configurations={{limit: 20}}
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(entry, onDelete, onRestore) => (
                <VehicleCatalogCard
                    entry={entry}
                    onDelete={(deleted: VehicleCatalogEntry | undefined, response?: DeletedData) =>
                        onDelete(deleted ?? entry, response)
                    }
                    onRestore={() => onRestore(entry)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore}) => (
                <VehicleCatalogSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    entry={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/vehicleCatalog/index.tsx"),
    withDebug(true, true, "vehiclecatalogentries"),
)(AllVehicleCatalogEntries);
