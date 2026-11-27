import {useEffect, useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Switch} from "@coreModule/components/ui/switch.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {multiplyMoney} from "armonia/src/modules/core/helpers/money.ts";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {
    CategoryCarPrice,
    CategoryCarPricesResponse,
    VehicleCategory,
} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
import type {SetCarPricesFormType} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.schema-def.ts";

type Props = WithLanguageType &
    WithAxiosType<ActionMessage, SetCarPricesFormType> & {
        open: boolean;
        onClose: () => void;
        entity: VehicleCategory;
    };

/** One editable row: amounts as typed, so an emptied field means "the category's". */
type Row = {car: CategoryCarPrice; listedAlone: boolean; dailyRate: string; depositAmount: string};

const PRICES_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/vehicleCategory/carPrices"};

const toRow = (car: CategoryCarPrice): Row => ({
    car,
    listedAlone: car.listedAlone,
    dailyRate: car.dailyRate === undefined ? "" : String(car.dailyRate),
    depositAmount: car.depositAmount === undefined ? "" : String(car.depositAmount),
});

/** An amount field: empty is "not set", anything else a non-negative number. */
const amount = (value: string): number | undefined | null => {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

/**
 * The category's "Car prices" (D198): which of its cars are rented on their own, and each one's own day price and
 * deposit (empty: the category's), in one table, with a "change every day price by %" helper. Saved in one go.
 */
function CarPricesDialog({open, onClose, entity, resolveLanguageKey, onFilterChange, innerRef, loading, error}: Props) {
    const request = useHttpRequest<CategoryCarPricesResponse>(PRICES_REQUEST, {_id: entity._id}, 1, true, {
        error: (requestError) => handleError(requestError, {context: "CategoryCarPrices"}),
    });
    const data = request.data?.data;
    const [rows, setRows] = useState<Row[]>([]);
    const [percent, setPercent] = useState("");
    useEffect(() => {
        if (data) setRows(data.cars.map(toRow));
    }, [data]);
    useImperativeHandle(innerRef, () => ({success: () => onClose()}));

    const currency = data?.currency?.abbreviation;
    const money = (value: number | undefined) => (value === undefined ? "" : currency ? formatCurrency(value, currency) : String(value));
    // Money inputs name their currency (UX-07).
    const inCurrency = (key: string) => (currency ? `${resolveLanguageKey(key)} (${currency})` : resolveLanguageKey(key));
    const update = (index: number, patch: Partial<Row>) => setRows((all) => all.map((row, i) => (i === index ? {...row, ...patch} : row)));
    const invalid = rows.some((row) => amount(row.dailyRate) === null || amount(row.depositAmount) === null);
    const percentValue = Number(percent);
    const canApplyPercent = percent.trim() !== "" && Number.isFinite(percentValue) && percentValue > -100;

    // Every car gets its own day price: its current one, else the category's, changed by the percentage.
    const applyPercent = () => {
        if (!data || !canApplyPercent) return;
        setRows((all) => all.map((row) => {
            const base = amount(row.dailyRate) ?? data.categoryDailyRate;
            return {...row, dailyRate: String(multiplyMoney(base, 1 + percentValue / 100, data.currency?.decimalPlaces))};
        }));
        setPercent("");
    };

    const save = () => onFilterChange({
        _id: entity._id,
        cars: rows.map((row) => {
            const dailyRate = amount(row.dailyRate);
            const depositAmount = amount(row.depositAmount);
            return {
                vehicle: row.car._id,
                listedAlone: row.listedAlone,
                ...(typeof dailyRate === "number" ? {dailyRate} : {}),
                ...(typeof depositAmount === "number" ? {depositAmount} : {}),
            };
        }),
    });

    return (
        <Dialog open={open} onOpenChange={(next) => !loading && !next && onClose()}>
            <DialogContent className="sm:max-w-3xl" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("title")}</DialogTitle>
                    <DialogDescription>
                        {data ? resolveLanguageKey("description").replace("{price}", money(data.categoryDailyRate)).replace("{deposit}", money(data.categoryDepositAmount) || "—") : null}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 px-4">
                    {request.loading ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("loading")}</p> : null}
                    {data && !rows.length ? <p className="text-sm text-muted-foreground">{resolveLanguageKey("noCars")}</p> : null}
                    {rows.length ? (
                        <>
                            <div className="flex flex-wrap items-end gap-2">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="car-prices-percent">{resolveLanguageKey("percentLabel")}</Label>
                                    <Input
                                        id="car-prices-percent"
                                        type="number"
                                        step="any"
                                        className="w-32"
                                        placeholder={resolveLanguageKey("percentPlaceholder")}
                                        value={percent}
                                        onChange={(event) => setPercent(event.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <Button type="button" variant="outline" onClick={applyPercent} disabled={loading || !canApplyPercent}>
                                    {resolveLanguageKey("applyPercent")}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setRows((all) => all.map((row) => ({...row, listedAlone: true})))} disabled={loading}>
                                    {resolveLanguageKey("listAll")}
                                </Button>
                            </div>
                            <div className="max-h-[50vh] overflow-y-auto rounded-md border">
                                <div className="grid grid-cols-[minmax(0,2fr)_auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-3 gap-y-2 p-3 text-sm">
                                    <span className="font-medium text-muted-foreground">{resolveLanguageKey("car")}</span>
                                    <span className="font-medium text-muted-foreground">{resolveLanguageKey("listedAlone")}</span>
                                    <span className="font-medium text-muted-foreground">{inCurrency("dailyRate")}</span>
                                    <span className="font-medium text-muted-foreground">{inCurrency("depositAmount")}</span>
                                    {rows.map((row, index) => (
                                        <div key={row.car._id} className="contents">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{row.car.title}</p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {[row.car.plate, row.car.year, row.car.hasOtherOwnPrices ? resolveLanguageKey("hasOtherOwnPrices") : null].filter(Boolean).join(" · ")}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={row.listedAlone}
                                                onCheckedChange={(checked) => update(index, {listedAlone: checked})}
                                                disabled={loading}
                                                aria-label={`${resolveLanguageKey("listedAlone")}: ${row.car.title}`}
                                            />
                                            <Input
                                                type="number"
                                                min={0}
                                                step="any"
                                                aria-label={`${inCurrency("dailyRate")}: ${row.car.title}`}
                                                placeholder={money(data?.categoryDailyRate)}
                                                value={row.dailyRate}
                                                onChange={(event) => update(index, {dailyRate: event.target.value})}
                                                disabled={loading}
                                            />
                                            <Input
                                                type="number"
                                                min={0}
                                                step="any"
                                                aria-label={`${inCurrency("depositAmount")}: ${row.car.title}`}
                                                placeholder={money(data?.categoryDepositAmount)}
                                                value={row.depositAmount}
                                                onChange={(event) => update(index, {depositAmount: event.target.value})}
                                                disabled={loading}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{resolveLanguageKey("emptyHint")}</p>
                        </>
                    ) : null}
                    {error?.message ? <p className="text-sm text-destructive">{error.message}</p> : null}
                </div>
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={save} disabled={loading || !rows.length || invalid}>
                        {loading ? resolveLanguageKey("busy") : resolveLanguageKey("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/categories/center/dialogs/carPricesDialog.tsx"),
    withAxios<ActionMessage, SetCarPricesFormType>({url: "/api/carRental/vehicleCategory/setCarPrices", method: "POST", data: {}}, true),
    withDebug(true, true, "vehiclecategories"),
)(CarPricesDialog);
