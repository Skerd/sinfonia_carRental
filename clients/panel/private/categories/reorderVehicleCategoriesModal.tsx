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
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
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

type ReorderVehicleCategoriesModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: () => void;
};

const LIST_PAGE_SIZE = 200;

function SortableCategoryRow({category, index}: {category: VehicleCategory; index: number}) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: category._id});

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
                <p className="truncate text-sm font-medium">{category.name}</p>
                <p className="truncate text-xs text-muted-foreground">{category.slug}</p>
            </div>
            <span className="text-xs text-muted-foreground">#{index}</span>
        </div>
    );
}

export default function ReorderVehicleCategoriesModal({
    open,
    onOpenChange,
    resolveLanguageKey,
    onSuccess,
}: ReorderVehicleCategoriesModalProps) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const resolveLanguageKeyRef = useRef(resolveLanguageKey);
    resolveLanguageKeyRef.current = resolveLanguageKey;
    const [categories, setCategories] = useState<VehicleCategory[]>([]);
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
                const loaded: VehicleCategory[] = [];
                let offset = 0;
                let total = 0;
                do {
                    const res = await apiClient.post<TableResponse<VehicleCategory>>("/api/carRental/vehicleCategory", {
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
                if (!cancelled) setCategories(loaded);
            } catch {
                if (!cancelled) {
                    toast.error(String(resolveLanguageKeyRef.current("loadError") ?? "Failed to load categories."));
                    setCategories([]);
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
        setCategories((items) => {
            const oldIndex = items.findIndex((category) => category._id === active.id);
            const newIndex = items.findIndex((category) => category._id === over.id);
            if (oldIndex < 0 || newIndex < 0) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.post("/api/carRental/vehicleCategory/reorder", {
                orderedIds: categories.map((category) => category._id),
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
                ) : categories.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">{rk("empty")}</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={categories.map((category) => category._id)} strategy={verticalListSortingStrategy}>
                            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto py-1">
                                {categories.map((category, index) => (
                                    <SortableCategoryRow key={category._id} category={category} index={index} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        {rk("cancel")}
                    </Button>
                    <Button type="button" onClick={() => void handleSave()} disabled={saving || loading || categories.length === 0}>
                        {saving ? rk("saving") : rk("save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
