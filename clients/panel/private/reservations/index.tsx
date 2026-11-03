import {useMemo} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {RENTAL_PAYMENT_STATUSES, RENTAL_RESERVATION_STATUSES} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.constants.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalReservationCard from "./center/cardView/rentalReservationCard.tsx";
import RentalReservationSheetView from "./center/sheetView/rentalReservationSheetView.tsx";
import RentalReservationMenu from "./center/actions/rentalReservationMenu.tsx";
import RentalReservationDialogs from "./center/dialogs/rentalReservationDialogs.tsx";
import {usePromoteScopeToQuickFilters} from "@coreModule/helpers/filter/usePromoteScopeToQuickFilters.ts";
import type {ScopeQuickFilter} from "@coreModule/helpers/filter/filterUrl.ts";
import {useVehicleScopedList} from "@carRentalModule/clients/panel/vehicleScope.ts";

/** A car's records link carries `categoryId` until the category filter owns it. */
const RESERVATION_CATEGORY_SCOPE: readonly ScopeQuickFilter[] = [
    {field: "category", idParam: "categoryId", nameParam: "categoryName"},
];

export function rentalReservationEditPath(row: {_id: string}) {
    return `/carRental/reservations/edit?rentalReservationId=${row._id}`;
}

/** Opened from a car's records menu, the list is that car and the header names it. */
function AllRentalReservations({resolveLanguageKey}: WithLanguageType) {
    const scope = useVehicleScopedList(resolveLanguageKey, "/carRental/reservations/create");
    usePromoteScopeToQuickFilters(RESERVATION_CATEGORY_SCOPE);
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: RENTAL_RESERVATION_STATUSES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.status.${value}`),
            })),
        },
        {
            field: "category",
            label: resolveLanguageKey("fields.category"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/carRental/vehicleCategory/select",
        },
        ...scope.quickFilters.map((filter) =>
            filter.field === "vehicle" ? {...filter, dependsOn: "category"} : filter,
        ),
        {
            field: "pickupLocation",
            label: resolveLanguageKey("fields.pickupLocation"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/carRental/rentalLocation/select",
        },
        {
            field: "paymentStatus",
            label: resolveLanguageKey("fields.paymentStatus"),
            type: COLUMN_TYPE.ENUM,
            enumValues: RENTAL_PAYMENT_STATUSES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.paymentStatus.${value}`),
            })),
        },
    ], [resolveLanguageKey, scope.quickFilters]);
    return (
        <EntityListPage<RentalReservation>
            apiUrl="/api/carRental/rentalReservation"
            collectionName="rentalreservations"
            accessModel="rentalreservations"
            tableConfigKey="rentalreservations"
            createPath={scope.createPath}
            createIcon={<IconPlus />}
            createLanguageKey="create"
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={scope.headerTitle}
            extraFilters={scope.extraFilters}
            quickFilters={quickFilters}
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
