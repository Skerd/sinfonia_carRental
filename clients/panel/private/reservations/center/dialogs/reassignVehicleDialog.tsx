import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {ApiSelect} from "@coreModule/components/viewEngine/widgets/inputs/apiSelect/apiSelect.tsx";
import type {ReassignRentalVehicleFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<RentalReservation, ReassignRentalVehicleFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

/** Moves the booking to another car of the same category; the server checks it is free. */
function ReassignVehicleDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    const [vehicle, setVehicle] = useState("");
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            canConfirm={!!vehicle}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id, vehicle})}
        >
            <div className="flex flex-col gap-2">
                <Label>{resolveLanguageKey("vehicleLabel")}</Label>
                <ApiSelect
                    apiUrl="/api/carRental/vehicle/select"
                    postBody={{category: reservation.category?._id}}
                    value={vehicle}
                    onValueChange={(value: string | string[]) => setVehicle(String(value))}
                    placeholder={resolveLanguageKey("vehiclePlaceholder")}
                    resolveLanguageKey={resolveLanguageKey}
                    disabled={loading}
                    className="w-full"
                />
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/reassignVehicleDialog.tsx"),
    withAxios<RentalReservation, ReassignRentalVehicleFormType>({url: "/api/carRental/rentalReservation/reassignVehicle", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(ReassignVehicleDialog);
