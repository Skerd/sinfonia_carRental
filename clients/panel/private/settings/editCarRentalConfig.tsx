import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/inputs/objectIdChipsInput.tsx";
import {editCarRentalConfigFormSchema} from "armonia/src/modules/carRental/api/carRental/private/carRentalConfig/editCarRentalConfig.form.validator.ts";
import type {EditCarRentalConfigFormType} from "armonia/src/modules/carRental/api/carRental/private/carRentalConfig/carRentalConfig.schema-def.ts";
import type {CarRentalConfig} from "armonia/src/modules/carRental/api/carRental/private/carRentalConfig/carRentalConfig.dto.ts";
import type {SimpleBlankUser} from "armonia/src/modules/core/dto/user.dto.ts";
import {getName} from "@coreModule/helpers/general/names.ts";

const chipLabelState = {
    loadedId: null as string | null,
    notifyUsers: {current: {} as Record<string, string>},
};

function userDisplayName(user: SimpleBlankUser): string {
    return getName(user) || user._id;
}

export default createGenericEditPage<CarRentalConfig, EditCarRentalConfigFormType>({
    languagePath: "src/modules/carRental/clients/panel/private/settings/editCarRentalConfig.tsx",
    collectionName: "carrentalconfigs",
    accessModel: "carrentalconfigs",
    apiUrl: "/api/carRental/carRentalConfig",
    schema: editCarRentalConfigFormSchema,
    mapEntityData: (data) => ({
        ...data,
        currency: data.currency?._id,
        notifyUsers: data.notifyUsers?.map((user) => user._id) ?? [],
    }),
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity && chipLabelState.loadedId !== entity._id) {
            chipLabelState.loadedId = entity._id;
            chipLabelState.notifyUsers.current = {};
        }
        const users = entity?.notifyUsers?.filter((user) => !!user?._id) ?? [];
        for (const user of users) chipLabelState.notifyUsers.current[user._id] = userDisplayName(user);
        return {
            notifyUsers: users.map((user) => ({value: user._id, label: userDisplayName(user)})),
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {notifyUsers: chipLabelState.notifyUsers},
        };
    },
    submitIcon: <Save />,
});
