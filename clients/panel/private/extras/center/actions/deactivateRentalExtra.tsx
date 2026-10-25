import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {RentalExtra} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.dto.ts";

type DeactivateRentalExtraProps = WithLanguageType & {
    entity: Pick<RentalExtra, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivateRentalExtra({entity, resolveLanguageKey, onAction}: DeactivateRentalExtraProps) {
    const {write} = useAccess("rentalextras");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivateRentalExtra")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/extras/center/actions/deactivateRentalExtra.tsx"),
    withDebug(true, true, "rentalextras"),
)(DeactivateRentalExtra);
