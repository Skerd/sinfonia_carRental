import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconEyeOff} from "@tabler/icons-react";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";

type UnpublishRentalReviewProps = WithLanguageType & {
    entity: Pick<RentalReview, "_id" | "isPublished">;
    onAction: (action: string) => void;
};

function UnpublishRentalReview({entity, resolveLanguageKey, onAction}: UnpublishRentalReviewProps) {
    const {write} = useAccess("rentalreviews");

    if (!write?.isPublished) return null;
    if (!entity.isPublished) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("unpublishRentalReview")}>
            <IconEyeOff className="text-destructive" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reviews/center/actions/unpublishRentalReview.tsx"),
    withDebug(true, true, "rentalreviews"),
)(UnpublishRentalReview);
