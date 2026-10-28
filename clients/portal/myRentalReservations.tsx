import {compose} from "redux";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle} from "@coreModule/components/ui/item.tsx";
import type {RentalMyReservationsResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {formatAtLocation} from "@carRentalModule/clients/client/public/shared/rentalTripParams.ts";
import {useCompanyLink} from "@coreModule/clients/portal/shared/sectionBase.tsx";

/** The portal account's reservations at every rental company; each opens the company's manage page. */
function MyRentalReservations({resolveLanguageKey, languageCode}: WithLanguageType) {
    const companyLink = useCompanyLink();
    const [rows, setRows] = useState<RentalMyReservationsResponse["data"] | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiClient.post<RentalMyReservationsResponse>("/api/carRental/rentalStorefront/mine", {})
            .then((res) => { if (!cancelled) setRows(res.data.data); })
            .catch(() => { if (!cancelled) setRows([]); });
        return () => { cancelled = true; };
    }, []);

    if (rows === null) return <Loader />;
    if (rows.length === 0) return <p className="text-muted-foreground">{resolveLanguageKey("none")}</p>;

    return (
        <ItemGroup className="gap-2">
            {rows.map(({reservation, company, manageToken}) => (
                <Item key={reservation._id} variant="outline">
                    <ItemContent>
                        <ItemTitle>{reservation.categoryName} · {company.name}</ItemTitle>
                        <ItemDescription>
                            {formatAtLocation(reservation.pickupAt, reservation.timezone, languageCode)} → {formatAtLocation(reservation.returnAt, reservation.timezone, languageCode)}
                            {" · "}{reservation.number}
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Badge variant="secondary">{resolveLanguageKey(`status.${reservation.status}`, true) ?? reservation.status}</Badge>
                        <Button asChild variant="outline">
                            <Link to={companyLink("car-rental", company.slug, `/manage?${new URLSearchParams({token: manageToken})}`)}>{resolveLanguageKey("manage")}</Link>
                        </Button>
                    </ItemActions>
                </Item>
            ))}
        </ItemGroup>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/portal/myRentalReservations.tsx"))(MyRentalReservations);
