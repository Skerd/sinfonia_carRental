import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalReservationFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.form.validators.ts";
import type {CreateRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";
import {categoryIdFromSearch, categoryNameFromSearch, vehicleExtraTitles, vehicleFormExtras, vehicleIdFromSearch} from "@carRentalModule/clients/panel/vehicleScope.ts";

export default createGenericCreatePage<CreateRentalReservationFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/reservations/createRentalReservation.tsx",
    collectionName: "rentalreservations",
    accessModel: "rentalreservations",
    apiUrl: "/api/carRental/rentalReservation",
    schema: createRentalReservationFormSchema,
    defaultValues: (params) => {
        const vehicle = vehicleIdFromSearch(params);
        return {
            category: categoryIdFromSearch(params),
            ...(vehicle ? {vehicle} : {}),
            pickupLocation: "",
            returnLocation: "",
            pickupDate: "",
            pickupTime: "10:00",
            returnDate: "",
            returnTime: "10:00",
            contact: {firstName: "", lastName: "", email: "", phone: ""},
            extras: [],
            // One key per form: a double submit or a retried request returns the same booking
            idempotencyKey: crypto.randomUUID(),
        };
    },
    buildFormExtras: (params) => {
        const extras = vehicleFormExtras(params);
        const categoryId = categoryIdFromSearch(params);
        const categoryName = categoryNameFromSearch(params);
        if (categoryId && categoryName) extras.categoryDefaultOptions = [{value: categoryId, label: categoryName}];
        return extras;
    },
    buildExtraTitles: vehicleExtraTitles,
    submitIcon: <IconPlus />,
});
