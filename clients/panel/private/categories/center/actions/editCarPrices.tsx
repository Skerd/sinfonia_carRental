import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconTags} from "@tabler/icons-react";

type EditCarPricesProps = WithLanguageType & {
    onAction: (action: string) => void;
};

/** "Car prices" (D198): shown to whoever may set the cars' own prices. */
function EditCarPrices({resolveLanguageKey, onAction}: EditCarPricesProps) {
    const {write} = useAccess("vehicles");
    if (!write?.dailyRate || !write?.listedAlone) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("editCarPrices")}>
            <IconTags size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/categories/center/actions/editCarPrices.tsx"),
    withDebug(true, true, "vehiclecategories"),
)(EditCarPrices);
