import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalLocation} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalLocationCard from "./center/cardView/rentalLocationCard.tsx";
import RentalLocationSheetView from "./center/sheetView/rentalLocationSheetView.tsx";
import ActivateRentalLocation from "./center/actions/activateRentalLocation.tsx";
import DeactivateRentalLocation from "./center/actions/deactivateRentalLocation.tsx";
import ActivateRentalLocationDialog from "./center/dialogs/activateRentalLocationDialog.tsx";
import DeactivateRentalLocationDialog from "./center/dialogs/deactivateRentalLocationDialog.tsx";

export function rentalLocationEditPath(row: {_id: string}) {
    return `/tenancy/systemSettings/rentalLocations/edit?rentalLocationId=${row._id}`;
}

function AllRentalLocations({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<RentalLocation>
            apiUrl="/api/carRental/rentalLocation"
            collectionName="rentallocations"
            accessModel="rentallocations"
            tableConfigKey="rentallocations"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/tenancy/systemSettings/rentalLocations/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={rentalLocationEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/locations/center/sheetView/rentalLocationSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <>
                    <ActivateRentalLocation entity={entity} onAction={bindRowAction} />
                    <DeactivateRentalLocation entity={entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activateRentalLocation") {
                    return (
                        <ActivateRentalLocationDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateRentalLocation") {
                    return (
                        <DeactivateRentalLocationDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                        />
                    );
                }
                return null;
            }}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore, listRef}) => (
                <RentalLocationSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    rentalLocation={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(entity._id, {isActive})}
                    onSheetRowPatched={(row) => listRef.current?.updateRow?.(entity._id, row)}
                />
            )}
            renderCard={(row, onDelete, onRestore, listRef) => (
                <RentalLocationCard
                    rentalLocation={row}
                    onDelete={(deleted: RentalLocation | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(row._id, {isActive})}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/locations/index.tsx"),
    withDebug(true, true, "rentallocations"),
)(AllRentalLocations);
