import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalReviewFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/editRentalReview.form.validator.ts";
import type {EditRentalReviewFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.schema-def.ts";
import type {RentalReview} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.dto.ts";

export default createGenericEditPage<RentalReview, EditRentalReviewFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/reviews/editRentalReview.tsx",
    collectionName: "rentalreviews",
    accessModel: "rentalreviews",
    apiUrl: "/api/carRental/rentalReview",
    schema: editRentalReviewFormSchema,
    mapEntityData: (data) => ({...data, reservation: data.reservation?._id}),
    submitIcon: <Save />,
});
