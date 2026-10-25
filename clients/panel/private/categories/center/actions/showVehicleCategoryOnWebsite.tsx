import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconWorld} from "@tabler/icons-react";
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";

type ShowVehicleCategoryOnWebsiteProps = WithLanguageType & {
    entity: Pick<VehicleCategory, "_id" | "isPublic">;
    onAction: (action: string) => void;
};

function ShowVehicleCategoryOnWebsite({entity, resolveLanguageKey, onAction}: ShowVehicleCategoryOnWebsiteProps) {
    const {write} = useAccess("vehiclecategories");

    if (!write?.isPublic) return null;
    if (entity.isPublic) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("showVehicleCategoryOnWebsite")}>
            <IconWorld className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/categories/center/actions/showVehicleCategoryOnWebsite.tsx"),
    withDebug(true, true, "vehiclecategories"),
)(ShowVehicleCategoryOnWebsite);
