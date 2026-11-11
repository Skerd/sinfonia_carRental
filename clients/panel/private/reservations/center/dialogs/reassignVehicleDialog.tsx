import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalFreeVehicle, RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import type {ReassignRentalVehicleFormType} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.schema-def.ts";

type Props = WithLanguageType & WithAxiosType<RentalReservation, ReassignRentalVehicleFormType> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

const FREE_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalReservation/freeVehicles"};

/**
 * Moves the booking to another car of the same category. Only the cars free for the booking's whole window are
 * offered; the server checks again when it moves it.
 */
function ReassignVehicleDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading, error}: Props) {
    const [vehicle, setVehicle] = useState("");
    const freeRequest = useHttpRequest<{data: RentalFreeVehicle[]}>(FREE_REQUEST, {_id: reservation._id}, 1, true, {
        error: (requestError) => handleError(requestError, {context: "RentalFreeVehicles"}),
    });
    const free = freeRequest.data?.data;
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));

    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            error={error?.message}
            canConfirm={!!vehicle}
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id, vehicle})}
        >
            <div className="flex flex-col gap-2">
                <Label>{resolveLanguageKey("vehicleLabel")}</Label>
                <SimpleSelect
                    options={(free ?? []).map((car) => ({
                        value: car.value,
                        label: car.readiness === "ready" ? car.label : `${car.label} · ${resolveLanguageKey(`readiness.${car.readiness}`)}`,
                    }))}
                    value={vehicle}
                    onValueChange={(value: string | string[]) => setVehicle(String(value))}
                    placeholder={resolveLanguageKey(freeRequest.loading ? "loadingCars" : "vehiclePlaceholder")}
                    resolveLanguageKey={resolveLanguageKey}
                    disabled={loading || !free?.length}
                />
                {free && !free.length ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("noFreeCars")}</p> : null}
            </div>
        </ReservationActionDialogShell>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/reassignVehicleDialog.tsx"),
    withAxios<RentalReservation, ReassignRentalVehicleFormType>({url: "/api/carRental/rentalReservation/reassignVehicle", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(ReassignVehicleDialog);
