import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconCar, IconCreditCard} from "@tabler/icons-react";
import {formatTimeRange} from "@coreModule/helpers/general/dateTime.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
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
    // Pickup and return as the company reads its calendar (GLB-09).
    const companyZone = useCompanyTimeZone();
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="number"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (row: Partial<RentalReservation>) => setEntity({...entity, ...row}),
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
                    {/* The customer is who the desk looks for; the booking number is the subtitle (UX-01). */}
                    <EntityCard.Header
                        titlePath="contact"
                        title={`${row.contact.firstName} ${row.contact.lastName}`.trim()}
                        subtitlePath="number"
                        subtitle={row.number}
                        badgesBesideTitle
                        badges={<StatusBadge tableConfigKey="rentalreservations" field="status" value={row.status} label={String(resolveLanguageKey(`statusValues.${row.status}`))} />}
                    >
                        <RentalReservationMenu reservation={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCalendarEvent}
                            label={resolveLanguageKey("when")}
                            tooltip={resolveLanguageKey("when")}
                            path="pickupAt"
                            value={formatTimeRange(row.pickupAt, row.returnAt, companyZone)}
                        />
                        <EntityCardRow
                            icon={IconCar}
                            label={resolveLanguageKey("car")}
                            tooltip={resolveLanguageKey("car")}
                            path="category"
                            value={[row.category?.name, row.vehicle ? `${row.vehicle.make} ${row.vehicle.model} · ${row.vehicle.plate}` : ""].filter(Boolean).join(" · ")}
                        />
                        <EntityCardRow
                            icon={IconCreditCard}
                            label={resolveLanguageKey("total")}
                            tooltip={resolveLanguageKey("total")}
                            path="pricing"
                            value={[
                                row.pricing.currency?.abbreviation ? formatCurrency(row.pricing.grandTotal, row.pricing.currency.abbreviation) : String(row.pricing.grandTotal),
                                String(resolveLanguageKey(`paymentStatusValues.${row.paymentStatus}`)),
                            ].join(" · ")}
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
