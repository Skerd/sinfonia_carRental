import {useCallback, useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {
    IconChartBar,
    IconCoin,
    IconPercentage,
    IconClock,
    IconSearch,
} from "@tabler/icons-react";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {
    DashboardWidgetCard,
    DashboardWidgetEmpty,
} from "@coreModule/components/custom/dashboardWidgetCard.tsx";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@coreModule/components/ui/chart.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {NativeSelect} from "@coreModule/components/ui/native-select.tsx";
import type {ApiSelectDatum, SelectResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {
    RentalReportsFormType,
    RentalReportsResponse,
} from "armonia/src/modules/carRental/api/carRental/private/rentalReports/rentalReports.ts";

type Report = RentalReportsResponse["data"];

function localToday(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

function monthStart(): string {
    const today = localToday();
    return `${today.slice(0, 8)}01`;
}

function percent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

function ReportsPage({resolveLanguageKey}: WithLanguageType) {
    const [from, setFrom] = useState(monthStart);
    const [to, setTo] = useState(localToday);
    const [location, setLocation] = useState("");
    const [locations, setLocations] = useState<ApiSelectDatum[]>([]);
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient
            .post<SelectResponse>(
                "/api/carRental/rentalLocation/select",
                {page: 1, limit: 100},
            )
            .then((res) => {
                setLocations(res.data.data ?? []);
            })
            .catch((error) =>
                handleError(error, {context: "RentalReportsLocations"}),
            );
    }, []);

    const load = useCallback(() => {
        setLoading(true);
        const body: RentalReportsFormType = {
            from,
            to,
            ...(location ? {location} : {}),
        };
        apiClient
            .post<RentalReportsResponse>("/api/carRental/rentalReports", body)
            .then((res) => {
                setReport(res.data.data);
            })
            .catch((error) => handleError(error, {context: "RentalReports"}))
            .finally(() => setLoading(false));
    }, [from, to, location]);

    useEffect(() => {
        load();
    }, [load]);

    const chartConfig = useMemo(
        () =>
            ({
                revenue: {
                    label: String(resolveLanguageKey("revenue")),
                    color: "var(--chart-1)",
                },
            }) satisfies ChartConfig,
        [resolveLanguageKey],
    );
    const chartData = (report?.byVehicle ?? [])
        .filter((row) => row.revenue > 0)
        .map((row) => ({name: row.plate, revenue: row.revenue}));
    const summary = report?.summary;

    return (
        <div className="flex flex-col gap-4 p-4">
            <Header
                title={String(resolveLanguageKey("title"))}
                description={String(resolveLanguageKey("description"))}
                help={readPageHelp(resolveLanguageKey)}
            />
            <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-sm">
                    {resolveLanguageKey("from")}
                    <Input
                        type="date"
                        value={from}
                        onChange={(event) => setFrom(event.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    {resolveLanguageKey("to")}
                    <Input
                        type="date"
                        value={to}
                        onChange={(event) => setTo(event.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    {resolveLanguageKey("location")}
                    <NativeSelect
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                    >
                        <option value="">
                            {resolveLanguageKey("allLocations")}
                        </option>
                        {locations.map((row) => (
                            <option key={row.value} value={row.value}>
                                {row.label}
                            </option>
                        ))}
                    </NativeSelect>
                </label>
                <Button type="button" onClick={load} disabled={loading}>
                    {resolveLanguageKey("refresh")}
                </Button>
            </div>
            {summary ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("utilisation"))}
                        value={percent(summary.utilisation)}
                        icon={IconPercentage}
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("revenue"))}
                        value={summary.revenue}
                        icon={IconCoin}
                        variant="primary"
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("averageDailyRate"))}
                        value={summary.averageDailyRate}
                        icon={IconChartBar}
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("revpac"))}
                        value={summary.revenuePerAvailableCarDay}
                        icon={IconChartBar}
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("leadTime"))}
                        value={summary.leadTimeDays}
                        subtitle={String(resolveLanguageKey("days"))}
                        icon={IconClock}
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("cancellationRate"))}
                        value={percent(summary.cancellationRate)}
                        icon={IconPercentage}
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("noShowRate"))}
                        value={percent(summary.noShowRate)}
                        icon={IconPercentage}
                        variant="warning"
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("lostSearches"))}
                        value={`${summary.unavailableSearches}/${summary.searches}`}
                        icon={IconSearch}
                    />
                </div>
            ) : null}
            <DashboardWidgetCard
                title={String(resolveLanguageKey("revenueByCar"))}
            >
                {chartData.length ? (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-72 w-full"
                    >
                        <BarChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={48}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="revenue"
                                fill="var(--color-revenue)"
                                radius={4}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <DashboardWidgetEmpty
                        message={String(resolveLanguageKey("noRevenue"))}
                    />
                )}
            </DashboardWidgetCard>
            {report ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground">
                                <th className="py-2 pr-3">
                                    {resolveLanguageKey("car")}
                                </th>
                                <th className="py-2 pr-3">
                                    {resolveLanguageKey("utilisation")}
                                </th>
                                <th className="py-2 pr-3">
                                    {resolveLanguageKey("revenue")}
                                </th>
                                <th className="py-2 pr-3">
                                    {resolveLanguageKey("maintenance")}
                                </th>
                                <th className="py-2 pr-3">
                                    {resolveLanguageKey("repairs")}
                                </th>
                                <th className="py-2 pr-3">
                                    {resolveLanguageKey("insurance")}
                                </th>
                                <th className="py-2 pr-3">
                                    {resolveLanguageKey("fines")}
                                </th>
                                <th className="py-2 pr-3">
                                    {resolveLanguageKey("recovered")}
                                </th>
                                <th className="py-2">
                                    {resolveLanguageKey("payback")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.byVehicle.map((row) => (
                                <tr key={row.vehicleId} className="border-t">
                                    <td className="py-2 pr-3">
                                        {row.plate}
                                        <span className="block text-muted-foreground">
                                            {row.categoryName}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-3">
                                        {percent(row.utilisation)}
                                    </td>
                                    <td className="py-2 pr-3">{row.revenue}</td>
                                    <td className="py-2 pr-3">
                                        {row.maintenanceCost}
                                    </td>
                                    <td className="py-2 pr-3">
                                        {row.repairCost}
                                    </td>
                                    <td className="py-2 pr-3">
                                        {row.insurancePremium}
                                    </td>
                                    <td className="py-2 pr-3">
                                        {row.finesCost}
                                    </td>
                                    <td className="py-2 pr-3">
                                        {row.recovered}
                                    </td>
                                    <td className="py-2">
                                        {row.payback !== undefined
                                            ? percent(row.payback)
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage(
        "src/modules/carRental/clients/panel/private/reports/index.tsx",
    ),
    withDebug(true, true, "rentalreservations"),
)(ReportsPage);
