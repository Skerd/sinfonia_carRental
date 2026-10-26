import {compose} from "redux";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import type {RentalMyReservationsResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {formatAtLocation} from "@carRentalModule/clients/client/public/shared/rentalTripParams.ts";

/** The portal account's reservations at every rental company; each opens the company's manage page. */
function MyRentalReservations({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [rows, setRows] = useState<RentalMyReservationsResponse["data"] | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiClient.post<RentalMyReservationsResponse>("/api/carRental/rentalStorefront/mine", {})
            .then((res) => { if (!cancelled) setRows(res.data.data); })
            .catch(() => { if (!cancelled) setRows([]); });
        return () => { cancelled = true; };
    }, []);

    if (rows === null) return <Loader />;
    if (rows.length === 0) return <p className="text-portal-ink-muted">{resolveLanguageKey("none")}</p>;

    return (
        <ul className="flex flex-col divide-y divide-portal-border">
            {rows.map(({reservation, company, manageToken}) => (
                <li key={reservation._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                        <p className="font-medium">{reservation.categoryName} · {company.name}</p>
                        <p className="text-sm text-portal-ink-muted">
                            {formatAtLocation(reservation.pickupAt, reservation.timezone, languageCode)} → {formatAtLocation(reservation.returnAt, reservation.timezone, languageCode)}
                            {" · "}{reservation.number} · {resolveLanguageKey(`status.${reservation.status}`, true) ?? reservation.status}
                        </p>
                    </div>
                    <Link to={`/car-rental/${company.slug}/manage?${new URLSearchParams({token: manageToken})}`} className="text-sm font-semibold text-portal-accent hover:underline">
                        {resolveLanguageKey("manage")}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/portal/myRentalReservations.tsx"))(MyRentalReservations);
