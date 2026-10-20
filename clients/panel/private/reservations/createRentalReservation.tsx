import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalReservationFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.form.validators.ts";
import type {CreateRentalReservationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.forms.ts";

export default createGenericCreatePage<CreateRentalReservationFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/reservations/createRentalReservation.tsx",
    collectionName: "rentalreservations",
    accessModel: "rentalreservations",
    apiUrl: "/api/carRental/rentalReservation",
    schema: createRentalReservationFormSchema,
    defaultValues: () => ({
        category: "",
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
    }),
    submitIcon: <IconPlus />,
});
