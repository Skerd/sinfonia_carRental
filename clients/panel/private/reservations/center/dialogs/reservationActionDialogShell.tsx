import type {ReactNode} from "react";
import {LoaderCircle} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@coreModule/components/ui/dialog.tsx";

/** The frame every reservation action dialog shares: title, description, fields, cancel/confirm. */
export default function ReservationActionDialogShell({
    title,
    description,
    confirmLabel,
    cancelLabel,
    loading,
    canConfirm = true,
    destructive = false,
    onConfirm,
    onClose,
    children,
}: {
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    loading: boolean;
    canConfirm?: boolean;
    destructive?: boolean;
    onConfirm: () => void;
    onClose: () => void;
    children?: ReactNode;
}) {
    return (
        <Dialog open onOpenChange={(next) => !loading && !next && onClose()}>
            <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children ? <div className="flex flex-col gap-4 px-4">{children}</div> : null}
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
                    <Button type="button" variant={destructive ? "destructive" : "default"} disabled={loading || !canConfirm} onClick={onConfirm}>
                        {loading ? <LoaderCircle className="animate-spin" /> : null}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
