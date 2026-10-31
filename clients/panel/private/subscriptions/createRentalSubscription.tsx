import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createRentalSubscriptionFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalSubscription/createRentalSubscription.form.validator.ts";
import type {CreateRentalSubscriptionFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalSubscription/rentalSubscription.schema-def.ts";

export default createGenericCreatePage<CreateRentalSubscriptionFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/subscriptions/createRentalSubscription.tsx",
    collectionName: "rentalsubscriptions",
    accessModel: "rentalsubscriptions",
    apiUrl: "/api/carRental/rentalSubscription",
    schema: createRentalSubscriptionFormSchema,
    defaultValues: {contactName: "", email: "", phone: "", category: "", pickupLocation: "", period: "month", status: "active", nextRunAt: ""},
    submitIcon: <IconPlus />,
});
