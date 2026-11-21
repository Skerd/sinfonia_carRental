import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle} from "@coreModule/components/ui/item.tsx";
import type {RentalMyReservationsResponse} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {formatAtLocation} from "@carRentalModule/clients/client/public/shared/rentalTripParams.ts";
import {useCompanyLink} from "@coreModule/clients/portal/shared/sectionBase.tsx";

const MINE_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalStorefront/mine", cache: true};

/** The portal account's reservations at every rental company; each opens the company's manage page. */
function MyRentalReservations({resolveLanguageKey}: WithLanguageType) {
    const companyLink = useCompanyLink();
    const mine = useHttpRequest<RentalMyReservationsResponse>(MINE_REQUEST, {}, 1);
    const rows = mine.error ? [] : mine.data?.data ?? null;

    if (rows === null) return <Loader />;
    if (rows.length === 0) return <p className="text-muted-foreground">{resolveLanguageKey("none")}</p>;

    return (
        <ItemGroup className="gap-2">
            {rows.map(({reservation, company, manageToken}) => (
                <Item key={reservation._id} variant="outline">
                    <ItemContent>
                        <ItemTitle>{reservation.categoryName} · {company.name}</ItemTitle>
                        <ItemDescription>
                            {formatAtLocation(reservation.pickupAt, reservation.timezone)} → {formatAtLocation(reservation.returnAt, reservation.timezone)}
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
