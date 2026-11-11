import {useCallback, useEffect, useState} from "react";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {compose} from "redux";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@coreModule/components/ui/select.tsx";
import type {ApiSelectDatum} from "armonia/src/modules/core/types/shared.types.ts";
import type {
    RentalCounterFormType,
    RentalCounterResponse,
} from "armonia/src/modules/carRental/api/carRental/private/rentalCounter/rentalCounter.ts";
import type {RentalReservation} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.dto.ts";
import type {RentalDepositStatus} from "armonia/src/modules/carRental/api/carRental/private/rentalReservation/rentalReservation.constants.ts";
import RentalReservationDialogs from "@carRentalModule/clients/panel/private/reservations/center/dialogs/rentalReservationDialogs.tsx";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import RentalReservationSheetView from "@carRentalModule/clients/panel/private/reservations/center/sheetView/rentalReservationSheetView.tsx";

type Board = RentalCounterResponse["data"];
type CounterAction =
    | "drivers"
    | "takeDeposit"
    | "settleDeposit"
    | "handover"
    | "returnVehicle";
type Column = "pickups" | "returns" | "overdue";

const LOCATIONS_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalLocation/select"};
const COUNTER_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalCounter"};
const COLUMNS: Column[] = ["pickups", "returns", "overdue"];

function driversIncomplete(reservation: RentalReservation) {
    return (
        !reservation.drivers.length ||
        reservation.drivers.some((driver) => !driver.licenseNumber)
    );
}

/** The same gates as the reservation menu, in the order the desk works a car. */
function counterActions(
    reservation: RentalReservation,
    canMove: boolean,
    canTakePayment: boolean,
): CounterAction[] {
    const {status} = reservation;
    const actions: CounterAction[] = [];
    if (
        canMove &&
        (status === "held" ||
            status === "confirmed" ||
            status === "in_progress")
    )
        actions.push("drivers");
    const depositMissing =
        !reservation.deposit || reservation.deposit.status === "failed";
    const depositDue = reservation.pricing.depositAmount > 0;
    if (
        canTakePayment &&
        (status === "confirmed" || status === "in_progress") &&
        depositMissing &&
        depositDue
    )
        actions.push("takeDeposit");
    if (
        canTakePayment &&
        (status === "in_progress" || status === "completed") &&
        reservation.deposit?.status === "held"
    )
        actions.push("settleDeposit");
    if (canMove && status === "confirmed") actions.push("handover");
    if (canMove && status === "in_progress") actions.push("returnVehicle");
    return actions;
}

const TIME: Intl.DateTimeFormatOptions = {hour: "2-digit", minute: "2-digit"};
const DAY_AND_TIME: Intl.DateTimeFormatOptions = {...DATE_FORMATS.mediumDate, ...TIME};

/** The pickup or return time at the branch, in the language picked in the app (GLB-09). */
function formatWhen(iso: string, timezone: string, withDate: boolean) {
    return formatDate(iso, {timeZone: timezone, format: withDate ? DAY_AND_TIME : TIME});
}

type CardProps = {
    reservation: RentalReservation;
    column: Column;
    timezone: string;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    canMove: boolean;
    canTakePayment: boolean;
    onAction: (action: CounterAction, reservation: RentalReservation) => void;
    onOpen: (id: string) => void;
};

