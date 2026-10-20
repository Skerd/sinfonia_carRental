import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalReservationCard from "./center/cardView/rentalReservationCard.tsx";
import RentalReservationSheetView from "./center/sheetView/rentalReservationSheetView.tsx";
import RentalReservationMenu from "./center/actions/rentalReservationMenu.tsx";
import RentalReservationDialogs from "./center/dialogs/rentalReservationDialogs.tsx";

export function rentalReservationEditPath(row: {_id: string}) {
    return `/carRental/reservations/edit?rentalReservationId=${row._id}`;
}

function AllRentalReservations({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<RentalReservation>
            apiUrl="/api/carRental/rentalReservation"
            collectionName="rentalreservations"
            accessModel="rentalreservations"
            tableConfigKey="rentalreservations"
            createPath="/carRental/reservations/create"
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/carRental/clients/panel/private/reservations/center/sheetView/rentalReservationSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: true}}
            renderActionMenuChildren={(row, bindRowAction) => <RentalReservationMenu reservation={row} onAction={bindRowAction} />}
            renderSheetActionMenuChildren={(row, bindRowAction) => <RentalReservationMenu reservation={row} onAction={bindRowAction} />}
            renderFloatingModals={({action, entity, resetAction, listRef}) => (
                <RentalReservationDialogs
                    action={action}
                    reservation={entity}
                    onClose={resetAction}
                    onUpdated={(updated) => listRef.current?.updateRow?.(entity._id, updated)}
                />
            )}
            renderSheet={({open, onOpenChange, entity, onDelete, onRestore}) => (
                <RentalReservationSheetView
                    open={open}
                    onOpenChange={onOpenChange}
                    rentalReservation={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(row, onDelete, onRestore) => (
                <RentalReservationCard
                    rentalReservation={row}
                    onDelete={(deleted: RentalReservation | undefined, response?: DeletedData) => onDelete(deleted, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/index.tsx"),
    withDebug(true, true, "rentalreservations"),
)(AllRentalReservations);
