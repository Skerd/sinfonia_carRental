import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {PowerOff} from "lucide-react";
import type {RentalLocation} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.dto.ts";

type DeactivateRentalLocationProps = WithLanguageType & {
    entity: Pick<RentalLocation, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function DeactivateRentalLocation({entity, resolveLanguageKey, onAction}: DeactivateRentalLocationProps) {
    const {write} = useAccess("rentallocations");

    if (!write?.isActive) return null;
    if (!entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("deactivateRentalLocation")}>
            <PowerOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/locations/center/actions/deactivateRentalLocation.tsx"),
    withDebug(true, true, "rentallocations"),
)(DeactivateRentalLocation);