function CounterCard({
    reservation,
    column,
    timezone,
    resolveLanguageKey,
    canMove,
    canTakePayment,
    onAction,
    onOpen,
}: CardProps) {
    const when =
        column === "pickups" ? reservation.pickupAt : reservation.returnAt;
    const name =
        `${reservation.contact.firstName} ${reservation.contact.lastName}`.trim();
    const plate = reservation.vehicle?.plate;
    const actions = counterActions(reservation, canMove, canTakePayment);
    const depositStatus: RentalDepositStatus | undefined =
        reservation.deposit?.status;
    const readiness = reservation.vehicle?.readiness;

    return (
        <article
            className={`flex flex-col gap-3 rounded-lg border p-4 ${column === "overdue" ? "border-destructive/40 bg-destructive/5" : "bg-card"}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-lg font-semibold tabular-nums">
                        {formatWhen(
                            when,
                            timezone,
                            column === "overdue",
                        )}
                    </p>
                    <p className="truncate text-base">{name}</p>
                    {reservation.contact.phone ? (
                        <p className="truncate text-sm text-muted-foreground">
                            {reservation.contact.phone}
                        </p>
                    ) : null}
                </div>
                <p className="shrink-0 text-lg font-medium tracking-wide">
                    {plate || resolveLanguageKey("noCar")}
                </p>
            </div>
            <Button
                type="button"
                variant="bare"
                className="w-fit text-sm text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => onOpen(reservation._id)}
            >
                {reservation.number}
            </Button>
            <div className="flex flex-wrap gap-1.5">
                {reservation.needsTransfer ? (
                    <Badge variant="outline">
                        {resolveLanguageKey("needsTransfer")}
                    </Badge>
                ) : null}
                {driversIncomplete(reservation) ? (
                    <Badge variant="destructive">
                        {resolveLanguageKey("driversMissing")}
                    </Badge>
                ) : null}
                {depositStatus ? (
                    <Badge
                        variant={
                            depositStatus === "pending" ||
                            depositStatus === "failed"
                                ? "destructive"
                                : depositStatus === "held"
                                  ? "secondary"
                                  : "outline"
                        }
                    >
                        {resolveLanguageKey(`depositStatus.${depositStatus}`)}
                    </Badge>
                ) : reservation.pricing.depositAmount > 0 ? (
                    <Badge variant="destructive">
                        {resolveLanguageKey("depositMissing")}
                    </Badge>
                ) : null}
                {readiness ? (
                    <Badge
                        variant={
                            readiness === "needs_check"
                                ? "destructive"
                                : readiness === "needs_cleaning"
                                  ? "secondary"
                                  : "outline"
                        }
                    >
                        {resolveLanguageKey(`readiness.${readiness}`)}
                    </Badge>
                ) : null}
            </div>
            {actions.length ? (
                <div className="grid grid-cols-2 gap-2">
                    {actions.map((action, index) => (
                        <Button
                            key={action}
                            type="button"
                            variant={
                                action === "handover" ||
                                action === "returnVehicle"
                                    ? "default"
                                    : "outline"
                            }
                            className={`h-11 ${actions.length % 2 === 1 && index === actions.length - 1 ? "col-span-2" : ""}`}
                            onClick={() => onAction(action, reservation)}
                        >
                            {resolveLanguageKey(action)}
                        </Button>
                    ))}
                </div>
            ) : null}
        </article>
    );
}

/**
 * The desk for one day: who picks up, who brings a car back, and who is late.
 * Each card opens the same booking steps as the reservation menu, then reloads.
 */
function RentalCounterPage({
    resolveLanguageKey,
}: WithLanguageType) {
    const {write} = useAccess("rentalreservations");
    const canMove = !!write?.status;
    const canTakePayment = !!write?.amountPaid;
    // The company's calendar day (GLB-09), not the browser's or UTC.
    const companyZone = useCompanyTimeZone();
    const [date, setDate] = useState(() => companyToday(companyZone));
    const [location, setLocation] = useState("");
    const [search, setSearch] = useState("");
    const [active, setActive] = useState<{
        action: CounterAction;
        reservation: RentalReservation;
    } | null>(null);
    const [openId, setOpenId] = useState<string | null>(null);

    const locationsRequest = useHttpRequest<{data: ApiSelectDatum[]}>(LOCATIONS_REQUEST, {page: 1, limit: 100}, 1);
    const locations: ApiSelectDatum[] = locationsRequest.error ? [] : locationsRequest.data?.data ?? [];

    const [boardCount, setBoardCount] = useState(0);
    const load = useCallback(() => setBoardCount((count) => count + 1), []);
    useEffect(() => {
        load();
    }, [date, location, load]);
    const counterBody: RentalCounterFormType = {date, ...(location ? {location} : {})};
    const boardRequest = useHttpRequest<RentalCounterResponse>(COUNTER_REQUEST, counterBody, boardCount, true, {
        error: (error) => handleError(error, {context: "RentalCounter"}),
    });
    const board: Board | null = boardRequest.data?.data ?? null;
    const loading = boardRequest.loading;

    const needle = search.trim().toLocaleLowerCase();
    const matches = (reservation: RentalReservation) => {
        if (!needle) return true;
        const plate = reservation.vehicle?.plate ?? "";
        // The desk asks for a name as often as for a plate or a booking number.
        const name = `${reservation.contact.firstName} ${reservation.contact.lastName}`;
        return [plate, reservation.number, name].some((text) => text.toLocaleLowerCase().includes(needle));
    };

    return (
        <div className="flex flex-col gap-4">
            <Header
                title={String(resolveLanguageKey("title"))}
                description={String(resolveLanguageKey("description"))}
                help={readPageHelp(resolveLanguageKey)}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex items-center gap-2">
                    <DateInput
                        aria-label={String(resolveLanguageKey("date"))}
                        valueFormat="YYYY-MM-DD"
                        value={date}
                        onChange={(value) => value && setDate(value)}
                        className="w-full sm:w-44"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setDate(companyToday(companyZone))}
                    >
                        {resolveLanguageKey("today")}
                    </Button>
                </div>
                <Select
                    value={location || "all"}
                    onValueChange={(value) =>
                        setLocation(value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger
                        aria-label={String(resolveLanguageKey("location"))}
                        className="w-full sm:w-52"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            {resolveLanguageKey("allLocations")}
                        </SelectItem>
                        {locations.map((entry) => (
                            <SelectItem
                                key={String(entry.value)}
                                value={String(entry.value)}
                            >
                                {entry.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    aria-label={String(resolveLanguageKey("search"))}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={String(
                        resolveLanguageKey("searchPlaceholder"),
                    )}
                    className="w-full sm:w-64"
                />
                {loading ? <Loader /> : null}
            </div>

            {board
                ? COLUMNS.map((column) => {
                      const rows = board[column].filter(matches);
                      return (
                          <section key={column} className="flex flex-col gap-3">
                              <h2
                                  className={`text-sm font-medium ${column === "overdue" ? "text-destructive" : ""}`}
                              >
                                  {resolveLanguageKey(column)} ({rows.length})
                              </h2>
                              {rows.length ? (
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                      {rows.map((reservation) => (
                                          <CounterCard
                                              key={reservation._id}
                                              reservation={reservation}
                                              column={column}
                                              timezone={board.timezone}
                                              resolveLanguageKey={
                                                  resolveLanguageKey
                                              }
                                              canMove={canMove}
                                              canTakePayment={canTakePayment}
                                              onAction={(action, row) =>
                                                  setActive({
                                                      action,
                                                      reservation: row,
                                                  })
                                              }
                                              onOpen={setOpenId}
                                          />
                                      ))}
                                  </div>
                              ) : (
                                  <p className="text-sm text-muted-foreground">
                                      {resolveLanguageKey(
                                          board[column].length
                                              ? "noMatches"
                                              : "empty",
                                      )}
                                  </p>
                              )}
                          </section>
                      );
                  })
                : null}

            {active ? (
                <RentalReservationDialogs
                    action={active.action}
                    reservation={active.reservation}
                    onClose={() => {
                        setActive(null);
                        load();
                    }}
                    onUpdated={(updated) =>
                        setActive((current) =>
                            current ? {...current, reservation: updated} : null,
                        )
                    }
                />
            ) : null}
            {openId ? (
                <RentalReservationSheetView
                    open
                    onOpenChange={(open: boolean) => !open && setOpenId(null)}
                    fetchId={openId}
                    onSheetRowPatched={load}
                />
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage(
        "src/modules/carRental/clients/panel/private/counter/index.tsx",
    ),
    withDebug(true, true, "rentalreservations"),
)(RentalCounterPage);
