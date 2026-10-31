import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalReviewFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/createRentalReview.form.validator.ts";
import type {CreateRentalReviewFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReview/rentalReview.schema-def.ts";

export default createGenericCreatePage<CreateRentalReviewFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/reviews/createRentalReview.tsx",
    collectionName: "rentalreviews",
    accessModel: "rentalreviews",
    apiUrl: "/api/carRental/rentalReview",
    schema: createRentalReviewFormSchema,
    defaultValues: {reservation: "", authorName: "", isPublished: false},
    submitIcon: <IconPlus />,
});
