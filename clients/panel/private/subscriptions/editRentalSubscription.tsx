import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalSubscriptionFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalSubscription/editRentalSubscription.form.validator.ts";
import type {EditRentalSubscriptionFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalSubscription/rentalSubscription.schema-def.ts";
import type {RentalSubscription} from "armonia/src/modules/carRental/api/carRental/private/rentalSubscription/rentalSubscription.dto.ts";

export default createGenericEditPage<RentalSubscription, EditRentalSubscriptionFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/subscriptions/editRentalSubscription.tsx",
    collectionName: "rentalsubscriptions",
    accessModel: "rentalsubscriptions",
    apiUrl: "/api/carRental/rentalSubscription",
    schema: editRentalSubscriptionFormSchema,
    mapEntityData: (data) => ({...data, category: data.category?._id, pickupLocation: data.pickupLocation?._id}),
    submitIcon: <Save />,
});
