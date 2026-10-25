import {useEffect, useRef, useState} from "react";
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
import type {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
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
            <button
                type="button"
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <IconGripVertical size={18} />
            </button>
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
    const resolveLanguageKeyRef = useRef(resolveLanguageKey);
    resolveLanguageKeyRef.current = resolveLanguageKey;
    const [extras, setExtras] = useState<RentalExtra[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setLoading(true);
        void (async () => {
            try {
                const loaded: RentalExtra[] = [];
                let offset = 0;
                let total = 0;
                do {
                    const res = await apiClient.post<TableResponse<RentalExtra>>("/api/carRental/rentalExtra", {
                        offset,
                        limit: LIST_PAGE_SIZE,
                        sortBy: "sortOrder",
                        sortOrder: "asc",
                    });
                    const page = res.data.data;
                    total = res.data.total;
                    loaded.push(...page);
                    offset += page.length;
                    if (page.length === 0) break;
                } while (offset < total);
                if (!cancelled) setExtras(loaded);
            } catch {
                if (!cancelled) {
                    toast.error(String(resolveLanguageKeyRef.current("loadError") ?? "Failed to load extras."));
                    setExtras([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open]);

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;
        setExtras((items) => {
            const oldIndex = items.findIndex((extra) => extra._id === active.id);
            const newIndex = items.findIndex((extra) => extra._id === over.id);
            if (oldIndex < 0 || newIndex < 0) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.post("/api/carRental/rentalExtra/reorder", {
                orderedIds: extras.map((extra) => extra._id),
            });
            toast.success(rk("saveSuccess"));
            onSuccess?.();
            onOpenChange(false);
        } catch {
            toast.error(rk("saveError"));
        } finally {
            setSaving(false);
        }
    };

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
                    <Button type="button" onClick={() => void handleSave()} disabled={saving || loading || extras.length === 0}>
                        {saving ? rk("saving") : rk("save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
