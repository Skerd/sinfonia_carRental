import {useEffect, useState} from "react";
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import type {RentalExtra} from "armonia/src/modules/carRental/api/carRental/private/rentalExtra/rentalExtra.dto.ts";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import useAllPages from "@coreModule/helpers/hooks/useAllPages.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {IconGripVertical} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import {toast} from "sonner";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

type ReorderRentalExtrasModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: () => void;
};

const LIST_PAGE_SIZE = 200;
const LIST_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalExtra"};
const LIST_BODY = {sortBy: "sortOrder", sortOrder: "asc"};
const REORDER_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/rentalExtra/reorder"};

function SortableExtraRow({extra, index}: {extra: RentalExtra; index: number}) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: extra._id});

    return (
        <div
            ref={setNodeRef}
            style={{transform: CSS.Transform.toString(transform), transition}}
            className={cn(
                "flex items-center gap-3 rounded-md border bg-background px-3 py-2",
                isDragging && "opacity-60 shadow-md",
            )}
        >
            <Button
                type="button"
                variant="bare"
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <IconGripVertical size={18} />
            </Button>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{extra.name}</p>
                <p className="truncate text-xs text-muted-foreground">{extra.price}</p>
            </div>
            <span className="text-xs text-muted-foreground">#{index}</span>
        </div>
    );
}

export default function ReorderRentalExtrasModal({
    open,
    onOpenChange,
    resolveLanguageKey,
    onSuccess,
}: ReorderRentalExtrasModalProps) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    /** The dragged order; null until the user moves something, so the loaded order shows. */
    const [ordered, setOrdered] = useState<RentalExtra[] | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const [loadCount, setLoadCount] = useState(0);
    useEffect(() => {
        if (!open) return;
        setOrdered(null);
        setLoadCount((count) => count + 1);
    }, [open]);
    const all = useAllPages<RentalExtra>(LIST_REQUEST, LIST_BODY, loadCount, {pageSize: LIST_PAGE_SIZE});
    useEffect(() => {
        if (all.error) toast.error(String(resolveLanguageKey("loadError") ?? "Failed to load extras."));
    }, [all.error]);
    const extras = ordered ?? all.rows;
    const loading = all.loading;

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;
        setOrdered((current) => {
            const items = current ?? extras;
            const oldIndex = items.findIndex((extra) => extra._id === active.id);
            const newIndex = items.findIndex((extra) => extra._id === over.id);
            if (oldIndex < 0 || newIndex < 0) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const [saveCount, setSaveCount] = useState(0);
    const {loading: saving} = useHttpRequest(REORDER_REQUEST, {orderedIds: extras.map((extra) => extra._id)}, saveCount, true, {
        success: () => {
            toast.success(rk("saveSuccess"));
            onSuccess?.();
            onOpenChange(false);
        },
        error: () => toast.error(rk("saveError")),
    });
    const handleSave = () => setSaveCount((count) => count + 1);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{rk("reorderTitle")}</DialogTitle>
                    <DialogDescription>{rk("reorderDescription")}</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <Loader />
                ) : extras.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">{rk("empty")}</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={extras.map((extra) => extra._id)} strategy={verticalListSortingStrategy}>
                            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto py-1">
                                {extras.map((extra, index) => (
                                    <SortableExtraRow key={extra._id} extra={extra} index={index} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        {rk("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={saving || loading || extras.length === 0}>
                        {saving ? rk("saving") : rk("save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
