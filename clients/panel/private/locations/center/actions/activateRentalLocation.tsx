import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconPower} from "@tabler/icons-react";
import type {RentalLocation} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.dto.ts";

type ActivateRentalLocationProps = WithLanguageType & {
    entity: Pick<RentalLocation, "_id" | "isActive">;
    onAction: (action: string) => void;
};

function ActivateRentalLocation({entity, resolveLanguageKey, onAction}: ActivateRentalLocationProps) {
    const {write} = useAccess("rentallocations");

    if (!write?.isActive) return null;
    if (entity.isActive) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("activateRentalLocation")}>
            <IconPower className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/locations/center/actions/activateRentalLocation.tsx"),
    withDebug(true, true, "rentallocations"),
)(ActivateRentalLocation);
