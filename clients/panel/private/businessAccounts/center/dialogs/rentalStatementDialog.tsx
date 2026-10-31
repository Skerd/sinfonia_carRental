import {useState} from "react";
import {compose} from "redux";
import {LoaderCircle} from "lucide-react";
import withLanguage, {
    WithLanguageType,
} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {RentalBusinessAccount} from "armonia/src/modules/carRental/api/carRental/private/rentalBusinessAccount/rentalBusinessAccount.dto.ts";

type Props = WithLanguageType & {
    account: Pick<RentalBusinessAccount, "_id" | "name">;
    onClose: () => void;
};

function thisMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Month picker for one account. The list already says which account this is. */
function RentalStatementDialog({account, onClose, resolveLanguageKey}: Props) {
    const [month, setMonth] = useState(thisMonth);
    const [loading, setLoading] = useState(false);

    const download = () => {
        setLoading(true);
        apiClient
            .post(
                "/api/carRental/rentalStatement",
                {businessAccount: account._id, month},
                {responseType: "blob"},
            )
            .then((res) => {
                const href = URL.createObjectURL(res.data);
                const link = document.createElement("a");
                link.href = href;
                link.download = `statement-${month}.pdf`;
                link.click();
                setTimeout(() => URL.revokeObjectURL(href), 60_000);
                onClose();
            })
            .catch((error) =>
                handleError(error, {
                    context: "RentalStatement",
                    showToast: true,
                }),
            )
            .finally(() => setLoading(false));
    };

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
                    <Input
                        id="rental-statement-month"
                        type="month"
                        value={month}
                        onChange={(event) => setMonth(event.target.value)}
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
                            <LoaderCircle className="animate-spin" />
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
    withDebug(true, true, "rentalbusinessaccounts"),
)(RentalStatementDialog);
