import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {IconLoader2} from "@tabler/icons-react";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import type {RentalBusinessAccount} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.dto.ts";

type StatementRequest = {businessAccount: string; month: string};

type Props = WithLanguageType & WithAxiosType<Blob, StatementRequest> & {
    account: Pick<RentalBusinessAccount, "_id" | "name">;
    onClose: () => void;
};

/** Month picker for one account. The list already says which account this is. */
function RentalStatementDialog({account, onClose, resolveLanguageKey, onFilterChange, innerRef, loading}: Props) {
    // The company's current month (GLB-09).
    const companyZone = useCompanyTimeZone();
    const [month, setMonth] = useState(() => companyToday(companyZone).slice(0, 7));
    useImperativeHandle(innerRef, () => ({
        success: (pdf) => {
            const href = URL.createObjectURL(pdf);
            const link = document.createElement("a");
            link.href = href;
            link.download = `statement-${month}.pdf`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(href), 60_000);
            onClose();
        },
        error: (error) => handleError(error, {context: "RentalStatement", showToast: true}),
    }));

    const download = () => onFilterChange({businessAccount: account._id, month});

    return (
        <Dialog open onOpenChange={(next) => !loading && !next && onClose()}>
            <DialogContent
                className="sm:max-w-md"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("title")}</DialogTitle>
                    <DialogDescription>
                        {account.name}. {resolveLanguageKey("description")}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 px-4">
                    <Label htmlFor="rental-statement-month">
                        {resolveLanguageKey("month")}
                    </Label>
                    {/* Any day picks its month; the field reads as the month (UX-08). */}
                    <DateInput
                        id="rental-statement-month"
                        valueFormat="YYYY-MM"
                        displayFormat="MMMM YYYY"
                        value={month}
                        onChange={(value) => value && setMonth(value)}
                        clearable={false}
                        disabled={loading}
                    />
                </div>
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button
                        type="button"
                        disabled={loading || !month}
                        onClick={download}
                    >
                        {loading ? (
                            <IconLoader2 className="animate-spin" />
                        ) : null}
                        {resolveLanguageKey("download")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage(
        "src/modules/carRental/clients/panel/private/businessAccounts/center/dialogs/rentalStatementDialog.tsx",
    ),
    withAxios<Blob, StatementRequest>({method: "POST", url: "/api/carRental/rentalStatement", data: {}, responseType: "blob"}, true),
    withDebug(true, true, "rentalbusinessaccounts"),
)(RentalStatementDialog);
