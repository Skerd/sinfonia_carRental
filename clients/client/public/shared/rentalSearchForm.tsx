import {useCallback, useEffect, useMemo, useState, type FormEvent} from "react";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import type {DateRange} from "react-day-picker";
import {IconChevronDown} from "@tabler/icons-react";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Calendar} from "@coreModule/components/ui/calendar.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@coreModule/components/ui/popover.tsx";
import {useRentalConfig} from "./rentalConfigContext.tsx";
import {dateInDays, tripToSearch, type RentalTripParams} from "./rentalTripParams.ts";
import {Input} from "@coreModule/components/ui/input.tsx";
import {NativeSelect} from "@coreModule/components/ui/native-select.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {RentalStorefrontLocation} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";

const TIME_STEP = 30;

type Props = WithLanguageType & {
    initial?: RentalTripParams | null;
    /** `stack` for the category column; the home search keeps the wide grid. */
    layout?: "grid" | "stack";
    submitLabel?: string;
    submitDisabled?: boolean;
    onSubmitTrip?: (trip: RentalTripParams) => void;
    onTripChange?: (trip: RentalTripParams) => void;
};

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function stampDay(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDay(date: string): Date {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function weekdayOf(date: string): number {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function toMinutes(time: string): number {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
}

function fromMinutes(value: number): string {
    return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
}

function dayOffset(from: string, to: string): number {
    return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

function locationNow(timeZone: string, at = new Date()) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(at);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
    return {date: `${value("year")}-${value("month")}-${value("day")}`, minutes: Number(value("hour")) * 60 + Number(value("minute"))};
}

/** Desk hours on that calendar day, or a daytime window when the location is open around the clock. */
function deskTimes(location: RentalStorefrontLocation, date: string): string[] {
    if (location.closures.includes(date)) return [];
    const dow = weekdayOf(date);
    const rows = location.openingHours.filter((row) => row.dayOfWeek === dow);
    const windows = rows.length
        ? rows
        : location.openingHours.length
            ? []
            : [{dayOfWeek: dow, startTime: "08:00", endTime: "20:00"}];
    const times: string[] = [];
    for (const row of windows) {
        const end = row.endTime === "24:00" ? 24 * 60 : toMinutes(row.endTime);
        for (let time = toMinutes(row.startTime); time <= end; time += TIME_STEP) times.push(fromMinutes(time));
    }
    return [...new Set(times)];
}

function bookableTimes(location: RentalStorefrontLocation, date: string, minLeadHours: number): string[] {
    const now = locationNow(location.timezone);
    const earliest = now.minutes + minLeadHours * 60 - dayOffset(now.date, date) * 24 * 60;
    return deskTimes(location, date).filter((time) => toMinutes(time) >= earliest);
}

function formatDay(date: string, locale: string) {
    return new Intl.DateTimeFormat(locale, {weekday: "short", day: "numeric", month: "short"}).format(parseDay(date));
}

/** Where and when: the search that starts every booking. Times are local to each location. */
function RentalSearchForm({
    resolveLanguageKey,
    languageCode,
    initial,
    layout = "grid",
    submitLabel,
    submitDisabled,
    onSubmitTrip,
    onTripChange,
}: Props) {
    const base = useSectionBase();
    const {config} = useRentalConfig();
    const navigate = useNavigate();
    const pickupLocations = config?.locations.filter((location) => location.pickupAllowed) ?? [];
    const returnLocations = config?.locations.filter((location) => location.returnAllowed) ?? [];
    const stacked = layout === "stack";

    const [trip, setTrip] = useState<RentalTripParams>(() => initial ?? {
        pickupLocation: pickupLocations[0]?._id ?? "",
        returnLocation: pickupLocations[0]?._id ?? "",
        pickupDate: dateInDays(1, pickupLocations[0]?.timezone),
        pickupTime: "10:00",
        returnDate: dateInDays(4, pickupLocations[0]?.timezone),
        returnTime: "10:00",
    });
    const [differentReturn, setDifferentReturn] = useState(() => !!initial && initial.returnLocation !== initial.pickupLocation);
    const update = (patch: Partial<RentalTripParams>) => setTrip((current) => ({...current, ...patch}));
    const resolved = {...trip, returnLocation: differentReturn ? trip.returnLocation : trip.pickupLocation};
    const returnsBeforePickup = `${resolved.returnDate}T${resolved.returnTime}` <= `${resolved.pickupDate}T${resolved.pickupTime}`;

    const pickupLocation = pickupLocations.find((location) => location._id === trip.pickupLocation);
    const dropoffLocation = returnLocations.find((location) => location._id === resolved.returnLocation);
    const minLeadHours = config?.minLeadTimeHours ?? 0;
    const maxAdvanceDays = config?.maxAdvanceDays ?? 90;
    const maxRentalDays = config?.maxRentalDays ?? 30;
    const minRentalHours = config?.minRentalHours ?? 1;
    const today = dateInDays(0, (pickupLocation ?? pickupLocations[0])?.timezone);
    const lastReturn = useMemo(() => {
        const date = parseDay(today);
        date.setDate(date.getDate() + maxAdvanceDays + maxRentalDays);
        return stampDay(date);
    }, [today, maxAdvanceDays, maxRentalDays]);
    const pickupTimes = pickupLocation ? bookableTimes(pickupLocation, trip.pickupDate, minLeadHours) : [];
    const returnTimes = dropoffLocation
        ? bookableTimes(dropoffLocation, trip.returnDate, 0).filter((time) => {
            const earliest = toMinutes(trip.pickupTime) + minRentalHours * 60 - dayOffset(trip.pickupDate, trip.returnDate) * 24 * 60;
            return toMinutes(time) >= earliest;
        })
        : [];
    const locale = useMemo(() => ({code: languageCode}), [languageCode]);
    const todayDate = useMemo(() => parseDay(today), [today]);
    const endMonth = useMemo(() => parseDay(lastReturn), [lastReturn]);
    const calendarClassNames = useMemo(() => ({today: "rounded-(--cell-radius) text-foreground data-[selected=true]:rounded-none"}), []);
    const [month, setMonth] = useState(() => parseDay(trip.pickupDate));
    const [range, setRange] = useState<DateRange>(() => ({from: parseDay(trip.pickupDate), to: parseDay(trip.returnDate)}));

    useEffect(() => {
        onTripChange?.(resolved);
    }, [resolved.pickupLocation, resolved.returnLocation, resolved.pickupDate, resolved.pickupTime, resolved.returnDate, resolved.returnTime, onTripChange]);

    useEffect(() => {
        if (!pickupLocation) return;
        setTrip((current) => {
            const openOnPickup = bookableTimes(pickupLocation, current.pickupDate, minLeadHours);
            const next = openOnPickup.length
                ? (openOnPickup.includes(current.pickupTime) ? current : {...current, pickupTime: openOnPickup[0]})
                : (() => {
                    const start = parseDay(today);
                    for (let offset = 0; offset <= maxAdvanceDays; offset += 1) {
                        const candidate = new Date(start);
                        candidate.setDate(start.getDate() + offset);
                        const stamp = stampDay(candidate);
                        const times = bookableTimes(pickupLocation, stamp, minLeadHours);
                        if (!times.length) continue;
                        return {
                            ...current,
                            pickupDate: stamp,
                            pickupTime: times[0],
                            returnDate: current.returnDate < stamp ? stamp : current.returnDate,
                        };
                    }
                    return current;
                })();
            if (next.pickupDate !== current.pickupDate || next.returnDate !== current.returnDate) {
                setRange({from: parseDay(next.pickupDate), to: parseDay(next.returnDate)});
            }
            return next;
        });
    }, [trip.pickupLocation]);

    useEffect(() => {
        if (!dropoffLocation) return;
        setTrip((current) => {
            const earliest = toMinutes(current.pickupTime) + minRentalHours * 60 - dayOffset(current.pickupDate, current.returnDate) * 24 * 60;
            const times = bookableTimes(dropoffLocation, current.returnDate, 0).filter((time) => toMinutes(time) >= earliest);
            if (times.length && !times.includes(current.returnTime)) return {...current, returnTime: times[0]};
            return current;
        });
    }, [resolved.returnLocation, trip.returnDate, trip.pickupDate, trip.pickupTime, minRentalHours]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (returnsBeforePickup || !resolved.pickupLocation) return;
        if (onSubmitTrip) {
            onSubmitTrip(resolved);
            return;
        }
        navigate(`${base}/search?${tripToSearch(resolved)}`);
    };

    const dayIsClosed = useCallback((date: Date) => {
        if (!pickupLocation) return true;
        const stamp = stampDay(date);
        if (stamp < today || stamp > lastReturn) return true;
        return deskTimes(pickupLocation, stamp).length === 0;
    }, [pickupLocation, today, lastReturn]);

    const onRange = (next: DateRange | undefined) => {
        if (!next?.from) return;
        setRange(next);
        if (!next.to) return;
        const pickupDate = stampDay(next.from);
        const returnDate = stampDay(next.to);
        setTrip((current) => {
            const times = pickupLocation ? bookableTimes(pickupLocation, pickupDate, minLeadHours) : [];
            return {
                ...current,
                pickupDate,
                returnDate,
                pickupTime: times.includes(current.pickupTime) ? current.pickupTime : (times[0] ?? current.pickupTime),
            };
        });
    };

    const shownPickup = range.from ? stampDay(range.from) : trip.pickupDate;
    const shownReturn = range.to ? stampDay(range.to) : shownPickup;

    const locationFields = (
        <>
            <label className={cn("flex flex-col gap-1.5", !stacked && "sm:col-span-2")}>
                <span className="text-sm font-medium">{resolveLanguageKey("pickupLocation")}</span>
                <NativeSelect className="w-full" value={trip.pickupLocation} onChange={(e) => update({pickupLocation: e.target.value})} required>
                    {pickupLocations.map((location) => <option key={location._id} value={location._id}>{location.name}</option>)}
                </NativeSelect>
            </label>
            {differentReturn ? (
                <label className={cn("flex flex-col gap-1.5", !stacked && "sm:col-span-2")}>
                    <span className="text-sm font-medium">{resolveLanguageKey("returnLocation")}</span>
                    <NativeSelect className="w-full" value={trip.returnLocation} onChange={(e) => update({returnLocation: e.target.value})} required>
                        {returnLocations.map((location) => <option key={location._id} value={location._id}>{location.name}</option>)}
                    </NativeSelect>
                </label>
            ) : (
                <label className={cn("flex items-center gap-2 text-sm text-muted-foreground", !stacked && "sm:col-span-2 sm:self-end sm:pb-3")}>
                    <Checkbox checked={differentReturn} onCheckedChange={(checked) => setDifferentReturn(checked === true)} />
                    {resolveLanguageKey("differentReturn")}
                </label>
            )}
        </>
    );

    return (
        <form onSubmit={submit} className={stacked ? "flex flex-col gap-5" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"} noValidate>
            {locationFields}
            {stacked && pickupLocation ? (
                <div className="overflow-hidden rounded-2xl border">
                    <div className="grid grid-cols-[minmax(0,1fr)_7.75rem]">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="bare" className="flex flex-col gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50">
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{resolveLanguageKey("pickupDate")}</span>
                                        <span className="flex items-center gap-1 truncate text-sm font-semibold">
                                            {formatDay(shownPickup, languageCode)}
                                            <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                        </span>
                                    </span>
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{resolveLanguageKey("returnDate")}</span>
                                        <span className="flex items-center gap-1 truncate text-sm font-semibold">
                                            {formatDay(shownReturn, languageCode)}
                                            <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                        </span>
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-[min(calc(100vw-2rem),20.5rem)] p-2">
                                <Calendar
                                    mode="range"
                                    weekStartsOn={1}
                                    locale={locale}
                                    today={todayDate}
                                    month={month}
                                    onMonthChange={setMonth}
                                    selected={range}
                                    onSelect={onRange}
                                    disabled={dayIsClosed}
                                    startMonth={todayDate}
                                    endMonth={endMonth}
                                    showOutsideDays={false}
                                    className="bg-transparent p-1 [--cell-size:--spacing(8)]"
                                    classNames={calendarClassNames}
                                />
                            </PopoverContent>
                        </Popover>
                        <div className="flex flex-col border-l">
                            <label className="flex flex-1 flex-col justify-center gap-1 border-b px-3 py-2">
                                <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{resolveLanguageKey("pickupTime")}</span>
                                {pickupTimes.length ? (
                                    <NativeSelect className="w-full" size="sm" value={trip.pickupTime} onChange={(e) => update({pickupTime: e.target.value})}>
                                        {pickupTimes.map((time) => <option key={time} value={time}>{time}</option>)}
                                    </NativeSelect>
                                ) : (
                                    <span className="text-xs text-muted-foreground">{resolveLanguageKey("noTimesLeft")}</span>
                                )}
                            </label>
                            <label className="flex flex-1 flex-col justify-center gap-1 px-3 py-2">
                                <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{resolveLanguageKey("returnTime")}</span>
                                {returnTimes.length ? (
                                    <NativeSelect className="w-full" size="sm" value={trip.returnTime} onChange={(e) => update({returnTime: e.target.value})}>
                                        {returnTimes.map((time) => <option key={time} value={time}>{time}</option>)}
                                    </NativeSelect>
                                ) : (
                                    <span className="text-xs text-muted-foreground">{resolveLanguageKey("noTimesLeft")}</span>
                                )}
                            </label>
                        </div>
                    </div>
                </div>
            ) : stacked ? null : (
                <>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">{resolveLanguageKey("pickupDate")}</span>
                        <Input type="date" value={trip.pickupDate} min={today} onChange={(e) => update({pickupDate: e.target.value})} required />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">{resolveLanguageKey("pickupTime")}</span>
                        <Input type="time" value={trip.pickupTime} step={900} onChange={(e) => update({pickupTime: e.target.value})} required />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">{resolveLanguageKey("returnDate")}</span>
                        <Input type="date" value={trip.returnDate} min={trip.pickupDate} onChange={(e) => update({returnDate: e.target.value})} required aria-invalid={returnsBeforePickup || undefined} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">{resolveLanguageKey("returnTime")}</span>
                        <Input type="time" value={trip.returnTime} step={900} onChange={(e) => update({returnTime: e.target.value})} required aria-invalid={returnsBeforePickup || undefined} />
                    </label>
                </>
            )}
            {returnsBeforePickup ? <p className={cn("text-sm text-destructive", !stacked && "sm:col-span-2 lg:col-span-4")} role="alert">{resolveLanguageKey("returnBeforePickup")}</p> : null}
            <div className={cn(!stacked && "sm:col-span-2 lg:col-span-4")}>
                <Button size="lg" type="submit" className={stacked ? "w-full" : "w-full sm:w-auto"} disabled={!resolved.pickupLocation || returnsBeforePickup || submitDisabled || (stacked && (!pickupTimes.length || !returnTimes.length))}>
                    {submitLabel ?? resolveLanguageKey("search")}
                </Button>
            </div>
        </form>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/shared/rentalSearchForm.tsx"))(RentalSearchForm);
