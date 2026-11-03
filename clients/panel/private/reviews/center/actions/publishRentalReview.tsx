import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Globe} from "lucide-react";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";

type PublishRentalReviewProps = WithLanguageType & {
    entity: Pick<RentalReview, "_id" | "isPublished">;
    onAction: (action: string) => void;
};

function PublishRentalReview({entity, resolveLanguageKey, onAction}: PublishRentalReviewProps) {
    const {write} = useAccess("rentalreviews");

    if (!write?.isPublished) return null;
    if (entity.isPublished) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("publishRentalReview")}>
            <Globe className="text-success" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reviews/center/actions/publishRentalReview.tsx"),
    withDebug(true, true, "rentalreviews"),
)(PublishRentalReview);
