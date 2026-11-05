import type {ReactNode} from "react";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";

type OwnProps = {
    children: (reservation: RentalReservation) => ReactNode;
};

/**
 * The whole reservation, read through its own record. A list row leaves out identity data (SEC-06: drivers'
 * licences and IDs), so dialogs that show or save drivers start from this, never from the row.
 */
function FullReservation({data, children}: OwnProps & WithAxiosType<RentalReservation, {_id: string}>) {
    return data ? <>{children(data)}</> : null;
}

export default withAxios<RentalReservation, {_id: string}>({url: "/api/carRental/rentalReservation/single", method: "POST", data: {}})<OwnProps>(FullReservation);
