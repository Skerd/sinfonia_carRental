import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarDue, IconCategory, IconChecks, IconDiscount, IconPercentage, IconToggleRight} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalPromoCode} from "armonia/src/modules/carRental/api/carRental/private/rentalPromoCode/rentalPromoCode.dto.ts";
import RentalPromoCodeSheetView from "@carRentalModule/clients/panel/private/promoCodes/center/sheetView/rentalPromoCodeSheetView.tsx";
import {rentalPromoCodeEditPath} from "@carRentalModule/clients/panel/private/promoCodes/index.tsx";

type RentalPromoCodeCardProps = WithLanguageType & {
    rentalPromoCode: RentalPromoCode;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: RentalPromoCode, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalPromoCode> | null>;
};

function RentalPromoCodeCard({
    rentalPromoCode,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: RentalPromoCodeCardProps) {
    return (
        <EntityCard
            resource="rentalpromocodes"
            entity={rentalPromoCode}
            fetchId={fetchId}
            singleUrl="/api/carRental/rentalPromoCode/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rentalPromoCodeEditPath}
            Sheet={RentalPromoCodeSheetView}
            sheetEntityProp="rentalPromoCode"
            deleteUrl="/api/carRental/rentalPromoCode"
            restoreUrl="/api/carRental/rentalPromoCode/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="code"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="code" title={row.code} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconPercentage}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="typeValues"
                            value={row.type}
                        />
                        <EntityCardRow
                            icon={IconDiscount}
                            label={resolveLanguageKey("value")}
                            tooltip={resolveLanguageKey("value")}
                            path="value"
                            type="number"
                            value={row.value}
                        />
                        <EntityCardRow
                            icon={IconCategory}
                            label={resolveLanguageKey("category")}
                            tooltip={resolveLanguageKey("category")}
                            path="category"
                            value={row.category?.name}
                        />
                        <EntityCardRow
                            icon={IconCalendarDue}
                            label={resolveLanguageKey("bookableUntil")}
                            tooltip={resolveLanguageKey("bookableUntil")}
                            path="bookableUntil"
                            type="date"
                            value={row.bookableUntil}
                        />
                        <EntityCardRow
                            icon={IconChecks}
                            label={resolveLanguageKey("usageCount")}
                            tooltip={resolveLanguageKey("usageCount")}
                            path="usageCount"
                            type="number"
                            value={row.usageCount}
                        />
                        <EntityCardRow
                            icon={IconToggleRight}
                            label={resolveLanguageKey("isActive")}
                            tooltip={resolveLanguageKey("isActive")}
                            path="isActive"
                            value={row.isActive}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/promoCodes/center/cardView/rentalPromoCodeCard.tsx"),
    withDebug(true, true, "rentalpromocodes"),
)(RentalPromoCodeCard);
