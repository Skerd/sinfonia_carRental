import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {RentalQuote} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";
import {useRentalConfig} from "./rentalConfigContext.tsx";

type Props = WithLanguageType & {pricing: RentalQuote};

/** Price lines, VAT, total and deposit — the same breakdown before and after booking. */
function RentalPriceSummary({pricing, resolveLanguageKey}: Props) {
    const {formatMoney} = useRentalConfig();
    // Day rates that differ (weekend, season) come as separate lines with the same label; their unit price tells them apart.
    const labelCount = new Map<string, number>();
    for (const line of pricing.lines) labelCount.set(line.label, (labelCount.get(line.label) ?? 0) + 1);
    return (
        <dl className="flex flex-col gap-2 text-sm">
            {pricing.lines.map((line, index) => (
                <div key={`${line.kind}-${index}`} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                        {line.label}
                        {line.quantity > 1 || (labelCount.get(line.label) ?? 0) > 1
                            ? ` · ${line.quantity} × ${formatMoney(line.unitPrice)}`
                            : ""}
                    </dt>
                    <dd>{formatMoney(line.total)}</dd>
                </div>
            ))}
            {pricing.vatRate > 0 ? (
                <div className="flex justify-between gap-4 text-muted-foreground">
                    <dt>{resolveLanguageKey(pricing.pricesIncludeVat ? "vatIncluded" : "vat")} ({pricing.vatRate}%)</dt>
                    <dd>{formatMoney(pricing.vatAmount)}</dd>
                </div>
            ) : null}
            <div className="mt-1 flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold">
                <dt>{resolveLanguageKey("total")}</dt>
                <dd>{formatMoney(pricing.grandTotal)}</dd>
            </div>
            {pricing.depositAmount > 0 ? (
                <div className="flex justify-between gap-4 text-muted-foreground">
                    <dt>{resolveLanguageKey("deposit")}</dt>
                    <dd>{formatMoney(pricing.depositAmount)}</dd>
                </div>
            ) : null}
        </dl>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/shared/rentalPriceSummary.tsx"))(RentalPriceSummary);
