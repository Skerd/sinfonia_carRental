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
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
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
import {NativeSelect} from "@coreModule/components/ui/native-select.tsx";
import type {ApiSelectDatum, SelectResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {
    RentalReportsFormType,
    RentalReportsResponse,
} from "armonia/src/modules/carRental/api/carRental/private/rentalReports/rentalReports.ts";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {Table} from "@coreModule/components/ui/table/table.tsx";

type Report = RentalReportsResponse["data"];

const LOCATIONS_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalLocation/select"};
const REPORT_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalReports"};

function percent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

function ReportsPage({resolveLanguageKey}: WithLanguageType) {
    // This month so far, in the company's calendar (GLB-09).
    const companyZone = useCompanyTimeZone();
    const [from, setFrom] = useState(() => `${companyToday(companyZone).slice(0, 8)}01`);
    const [to, setTo] = useState(() => companyToday(companyZone));
    const [location, setLocation] = useState("");
    const locationsRequest = useHttpRequest<SelectResponse>(LOCATIONS_REQUEST, {page: 1, limit: 100}, 1, true, {
        error: (error) => handleError(error, {context: "RentalReportsLocations"}),
    });
    const locations: ApiSelectDatum[] = locationsRequest.data?.data ?? [];

    const [reportCount, setReportCount] = useState(0);
    const load = useCallback(() => setReportCount((count) => count + 1), []);
    useEffect(() => {
        load();
    }, [from, to, location, load]);
    const reportBody: RentalReportsFormType = {from, to, ...(location ? {location} : {})};
    const reportRequest = useHttpRequest<RentalReportsResponse>(REPORT_REQUEST, reportBody, reportCount, true, {
        error: (error) => handleError(error, {context: "RentalReports"}),
    });
    const report: Report | null = reportRequest.data?.data ?? null;
    const loading = reportRequest.loading || reportCount === 0;

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
    // Every amount with its currency (UX-07); a bare number only before the rental settings name one.
    const money = (amount: number) => (report?.currency ? formatCurrency(amount, report.currency.abbreviation) : String(amount));

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
                    <DateInput
                        valueFormat="YYYY-MM-DD"
                        value={from}
                        onChange={(value) => value && setFrom(value)}
                        clearable={false}
                        className="w-48"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    {resolveLanguageKey("to")}
                    <DateInput
                        valueFormat="YYYY-MM-DD"
                        value={to}
                        onChange={(value) => value && setTo(value)}
                        clearable={false}
                        className="w-48"
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
                        value={money(summary.revenue)}
                        icon={IconCoin}
                        variant="primary"
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("averageDailyRate"))}
                        value={money(summary.averageDailyRate)}
                        icon={IconChartBar}
                    />
                    <KpiCard
                        compact
                        title={String(resolveLanguageKey("revpac"))}
                        value={money(summary.revenuePerAvailableCarDay)}
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
                    {/* Exact cars against classes (D198): bookings that started in the window and what they earned. */}
                    {(report?.bySaleKind ?? []).map((row) => (
                        <KpiCard
                            key={row.kind}
                            compact
                            title={String(resolveLanguageKey(`saleKind.${row.kind}`))}
                            value={money(row.revenue)}
                            subtitle={String(resolveLanguageKey("bookingsCount")).replace("{count}", String(row.bookings))}
                            icon={IconCoin}
                        />
                    ))}
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
                    <Table bare className="w-full text-sm">
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
                                    <td className="py-2 pr-3">{money(row.revenue)}</td>
                                    <td className="py-2 pr-3">
                                        {money(row.maintenanceCost)}
                                    </td>
                                    <td className="py-2 pr-3">
                                        {money(row.repairCost)}
                                    </td>
                                    <td className="py-2 pr-3">
                                        {money(row.insurancePremium)}
                                    </td>
                                    <td className="py-2 pr-3">
                                        {money(row.finesCost)}
                                    </td>
                                    <td className="py-2 pr-3">
                                        {money(row.recovered)}
                                    </td>
                                    <td className="py-2">
                                        {row.payback !== undefined
                                            ? percent(row.payback)
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
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
