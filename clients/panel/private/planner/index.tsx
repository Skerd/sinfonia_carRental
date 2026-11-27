import {useCallback, useEffect, useState, type DragEvent} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import {IconChevronLeft, IconChevronRight, IconStar, IconTruckDelivery} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {companyToday, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {NativeSelect} from "@coreModule/components/ui/native-select.tsx";
import type {ApiSelectDatum, SelectResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {RENTAL_PLANNER_MAX_DAYS, type RentalPlannerFormType, type RentalPlannerResponse} from "armonia/src/modules/carRental/api/carRental/private/rentalPlanner/rentalPlanner.ts";
import RentalReservationSheetView from "@carRentalModule/clients/panel/private/reservations/center/sheetView/rentalReservationSheetView.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import {toneClass} from "@coreModule/components/entityPage/list/table/columnConfigToColumnDef.tsx";
import {useTableConfig} from "@coreModule/helpers/hooks/useTableConfig.ts";

type Planner = RentalPlannerResponse["data"];
const SPANS = [7, 14, 30];
/** The select's value for "pick an end day yourself". */
const RANGE = "range";
const LOCATIONS_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalLocation/select"};
const CATEGORIES_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/vehicleCategory/select"};
const PLANNER_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalPlanner"};
const REASSIGN_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalReservation/reassignVehicle"};
const SELECT_BODY = {page: 1, limit: 100};
const DAY_MS = 24 * 3600 * 1000;
/** The statuses the planner shows, in the legend's order; cancelled, expired and no-show bookings free the car. */
const SHOWN_STATUSES = ["held", "confirmed", "in_progress", "completed"] as const;
/** Bookings that keep a car busy, as the server counts them (blockingReservationFilter). */
const BLOCKING_STATUSES: string[] = ["held", "confirmed", "in_progress"];
/** Where a dragged booking would land: on a free car of its class, or why not. The server still checks the move. */
type DropVerdict = "free" | "sameCar" | "exactCar" | "otherCategory" | "overlap" | "blocked";
/** A transparent image replaces the browser's drag ghost, so only the landing preview shows. */
const EMPTY_DRAG_IMAGE = typeof Image === "undefined" ? null : Object.assign(new Image(), {src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"});
const TIME: Intl.DateTimeFormatOptions = {hour: "2-digit", minute: "2-digit"};
const DATE_TIME: Intl.DateTimeFormatOptions = {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"};
const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
    new Date(aStart).getTime() < new Date(bEnd).getTime() && new Date(bStart).getTime() < new Date(aEnd).getTime();
const READINESS_CLASS: Record<string, string> = {ready: "bg-emerald-500", needs_cleaning: "bg-amber-500", needs_check: "bg-red-500"};

const shiftDay = (day: string, days: number) => new Date(new Date(`${day}T00:00:00Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);

/**
 * The fleet planner: one row per car, its bookings and blocks along the days. Drag a
 * booking onto another car of the same category to move it there; click it to open it.
 */
function RentalPlannerPage({resolveLanguageKey}: WithLanguageType) {
    // The company's calendar day (GLB-09), not UTC.
    const companyZone = useCompanyTimeZone();
    const [from, setFrom] = useState(() => companyToday(companyZone));
    const [days, setDays] = useState(14);
    // A custom range keeps `days` as its length, so the arrows still step one range at a time.
    const [customRange, setCustomRange] = useState(false);
    const until = shiftDay(from, days - 1);
    const setUntil = (day: string) => {
        const length = Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS) + 1;
        setDays(Math.min(RENTAL_PLANNER_MAX_DAYS, Math.max(1, length)));
    };
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [openReservation, setOpenReservation] = useState<string | null>(null);
    const [dragging, setDragging] = useState<{id: string; categoryId: string} | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);
    const endDrag = () => {
        setDragging(null);
        setDropTarget(null);
    };
    // Booking colours are the reservation list's own status tones (enumTones), so a status reads the same everywhere.
    const {columns: reservationColumns} = useTableConfig("rentalreservations");
    const statusTones = reservationColumns.find((column) => column.id === "status")?.meta?.enumTones;
    const statusClass = (status: string) => toneClass(statusTones?.[status]) ?? "bg-muted text-muted-foreground";

    const optionsLifecycle = {error: (error: unknown) => handleError(error, {context: "RentalPlannerOptions"})};
    const locationsRequest = useHttpRequest<SelectResponse>(LOCATIONS_REQUEST, SELECT_BODY, 1, true, optionsLifecycle);
    const categoriesRequest = useHttpRequest<SelectResponse>(CATEGORIES_REQUEST, SELECT_BODY, 1, true, optionsLifecycle);
    const locations: ApiSelectDatum[] = locationsRequest.data?.data ?? [];
    const categories: ApiSelectDatum[] = categoriesRequest.data?.data ?? [];

    const [plannerCount, setPlannerCount] = useState(0);
    const load = useCallback(() => setPlannerCount((count) => count + 1), []);
    useEffect(() => {
        load();
    }, [from, days, location, category, load]);
    const plannerBody: RentalPlannerFormType = {from, days, ...(location ? {location} : {}), ...(category ? {category} : {})};
    const plannerRequest = useHttpRequest<RentalPlannerResponse>(PLANNER_REQUEST, plannerBody, plannerCount, true, {
        error: (error) => handleError(error, {context: "RentalPlanner"}),
    });
    const planner: Planner | null = plannerRequest.data?.data ?? null;
    const loading = plannerRequest.loading;

    // A dropped bar moves the reservation to that car; the toast names both.
    const [move, setMove] = useState({payload: {_id: "", vehicle: ""}, message: "", count: 0});
    useHttpRequest(REASSIGN_REQUEST, move.payload, move.count, true, {
        success: () => {
            toast.success(move.message);
            load();
        },
        error: (error) => handleError(error, {context: "RentalPlannerReassign"}),
    });

    const start = planner ? new Date(planner.from).getTime() : 0;
    const span = planner ? new Date(planner.to).getTime() - start : 1;
    const position = (startAt: string, endAt: string) => {
        const left = Math.max(0, (new Date(startAt).getTime() - start) / span);
        const right = Math.min(1, (new Date(endAt).getTime() - start) / span);
        return {left: `${left * 100}%`, width: `${Math.max(0.5, (right - left) * 100)}%`};
    };
    // Calendar days are labelled as days (UTC), times in the planner's location zone (GLB-09).
    const dayLabels = Array.from({length: days}, (_, index) =>
        formatDate(`${shiftDay(from, index)}T12:00:00Z`, {timeZone: "UTC", format: {weekday: "short", day: "numeric"}}));
    const formatTime = (iso: string) => formatDate(iso, {timeZone: planner?.timezone, format: DATE_TIME});
    const formatClock = (iso: string) => formatDate(iso, {timeZone: planner?.timezone, format: TIME});

    const verdictOf = (vehicle: Planner["vehicles"][number], reservation: Planner["reservations"][number]): DropVerdict => {
        if (reservation.vehicle === vehicle._id) return "sameCar";
        // A car booked exactly is changed with "Change car", which asks about the price and tells the customer (D198).
        if (reservation.exactVehicle) return "exactCar";
        if (dragging?.categoryId !== vehicle.categoryId) return "otherCategory";
        if (planner?.blocks.some((block) => block.vehicle === vehicle._id && overlaps(block.startAt, block.endAt, reservation.pickupAt, reservation.returnAt))) return "blocked";
        const busy = planner?.reservations.some((other) => other._id !== reservation._id && other.vehicle === vehicle._id
            && BLOCKING_STATUSES.includes(other.status) && overlaps(other.pickupAt, other.returnAt, reservation.pickupAt, reservation.returnAt));
        return busy ? "overlap" : "free";
    };
    const draggedReservation = dragging ? planner?.reservations.find((entry) => entry._id === dragging.id) : undefined;

    /** Where the dragged booking would land on this car: green when it fits, red with the reason when it does not. */
    const dropPreview = (vehicle: Planner["vehicles"][number]) => {
        if (!draggedReservation || dropTarget !== vehicle._id) return null;
        const verdict = verdictOf(vehicle, draggedReservation);
        return (
            <div
                className={cn(
                    "pointer-events-none absolute top-0.5 bottom-0.5 z-20 flex items-center gap-1 overflow-hidden rounded-sm border-2 border-dashed bg-background px-1.5 text-xs font-medium whitespace-nowrap shadow-lg",
                    verdict === "free"
                        ? "border-emerald-500 text-emerald-700 ring-4 ring-emerald-500/20 dark:text-emerald-300"
                        : "border-destructive text-destructive ring-4 ring-destructive/20",
                )}
                style={position(draggedReservation.pickupAt, draggedReservation.returnAt)}
                role="status"
            >
                <span className="truncate">{draggedReservation.customer} · {resolveLanguageKey(`drop.${verdict}`)}</span>
            </div>
        );
    };

    const drop = (event: DragEvent<HTMLDivElement>, vehicle: Planner["vehicles"][number]) => {
        event.preventDefault();
        const reservation = draggedReservation;
        endDrag();
        if (!reservation || reservation.vehicle === vehicle._id) return;
        // A car the preview already showed as taken is not sent; the reason is the one the preview gave.
        const verdict = verdictOf(vehicle, reservation);
        if (verdict !== "free") {
            toast.error(String(resolveLanguageKey(`drop.${verdict}`)));
            return;
        }
        setMove((current) => ({
            payload: {_id: reservation._id, vehicle: vehicle._id},
            message: String(resolveLanguageKey("moved")).replace("{number}", reservation.number).replace("{plate}", vehicle.plate),
            count: current.count + 1,
        }));
    };

    let lastCategory = "";
    return (
        <div className="flex flex-col gap-4 p-4">
            <Header
                title={String(resolveLanguageKey("title"))}
                description={String(resolveLanguageKey("description"))}
                help={readPageHelp(resolveLanguageKey)}
            />
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="icon" aria-label={String(resolveLanguageKey("earlier"))} onClick={() => setFrom(shiftDay(from, -days))}>
                        <IconChevronLeft size={16} />
                    </Button>
                    <DateInput
                        aria-label={String(resolveLanguageKey("from"))}
                        valueFormat="YYYY-MM-DD"
                        value={from}
                        onChange={(value) => value && setFrom(value)}
                        clearable={false}
                        className="w-56"
                    />
                    <Button type="button" variant="outline" size="icon" aria-label={String(resolveLanguageKey("later"))} onClick={() => setFrom(shiftDay(from, days))}>
                        <IconChevronRight size={16} />
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setFrom(companyToday(companyZone))}>{resolveLanguageKey("today")}</Button>
                </div>
                <NativeSelect
                    aria-label={String(resolveLanguageKey("span"))}
                    value={customRange ? RANGE : days}
                    onChange={(e) => {
                        const next = e.target.value;
                        setCustomRange(next === RANGE);
                        if (next !== RANGE) setDays(Number(next));
                    }}
                    className="w-40"
                >
                    {SPANS.map((value) => <option key={value} value={value}>{String(resolveLanguageKey("days")).replace("{count}", String(value))}</option>)}
                    <option value={RANGE}>{resolveLanguageKey("customRange")}</option>
                </NativeSelect>
                {customRange ? (
                    <DateInput
                        aria-label={String(resolveLanguageKey("until"))}
                        valueFormat="YYYY-MM-DD"
                        value={until}
                        onChange={(value) => value && setUntil(value)}
                        minDate={from}
                        maxDate={shiftDay(from, RENTAL_PLANNER_MAX_DAYS - 1)}
                        clearable={false}
                        className="w-56"
                    />
                ) : null}
                <NativeSelect aria-label={String(resolveLanguageKey("location"))} value={location} onChange={(e) => setLocation(e.target.value)} className="w-48">
                    <option value="">{resolveLanguageKey("allLocations")}</option>
                    {locations.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
                </NativeSelect>
                <NativeSelect aria-label={String(resolveLanguageKey("category"))} value={category} onChange={(e) => setCategory(e.target.value)} className="w-48">
                    <option value="">{resolveLanguageKey("allCategories")}</option>
                    {categories.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
                </NativeSelect>
                {loading ? <Loader /> : null}
            </div>

            {/* What the colours, the hatched bars and the dots mean, and how to move a booking. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label={String(resolveLanguageKey("legend"))}>
                {SHOWN_STATUSES.map((status) => (
                    <span key={status} className="flex items-center gap-1.5">
                        <span className={cn("h-3 w-5 rounded-sm", statusClass(status))} aria-hidden />
                        {resolveLanguageKey(`statusValues.${status}`)}
                    </span>
                ))}
                <span className="flex items-center gap-1.5">
                    <span className="h-3 w-5 rounded-sm border border-dashed border-muted-foreground/60 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,var(--muted)_2px,var(--muted)_4px)]" aria-hidden />
                    {resolveLanguageKey("blockedLegend")}
                </span>
                {Object.entries(READINESS_CLASS).map(([readiness, className]) => (
                    <span key={readiness} className="flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", className)} aria-hidden />
                        {resolveLanguageKey(`readiness.${readiness}`)}
                    </span>
                ))}
                <span>{resolveLanguageKey("hint")}</span>
            </div>
            {planner && !planner.vehicles.length ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("noCars")}</p> : null}
            {planner?.vehicles.length ? (
                <div className="overflow-x-auto rounded-md border">
                    {/* Long ranges widen the grid instead of squeezing the day columns. */}
                    <div style={{minWidth: Math.max(900, 180 + days * 36)}}>
                        <div className="grid grid-cols-[180px_1fr] border-b bg-muted/50 text-xs text-muted-foreground">
                            <div className="px-2 py-1.5">{resolveLanguageKey("car")}</div>
                            <div className="grid" style={{gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`}}>
                                {dayLabels.map((label, index) => <div key={index} className="border-l px-1 py-1.5 text-center">{label}</div>)}
                            </div>
                        </div>
                        {planner.vehicles.map((vehicle) => {
                            const header = vehicle.categoryName !== lastCategory ? vehicle.categoryName : null;
                            lastCategory = vehicle.categoryName;
                            // While dragging, cars of another class step back: a booking only moves within its class.
                            const otherClass = !!dragging && dragging.categoryId !== vehicle.categoryId;
                            return (
                                <div key={vehicle._id}>
                                    {header ? <div className="border-b bg-muted/30 px-2 py-1 text-xs font-medium">{header}</div> : null}
                                    <div className={cn("grid grid-cols-[180px_1fr] border-b transition-opacity", otherClass && "opacity-40", dropTarget === vehicle._id && !otherClass && "bg-primary/5")}>
                                        <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
                                            <span
                                                className={`h-2 w-2 shrink-0 rounded-full ${READINESS_CLASS[vehicle.readiness] ?? ""}`}
                                                title={String(resolveLanguageKey(`readiness.${vehicle.readiness}`))}
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{vehicle.plate}</p>
                                                <p className="truncate text-xs text-muted-foreground">{vehicle.label}{vehicle.locationName ? ` · ${vehicle.locationName}` : ""}</p>
                                            </div>
                                        </div>
                                        <div
                                            className="relative h-12"
                                            style={{backgroundImage: `repeating-linear-gradient(to right, transparent, transparent calc(100% / ${days} - 1px), var(--border) calc(100% / ${days} - 1px), var(--border) calc(100% / ${days}))`}}
                                            onDragOver={(event) => {
                                                if (!dragging) return;
                                                event.preventDefault();
                                                if (dropTarget !== vehicle._id) setDropTarget(vehicle._id);
                                            }}
                                            onDrop={(event) => drop(event, vehicle)}
                                        >
                                            {dropPreview(vehicle)}
                                            {planner.blocks.filter((block) => block.vehicle === vehicle._id).map((block) => (
                                                <div
                                                    key={block._id}
                                                    className="absolute top-1 bottom-1 rounded-sm border border-dashed border-muted-foreground/60 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,var(--muted)_4px,var(--muted)_8px)] px-1 text-[11px] leading-10 text-muted-foreground overflow-hidden whitespace-nowrap"
                                                    style={position(block.startAt, block.endAt)}
                                                    title={`${resolveLanguageKey(`blockReason.${block.reason}`)} · ${formatTime(block.startAt)} – ${formatTime(block.endAt)}`}
                                                >
                                                    {resolveLanguageKey(`blockReason.${block.reason}`)}
                                                </div>
                                            ))}
                                            {planner.reservations.filter((entry) => entry.vehicle === vehicle._id).map((entry) => (
                                                <Button
                                                    key={entry._id}
                                                    type="button"
                                                    variant="bare"
                                                    draggable={entry.status === "held" || entry.status === "confirmed"}
                                                    onDragStart={(event) => {
                                                        event.dataTransfer.effectAllowed = "move";
                                                        if (EMPTY_DRAG_IMAGE) event.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, 0, 0);
                                                        setDragging({id: entry._id, categoryId: vehicle.categoryId});
                                                    }}
                                                    onDragEnd={endDrag}
                                                    onClick={() => setOpenReservation(entry._id)}
                                                    className={cn("absolute top-1 bottom-1 flex items-center gap-1 overflow-hidden rounded-sm px-1.5 text-left text-xs whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ring", statusClass(entry.status), dragging?.id === entry._id && "opacity-40",
                                                        // A grab hand on the bookings that can be dragged to another car; the rest only open.
                                                        entry.status === "held" || entry.status === "confirmed" ? "cursor-grab active:cursor-grabbing" : "cursor-pointer")}
                                                    style={position(entry.pickupAt, entry.returnAt)}
                                                    title={`${entry.customer} · ${resolveLanguageKey(`statusValues.${entry.status}`)} · ${formatTime(entry.pickupAt)} – ${formatTime(entry.returnAt)} · ${entry.number}${entry.exactVehicle ? ` · ${resolveLanguageKey("exactVehicle")}` : ""}${entry.needsTransfer ? ` · ${resolveLanguageKey("needsTransfer")}` : ""}`}
                                                >
                                                    {entry.exactVehicle ? <IconStar size={14} aria-label={String(resolveLanguageKey("exactVehicle"))} /> : null}
                                                    {entry.needsTransfer ? <IconTruckDelivery size={14} aria-label={String(resolveLanguageKey("needsTransfer"))} /> : null}
                                                    <span className="truncate">{entry.customer}</span>
                                                    {/* A bar wide enough (over two days) also says when the car goes and comes back. */}
                                                    {new Date(entry.returnAt).getTime() - new Date(entry.pickupAt).getTime() > (span / days) * 2 ? (
                                                        <span className="truncate tabular-nums opacity-80">{formatClock(entry.pickupAt)}–{formatClock(entry.returnAt)}</span>
                                                    ) : null}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
            {openReservation ? (
                <RentalReservationSheetView open onOpenChange={(open: boolean) => !open && setOpenReservation(null)} fetchId={openReservation} onSheetRowPatched={load} />
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/planner/index.tsx"),
    withDebug(true, true, "rentalreservations"),
)(RentalPlannerPage);
