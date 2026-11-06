import {useMemo, useState} from "react";
import {compose} from "redux";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import type {RentalBusinessAccount} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalBusinessAccountCard from "./center/cardView/rentalBusinessAccountCard.tsx";
import RentalBusinessAccountSheetView from "./center/sheetView/rentalBusinessAccountSheetView.tsx";
import RentalBusinessAccountMenu from "./center/actions/rentalBusinessAccountMenu.tsx";
import RentalStatementDialog from "./center/dialogs/rentalStatementDialog.tsx";

export function rentalBusinessAccountEditPath(row: {_id: string}) {
    return `/carRental/businessAccounts/edit?rentalBusinessAccountId=${row._id}`;
}

function AllRentalBusinessAccounts({resolveLanguageKey}: WithLanguageType) {
    const [statementAccount, setStatementAccount] =
        useState<RentalBusinessAccount | null>(null);
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "isActive",
            label: resolveLanguageKey("fields.isActive"),
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);
    return (
        <>
            <EntityListPage<RentalBusinessAccount>
                rowActionMenu={{allowMenuForCustomChildren: true}}
                renderActionMenuChildren={(account) => (
                    <RentalBusinessAccountMenu
                        onAction={() => setStatementAccount(account)}
                    />
                )}
                apiUrl="/api/carRental/rentalBusinessAccount"
                collectionName="rentalbusinessaccounts"
                accessModel="rentalbusinessaccounts"
                tableConfigKey="rentalbusinessaccounts"
                header={(ctx) => (
                    <EntityListHeader ctx={ctx}>
                        <EntityListCreateButton
                            ctx={ctx}
                            path="/carRental/businessAccounts/create"
                            icon={<IconPlus />}
                        />
                    </EntityListHeader>
                )}
                buildEditPath={rentalBusinessAccountEditPath}
                resolveLanguageKey={resolveLanguageKey}
                quickFilters={quickFilters}
                sheetLanguagePath="src/modules/carRental/clients/panel/private/businessAccounts/center/sheetView/rentalBusinessAccountSheetView.tsx"
                cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                renderSheet={({
                    open,
                    onOpenChange,
                    entity,
                    onDelete,
                    onRestore,
                }) => (
                    <RentalBusinessAccountSheetView
                        open={open}
                        onOpenChange={onOpenChange}
                        rentalBusinessAccount={entity}
                        onDelete={onDelete}
                        onRestore={onRestore}
                    />
                )}
                renderCard={(row, onDelete, onRestore) => (
                    <RentalBusinessAccountCard
                        rentalBusinessAccount={row}
                        onDelete={(
                            deleted: RentalBusinessAccount | undefined,
                            response?: DeletedData,
                        ) => onDelete(deleted, response)}
                        onRestore={() => onRestore(row)}
                    />
                )}
            />
            {statementAccount ? (
                <RentalStatementDialog
                    account={statementAccount}
                    onClose={() => setStatementAccount(null)}
                />
            ) : null}
        </>
    );
}

export default compose(
    withLanguage(
        "src/modules/carRental/clients/panel/private/businessAccounts/index.tsx",
    ),
    withDebug(true, true, "rentalbusinessaccounts"),
)(AllRentalBusinessAccounts);
