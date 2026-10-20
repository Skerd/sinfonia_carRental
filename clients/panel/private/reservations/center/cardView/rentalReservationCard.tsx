import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconCar, IconCreditCard, IconStatusChange, IconUser} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import RentalReservationSheetView from "@carRentalModule/clients/panel/private/reservations/center/sheetView/rentalReservationSheetView.tsx";

import RentalReservationMenu from "@carRentalModule/clients/panel/private/reservations/center/actions/rentalReservationMenu.tsx";
import RentalReservationDialogs from "@carRentalModule/clients/panel/private/reservations/center/dialogs/rentalReservationDialogs.tsx";
type RentalReservationCardProps = WithLanguageType & {
    rentalReservation: RentalReservation;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: RentalReservation, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalReservation> | null>;
};

function RentalReservationCard({
    rentalReservation,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: RentalReservationCardProps) {
    return (
        <EntityCard
            resource="rentalreservations"
            entity={rentalReservation}
            fetchId={fetchId}
            singleUrl="/api/carRental/rentalReservation/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            hideEdit
            editPath={() => ""}
            Sheet={RentalReservationSheetView}
            sheetEntityProp="rentalReservation"
            deleteUrl="/api/carRental/rentalReservation"
            restoreUrl="/api/carRental/rentalReservation/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="number"
            innerRef={innerRef}
            sheetProps={({entity, setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: <RentalReservationMenu reservation={entity} onAction={setAction} />,
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <RentalReservationDialogs
                    action={action}
                    reservation={entity}
                    onClose={() => setAction("")}
                    onUpdated={(updated) => setEntity({...entity, ...updated})}
                />
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="number" title={row.number}>
                        <RentalReservationMenu reservation={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconStatusChange}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="statusValues"
                            value={row.status}
                        />
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("pickupAt")}
                            tooltip={resolveLanguageKey("pickupAt")}
                            path="pickupAt"
                            type="dateTime"
                            value={row.pickupAt}
                        />
                        <EntityCardRow
                            icon={IconCar}
                            label={resolveLanguageKey("vehicle")}
                            tooltip={resolveLanguageKey("vehicle")}
                            path="vehicle"
                            value={row.vehicle?.plate}
                        />
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("contact")}
                            tooltip={resolveLanguageKey("contact")}
                            path="contact"
                            value={`${row.contact.firstName} ${row.contact.lastName}`}
                        />
                        <EntityCardRow
                            icon={IconCreditCard}
                            label={resolveLanguageKey("paymentStatus")}
                            tooltip={resolveLanguageKey("paymentStatus")}
                            path="paymentStatus"
                            type="enum"
                            languageKeyCategory="paymentStatusValues"
                            value={row.paymentStatus}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/cardView/rentalReservationCard.tsx"),
    withDebug(true, true, "rentalreservations"),
)(RentalReservationCard);
