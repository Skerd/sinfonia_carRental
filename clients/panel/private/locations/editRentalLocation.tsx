import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalLocationFormSchema} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/editRentalLocation.form.validator.ts";
import type {EditRentalLocationFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.schema-def.ts";
import type {RentalLocation} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.dto.ts";

/**
 * The edit form's values. An opening-hours row holds `dayOfWeek` as a string while editing, because the
 * #SimpleSelect weekday options are "0"…"6"; the schema turns it back into a number on submit.
 */
type RentalLocationFormValues = Omit<EditRentalLocationFormType, "openingHours"> & {
    openingHours?: (Omit<NonNullable<EditRentalLocationFormType["openingHours"]>[number], "dayOfWeek"> & {dayOfWeek: string})[];
};

export default createGenericEditPage<RentalLocation, RentalLocationFormValues>({
    languagePath: "src/modules/carRental/clients/panel/private/locations/editRentalLocation.tsx",
    collectionName: "rentallocations",
    accessModel: "rentallocations",
    apiUrl: "/api/carRental/rentalLocation",
    schema: editRentalLocationFormSchema,
    mapEntityData: (data) => ({
        ...data,
        address: data.address ? {...data.address, country: data.address.country?._id, city: data.address.city?._id} : undefined,
        openingHours: data.openingHours?.map((slot) => ({...slot, dayOfWeek: String(slot.dayOfWeek)})),
    }),
    submitIcon: <IconDeviceFloppy />,
});
