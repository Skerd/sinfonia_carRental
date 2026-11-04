import {compose} from "redux";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconFileTypePdf} from "@tabler/icons-react";

export type RentalBusinessAccountAction = "statement";

type Props = WithLanguageType & {
    onAction: (action: RentalBusinessAccountAction) => void;
};

/** Statement download for the account the row or sheet already has open. */
function RentalBusinessAccountMenu({
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
