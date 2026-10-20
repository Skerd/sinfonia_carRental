import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCash, IconReceipt, IconToggleRight} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalExtra} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.dto.ts";
import RentalExtraSheetView from "@carRentalModule/clients/panel/private/extras/center/sheetView/rentalExtraSheetView.tsx";
import {rentalExtraEditPath} from "@carRentalModule/clients/panel/private/extras/index.tsx";

type RentalExtraCardProps = WithLanguageType & {
    rentalExtra: RentalExtra;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: RentalExtra, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalExtra> | null>;
};

function RentalExtraCard({
    rentalExtra,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: RentalExtraCardProps) {
    return (
        <EntityCard
            resource="rentalextras"
            entity={rentalExtra}
            fetchId={fetchId}
            singleUrl="/api/carRental/rentalExtra/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rentalExtraEditPath}
            Sheet={RentalExtraSheetView}
            sheetEntityProp="rentalExtra"
            deleteUrl="/api/carRental/rentalExtra"
            restoreUrl="/api/carRental/rentalExtra/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("price")}
                            tooltip={resolveLanguageKey("price")}
                            path="price"
                            type="number"
                            value={row.price}
                        />
                        <EntityCardRow
                            icon={IconReceipt}
                            label={resolveLanguageKey("pricing")}
                            tooltip={resolveLanguageKey("pricing")}
                            path="pricing"
                            type="enum"
                            languageKeyCategory="pricingValues"
                            value={row.pricing}
                        />
                        <EntityCardRow
                            icon={IconToggleRight}
                            label={resolveLanguageKey("isActive")}
                            tooltip={resolveLanguageKey("isActive")}
                            path="isActive"
                            type="boolean"
                            value={row.isActive}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/extras/center/cardView/rentalExtraCard.tsx"),
    withDebug(true, true, "rentalextras"),
)(RentalExtraCard);
