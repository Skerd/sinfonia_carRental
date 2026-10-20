import {useState, type FormEvent} from "react";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useRentalConfig} from "./rentalConfigContext.tsx";
import {dateInDays, tripToSearch, type RentalTripParams} from "./rentalTripParams.ts";
import {RENT_INPUT, RENT_LABEL, RENT_PRIMARY_BUTTON} from "./rentalStyles.ts";

type Props = WithLanguageType & {initial?: RentalTripParams | null};

/** Where and when: the search that starts every booking. Times are local to each location. */
function RentalSearchForm({resolveLanguageKey, initial}: Props) {
    const {config} = useRentalConfig();
    const navigate = useNavigate();
    const pickupLocations = config?.locations.filter((location) => location.pickupAllowed) ?? [];
    const returnLocations = config?.locations.filter((location) => location.returnAllowed) ?? [];

    const [trip, setTrip] = useState<RentalTripParams>(() => initial ?? {
        pickupLocation: pickupLocations[0]?._id ?? "",
        returnLocation: pickupLocations[0]?._id ?? "",
        pickupDate: dateInDays(1),
        pickupTime: "10:00",
        returnDate: dateInDays(4),
        returnTime: "10:00",
    });
    const [differentReturn, setDifferentReturn] = useState(() => !!initial && initial.returnLocation !== initial.pickupLocation);
    const update = (patch: Partial<RentalTripParams>) => setTrip((current) => ({...current, ...patch}));
    const returnsBeforePickup = `${trip.returnDate}T${trip.returnTime}` <= `${trip.pickupDate}T${trip.pickupTime}`;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (returnsBeforePickup) return;
        navigate(`/search?${tripToSearch({...trip, returnLocation: differentReturn ? trip.returnLocation : trip.pickupLocation})}`);
    };

    return (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" noValidate>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={RENT_LABEL}>{resolveLanguageKey("pickupLocation")}</span>
                <select className={RENT_INPUT} value={trip.pickupLocation} onChange={(e) => update({pickupLocation: e.target.value})} required>
                    {pickupLocations.map((location) => <option key={location._id} value={location._id}>{location.name}</option>)}
                </select>
            </label>
            {differentReturn ? (
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={RENT_LABEL}>{resolveLanguageKey("returnLocation")}</span>
                    <select className={RENT_INPUT} value={trip.returnLocation} onChange={(e) => update({returnLocation: e.target.value})} required>
                        {returnLocations.map((location) => <option key={location._id} value={location._id}>{location.name}</option>)}
                    </select>
                </label>
            ) : (
                <label className="flex items-center gap-2 self-end text-sm text-rent-ink-muted sm:col-span-2 sm:pb-3">
                    <input type="checkbox" checked={differentReturn} onChange={(e) => setDifferentReturn(e.target.checked)} />
                    {resolveLanguageKey("differentReturn")}
                </label>
            )}
            <label className="flex flex-col gap-1.5">
                <span className={RENT_LABEL}>{resolveLanguageKey("pickupDate")}</span>
                <input type="date" className={RENT_INPUT} value={trip.pickupDate} min={dateInDays(0)} onChange={(e) => update({pickupDate: e.target.value})} required />
            </label>
            <label className="flex flex-col gap-1.5">
                <span className={RENT_LABEL}>{resolveLanguageKey("pickupTime")}</span>
                <input type="time" className={RENT_INPUT} value={trip.pickupTime} step={900} onChange={(e) => update({pickupTime: e.target.value})} required />
            </label>
            <label className="flex flex-col gap-1.5">
                <span className={RENT_LABEL}>{resolveLanguageKey("returnDate")}</span>
                <input type="date" className={RENT_INPUT} value={trip.returnDate} min={trip.pickupDate} onChange={(e) => update({returnDate: e.target.value})} required aria-invalid={returnsBeforePickup || undefined} />
            </label>
            <label className="flex flex-col gap-1.5">
                <span className={RENT_LABEL}>{resolveLanguageKey("returnTime")}</span>
                <input type="time" className={RENT_INPUT} value={trip.returnTime} step={900} onChange={(e) => update({returnTime: e.target.value})} required aria-invalid={returnsBeforePickup || undefined} />
            </label>
            {returnsBeforePickup ? <p className="text-sm text-rent-danger sm:col-span-2 lg:col-span-4" role="alert">{resolveLanguageKey("returnBeforePickup")}</p> : null}
            <div className="sm:col-span-2 lg:col-span-4">
                <button type="submit" className={`${RENT_PRIMARY_BUTTON} w-full sm:w-auto`} disabled={!trip.pickupLocation || returnsBeforePickup}>
                    {resolveLanguageKey("search")}
                </button>
            </div>
        </form>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/shared/rentalSearchForm.tsx"))(RentalSearchForm);
