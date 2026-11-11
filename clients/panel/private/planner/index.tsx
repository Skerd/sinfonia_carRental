import {useCallback, useEffect, useMemo, useState, type DragEvent} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import {IconChevronLeft, IconChevronRight, IconTruckDelivery} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {NativeSelect} from "@coreModule/components/ui/native-select.tsx";
import type {ApiSelectDatum, SelectResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalPlannerFormType, RentalPlannerResponse} from "armonia/src/modules/carRental/api/carRental/private/rentalPlanner/rentalPlanner.ts";
import RentalReservationSheetView from "@carRentalModule/clients/panel/private/reservations/center/sheetView/rentalReservationSheetView.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

type Planner = RentalPlannerResponse["data"];
const SPANS = [7, 14, 30];
const LOCATIONS_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalLocation/select"};
const CATEGORIES_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/vehicleCategory/select"};
const PLANNER_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalPlanner"};
const REASSIGN_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalReservation/reassignVehicle"};
const SELECT_BODY = {page: 1, limit: 100};
const DAY_MS = 24 * 3600 * 1000;
/** Status colours: the same tones the reservation list uses. */
const STATUS_CLASS: Record<string, string> = {
    held: "bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-50",
    confirmed: "bg-sky-200 text-sky-950 dark:bg-sky-900 dark:text-sky-50",
    in_progress: "bg-emerald-200 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50",
    completed: "bg-muted text-muted-foreground",
};
const READINESS_CLASS: Record<string, string> = {ready: "bg-emerald-500", needs_cleaning: "bg-amber-500", needs_check: "bg-red-500"};

const today = () => new Date().toISOString().slice(0, 10);
const shiftDay = (day: string, days: number) => new Date(new Date(`${day}T00:00:00Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);

/**
 * The fleet planner: one row per car, its bookings and blocks along the days. Drag a
 * booking onto another car of the same category to move it there; click it to open it.
 */
function RentalPlannerPage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [from, setFrom] = useState(today());
    const [days, setDays] = useState(14);
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [openReservation, setOpenReservation] = useState<string | null>(null);
    const [dragging, setDragging] = useState<{id: string; categoryId: string} | null>(null);

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
    const dayLabels = useMemo(() => Array.from({length: days}, (_, index) => {
        const day = new Date(`${shiftDay(from, index)}T12:00:00Z`);
        return new Intl.DateTimeFormat(languageCode, {weekday: "short", day: "numeric"}).format(day);
    }), [from, days, languageCode]);
    const formatTime = (iso: string) => new Intl.DateTimeFormat(languageCode, {timeZone: planner?.timezone, dateStyle: "short", timeStyle: "short"}).format(new Date(iso));

    const drop = (event: DragEvent<HTMLDivElement>, vehicle: Planner["vehicles"][number]) => {
        event.preventDefault();
        const moving = dragging;
        setDragging(null);
        if (!moving || moving.categoryId !== vehicle.categoryId) return;
        const reservation = planner?.reservations.find((entry) => entry._id === moving.id);
        if (!reservation || reservation.vehicle === vehicle._id) return;
        setMove((current) => ({
            payload: {_id: moving.id, vehicle: vehicle._id},
            message: String(resolveLanguageKey("moved")).replace("{number}", reservation.number).replace("{plate}", vehicle.plate),
            count: current.count + 1,
        }));
    };

    let lastCategory = "";
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="icon" aria-label={String(resolveLanguageKey("earlier"))} onClick={() => setFrom(shiftDay(from, -days))}>
                        <IconChevronLeft size={16} />
                    </Button>
                    <Input aria-label={String(resolveLanguageKey("from"))} type="date" value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} className="w-40" />
                    <Button type="button" variant="outline" size="icon" aria-label={String(resolveLanguageKey("later"))} onClick={() => setFrom(shiftDay(from, days))}>
                        <IconChevronRight size={16} />
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setFrom(today())}>{resolveLanguageKey("today")}</Button>
                </div>
                <NativeSelect aria-label={String(resolveLanguageKey("span"))} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-32">
                    {SPANS.map((value) => <option key={value} value={value}>{String(resolveLanguageKey("days")).replace("{count}", String(value))}</option>)}
                </NativeSelect>
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

            {planner && !planner.vehicles.length ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("noCars")}</p> : null}
            {planner?.vehicles.length ? (
                <div className="overflow-x-auto rounded-md border">
                    <div className="min-w-[900px]">
                        <div className="grid grid-cols-[180px_1fr] border-b bg-muted/50 text-xs text-muted-foreground">
                            <div className="px-2 py-1.5">{resolveLanguageKey("car")}</div>
                            <div className="grid" style={{gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))`}}>
                                {dayLabels.map((label, index) => <div key={index} className="border-l px-1 py-1.5 text-center">{label}</div>)}
                            </div>
                        </div>
                        {planner.vehicles.map((vehicle) => {
                            const header = vehicle.categoryName !== lastCategory ? vehicle.categoryName : null;
                            lastCategory = vehicle.categoryName;
                            const canDrop = dragging?.categoryId === vehicle.categoryId;
                            return (
                                <div key={vehicle._id}>
                                    {header ? <div className="border-b bg-muted/30 px-2 py-1 text-xs font-medium">{header}</div> : null}
                                    <div className={`grid grid-cols-[180px_1fr] border-b ${canDrop ? "bg-primary/5" : ""}`}>
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
                                            onDragOver={(event) => canDrop && event.preventDefault()}
                                            onDrop={(event) => drop(event, vehicle)}
                                        >
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
                                                    onDragStart={() => setDragging({id: entry._id, categoryId: vehicle.categoryId})}
                                                    onDragEnd={() => setDragging(null)}
                                                    onClick={() => setOpenReservation(entry._id)}
                                                    className={cn("absolute top-1 bottom-1 flex items-center gap-1 overflow-hidden rounded-sm px-1.5 text-left text-xs whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ring", STATUS_CLASS[entry.status] ?? "bg-muted")}
                                                    style={position(entry.pickupAt, entry.returnAt)}
                                                    title={`${entry.number} · ${entry.customer} · ${formatTime(entry.pickupAt)} – ${formatTime(entry.returnAt)}${entry.needsTransfer ? ` · ${resolveLanguageKey("needsTransfer")}` : ""}`}
                                                >
                                                    {entry.needsTransfer ? <IconTruckDelivery size={14} aria-label={String(resolveLanguageKey("needsTransfer"))} /> : null}
                                                    <span className="truncate">{entry.customer}</span>
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
            <p className="text-xs text-muted-foreground">{resolveLanguageKey("hint")}</p>
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
