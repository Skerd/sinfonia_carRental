import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {RentalBusinessAccount} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalBusinessAccountMenu from "@carRentalModule/clients/panel/private/businessAccounts/center/actions/rentalBusinessAccountMenu.tsx";
import RentalStatementDialog from "@carRentalModule/clients/panel/private/businessAccounts/center/dialogs/rentalStatementDialog.tsx";

type RentalBusinessAccountSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalBusinessAccount?: RentalBusinessAccount;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<RentalBusinessAccount>) => void;
    fetchId?: string;
};

function RentalBusinessAccountSheetView({
    open,
    onOpenChange,
    rentalBusinessAccount: rentalBusinessAccountProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: RentalBusinessAccountSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(
        rentalBusinessAccountProp || {_id: fetchId},
    );
    const [statementOpen, setStatementOpen] = useState(false);
    const access = useAccess("rentalbusinessaccounts");
    const viewConfig = useViewConfig("rentalbusinessaccounts", "sheet");

    useEffect(() => {
        if (!rentalBusinessAccountProp) return;
        setSheetData(rentalBusinessAccountProp);
    }, [rentalBusinessAccountProp]);

    const entityId = rentalBusinessAccountProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/carRental/rentalBusinessAccount/single"
                fetchId={fetchId ?? entityId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={`/carRental/businessAccounts/edit?rentalBusinessAccountId=${entityId}`}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    rentalBusinessAccountProp ? (
                        <RentalBusinessAccountMenu
                            account={rentalBusinessAccountProp}
                            onAction={() => setStatementOpen(true)}
                        />
                    ) : null
                }
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row as Partial<RentalBusinessAccount>);
                }}
            />
            {statementOpen && rentalBusinessAccountProp ? (
                <RentalStatementDialog
                    account={rentalBusinessAccountProp}
                    onClose={() => setStatementOpen(false)}
                />
            ) : null}
        </>
    );
}

export default compose(
    withLanguage(
        "src/modules/carRental/clients/panel/private/businessAccounts/center/sheetView/rentalBusinessAccountSheetView.tsx",
    ),
    withDebug(true, true, "rentalbusinessaccounts"),
)(RentalBusinessAccountSheetView);
