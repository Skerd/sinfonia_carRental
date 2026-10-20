import {useImperativeHandle} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import ReservationActionDialogShell from "./reservationActionDialogShell.tsx";

type Props = WithLanguageType & WithAxiosType<RentalReservation, {_id: string}> & {
    reservation: RentalReservation;
    onClose: () => void;
    onUpdated: (updated: RentalReservation) => void;
};

function NoShowDialog({reservation, onClose, onUpdated, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    useImperativeHandle(innerRef, () => ({success: (data) => { onUpdated(data); onClose(); }}));
    return (
        <ReservationActionDialogShell
            title={resolveLanguageKey("title")}
            description={resolveLanguageKey("description")}
            confirmLabel={resolveLanguageKey("confirm")}
            cancelLabel={resolveLanguageKey("cancel")}
            loading={loading}
            destructive
            onClose={onClose}
            onConfirm={() => onFilterChange({_id: reservation._id})}
        />
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/reservations/center/dialogs/noShowDialog.tsx"),
    withAxios<RentalReservation, {_id: string}>({url: "/api/carRental/rentalReservation/noShow", method: "POST", data: {}}, true),
    withDebug(true, true, "rentalreservations"),
)(NoShowDialog);
