import {compose} from "redux";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconFileTypePdf} from "@tabler/icons-react";
import type {RentalBusinessAccount} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.dto.ts";

export type RentalBusinessAccountAction = "statement";

type Props = WithLanguageType & {
    account: RentalBusinessAccount;
    onAction: (action: RentalBusinessAccountAction) => void;
};

/** Statement download for the account the row or sheet already has open. */
function RentalBusinessAccountMenu({
    account,
    onAction,
    resolveLanguageKey,
}: Props) {
    const {read} = useAccess("rentalbusinessaccounts");
    if (!read?.vatNumber) return null;
    return (
        <DropdownMenuItem
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onAction("statement");
            }}
        >
            <IconFileTypePdf size={16} />
            <p>{resolveLanguageKey("statement")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage(
        "src/modules/carRental/clients/panel/private/businessAccounts/center/actions/rentalBusinessAccountMenu.tsx",
    ),
    withDebug(true, true, "rentalbusinessaccounts"),
)(RentalBusinessAccountMenu);
