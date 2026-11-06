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
import type {VehicleCategory} from "armonia/src/modules/carRental/api/carRental/private/vehicleCategory/vehicleCategory.dto.ts";
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

type ReorderVehicleCategoriesModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: () => void;
};

const LIST_PAGE_SIZE = 200;
const LIST_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/vehicleCategory"};
const LIST_BODY = {sortBy: "sortOrder", sortOrder: "asc"};
const REORDER_REQUEST: HttpRequest = {method: "POST", url: "/api/carRental/vehicleCategory/reorder"};

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
    /** The dragged order; null until the user moves something, so the loaded order shows. */
    const [ordered, setOrdered] = useState<VehicleCategory[] | null>(null);

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
    const all = useAllPages<VehicleCategory>(LIST_REQUEST, LIST_BODY, loadCount, {pageSize: LIST_PAGE_SIZE});
    useEffect(() => {
        if (all.error) toast.error(String(resolveLanguageKey("loadError") ?? "Failed to load categories."));
    }, [all.error]);
    const categories = ordered ?? all.rows;
    const loading = all.loading;

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;
        setOrdered((current) => {
            const items = current ?? categories;
            const oldIndex = items.findIndex((category) => category._id === active.id);
            const newIndex = items.findIndex((category) => category._id === over.id);
            if (oldIndex < 0 || newIndex < 0) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const [saveCount, setSaveCount] = useState(0);
    const {loading: saving} = useHttpRequest(REORDER_REQUEST, {orderedIds: categories.map((category) => category._id)}, saveCount, true, {
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
                    <Button type="button" onClick={handleSave} disabled={saving || loading || categories.length === 0}>
                        {saving ? rk("saving") : rk("save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
