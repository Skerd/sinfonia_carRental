import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconDiscount, IconFileTypePdf, IconReceipt} from "@tabler/icons-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalBusinessAccount} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.dto.ts";
import RentalBusinessAccountSheetView from "@carRentalModule/clients/panel/private/businessAccounts/center/sheetView/rentalBusinessAccountSheetView.tsx";
import RentalBusinessAccountMenu from "@carRentalModule/clients/panel/private/businessAccounts/center/actions/rentalBusinessAccountMenu.tsx";
import RentalStatementDialog from "@carRentalModule/clients/panel/private/businessAccounts/center/dialogs/rentalStatementDialog.tsx";
import {rentalBusinessAccountEditPath} from "@carRentalModule/clients/panel/private/businessAccounts/index.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";

type RentalBusinessAccountCardProps = WithLanguageType & {
    rentalBusinessAccount: RentalBusinessAccount;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (
        deleted?: RentalBusinessAccount,
        response?: DeletedData,
    ) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalBusinessAccount> | null>;
};

function RentalBusinessAccountCard({
    rentalBusinessAccount,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: RentalBusinessAccountCardProps) {
    return (
        <EntityCard
            resource="rentalbusinessaccounts"
            entity={rentalBusinessAccount}
            fetchId={fetchId}
            singleUrl="/api/carRental/rentalBusinessAccount/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rentalBusinessAccountEditPath}
            Sheet={RentalBusinessAccountSheetView}
            sheetEntityProp="rentalBusinessAccount"
            deleteUrl="/api/carRental/rentalBusinessAccount"
            restoreUrl="/api/carRental/rentalBusinessAccount/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: (
                    <RentalBusinessAccountMenu
                        onAction={setAction}
                    />
                ),
            })}
            extraDialogs={({action, setAction, entity}) =>
                action === "statement" ? (
                    <RentalStatementDialog
                        account={entity}
                        onClose={() => setAction("")}
                    />
                ) : null
            }
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="name"
                        title={row.name}
                        badgesBesideTitle
                        badges={!row.isActive ? <Badge variant="outline" className="text-xs">{String(resolveLanguageKey("inactive"))}</Badge> : null}>
                        <RentalBusinessAccountMenu
                            onAction={setAction}
                        />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconReceipt}
                            label={resolveLanguageKey("vatNumber")}
                            tooltip={resolveLanguageKey("vatNumber")}
                            path="vatNumber"
                            value={row.vatNumber}
                        />
                        <EntityCardRow
                            icon={IconDiscount}
                            label={resolveLanguageKey("discountPercent")}
                            tooltip={resolveLanguageKey("discountPercent")}
                            path="discountPercent"
                            type="number"
                            value={row.discountPercent}
                        />
                    </EntityCard.Body>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setAction("statement");
                        }}
                    >
                        <IconFileTypePdf size={16} />
                        {resolveLanguageKey("statement")}
                    </Button>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage(
        "src/modules/carRental/clients/panel/private/businessAccounts/center/cardView/rentalBusinessAccountCard.tsx",
    ),
    withDebug(true, true, "rentalbusinessaccounts"),
)(RentalBusinessAccountCard);
