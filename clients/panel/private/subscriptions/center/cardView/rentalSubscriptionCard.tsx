import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCash, IconCategory, IconRepeat} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalSubscription} from "armonia/src/modules/carRental/api/carRental/private/rentalSubscription/rentalSubscription.dto.ts";
import RentalSubscriptionSheetView from "@carRentalModule/clients/panel/private/subscriptions/center/sheetView/rentalSubscriptionSheetView.tsx";
import {rentalSubscriptionEditPath} from "@carRentalModule/clients/panel/private/subscriptions/index.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";

type RentalSubscriptionCardProps = WithLanguageType & {
    rentalSubscription: RentalSubscription;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: RentalSubscription, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalSubscription> | null>;
};

function RentalSubscriptionCard({
    rentalSubscription,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: RentalSubscriptionCardProps) {
    return (
        <EntityCard
            resource="rentalsubscriptions"
            entity={rentalSubscription}
            fetchId={fetchId}
            singleUrl="/api/carRental/rentalSubscription/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rentalSubscriptionEditPath}
            Sheet={RentalSubscriptionSheetView}
            sheetEntityProp="rentalSubscription"
            deleteUrl="/api/carRental/rentalSubscription"
            restoreUrl="/api/carRental/rentalSubscription/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="contactName"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="contactName"
                        title={row.contactName}
                        badgesBesideTitle
                        badges={<StatusBadge tableConfigKey="rentalsubscriptions" field="status" value={row.status} label={String(resolveLanguageKey(`statusValues.${row.status}`))} />} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCategory}
                            label={resolveLanguageKey("category")}
                            tooltip={resolveLanguageKey("category")}
                            path="category"
                            value={row.category?.name}
                        />
                        <EntityCardRow
                            icon={IconRepeat}
                            label={resolveLanguageKey("period")}
                            tooltip={resolveLanguageKey("period")}
                            path="period"
                            type="enum"
                            languageKeyCategory="periodValues"
                            value={row.period}
                        />
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("price")}
                            tooltip={resolveLanguageKey("price")}
                            path="price"
                            value={row.currency?.abbreviation && row.price != null ? formatCurrency(row.price, row.currency.abbreviation) : row.price}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/subscriptions/center/cardView/rentalSubscriptionCard.tsx"),
    withDebug(true, true, "rentalsubscriptions"),
)(RentalSubscriptionCard);
