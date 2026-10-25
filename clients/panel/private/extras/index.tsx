import {useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {IconArrowsSort, IconPlus} from "@tabler/icons-react";
import type {RentalExtra} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalExtraCard from "./center/cardView/rentalExtraCard.tsx";
import RentalExtraSheetView from "./center/sheetView/rentalExtraSheetView.tsx";
import ActivateRentalExtra from "./center/actions/activateRentalExtra.tsx";
import DeactivateRentalExtra from "./center/actions/deactivateRentalExtra.tsx";
import ActivateRentalExtraDialog from "./center/dialogs/activateRentalExtraDialog.tsx";
import DeactivateRentalExtraDialog from "./center/dialogs/deactivateRentalExtraDialog.tsx";
import ReorderRentalExtrasModal from "./reorderRentalExtrasModal.tsx";

export function rentalExtraEditPath(row: {_id: string}) {
    return `/tenancy/systemSettings/rentalExtras/edit?rentalExtraId=${row._id}`;
}

function AllRentalExtras({resolveLanguageKey}: WithLanguageType) {
    const [reorderOpen, setReorderOpen] = useState(false);
    const [listVersion, setListVersion] = useState(0);

    return (
        <>
            <EntityListPage<RentalExtra>
            key={listVersion}
            apiUrl="/api/carRental/rentalExtra"
            collectionName="rentalextras"
            accessModel="rentalextras"
            tableConfigKey="rentalextras"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/tenancy/systemSettings/rentalExtras/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={rentalExtraEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/extras/center/sheetView/rentalExtraSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            headerActions={
                <Button type="button" variant="outline" size="sm" onClick={() => setReorderOpen(true)}>
                    <IconArrowsSort size={16} className="mr-1" />
                    {String(resolveLanguageKey("reorderExtras") ?? "Reorder extras")}
                </Button>
            }
            renderActionMenuChildren={(entity, bindRowAction) => (
                <>
                    <ActivateRentalExtra entity={entity} onAction={bindRowAction} />
                    <DeactivateRentalExtra entity={entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activateRentalExtra") {
                    return (
                        <ActivateRentalExtraDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateRentalExtra") {
                    return (
                        <DeactivateRentalExtraDialog
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
                <RentalExtraSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    rentalExtra={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(entity._id, {isActive})}
                    onSheetRowPatched={(row) => listRef.current?.updateRow?.(entity._id, row)}
                />
            )}
            renderCard={(row, onDelete, onRestore, listRef) => (
                <RentalExtraCard
                    rentalExtra={row}
                    onDelete={(deleted: RentalExtra | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(row._id, {isActive})}
                />
            )}
            />
            <ReorderRentalExtrasModal
            open={reorderOpen}
            onOpenChange={setReorderOpen}
            resolveLanguageKey={resolveLanguageKey}
            onSuccess={() => setListVersion((version) => version + 1)}
            />
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/extras/index.tsx"),
    withDebug(true, true, "rentalextras"),
)(AllRentalExtras);
