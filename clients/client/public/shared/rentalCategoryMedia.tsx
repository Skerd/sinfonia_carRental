import {useRef, useState} from "react";
import {compose} from "redux";
import {IconChevronLeft, IconChevronRight, IconPhoto, IconPlayerPlayFilled, IconX} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {RentalStorefrontCategory} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";

type Props = WithLanguageType & {
    category: Pick<RentalStorefrontCategory, "name" | "images" | "videos">;
    /** Sizing of the cover (the photo shown in the card). */
    coverClassName: string;
};

type Item = {kind: "image" | "video"; src: string};

const ROUND_BUTTON =
    "inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-rent-ink shadow transition-colors hover:bg-white disabled:opacity-40";

/**
 * A category's cover photo, plus a native dialog that steps through all its photos and
 * videos. Whether an item is a video comes from the array it is in: media URLs carry
 * no file extension.
 */
function RentalCategoryMedia({category, coverClassName, resolveLanguageKey}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [index, setIndex] = useState(0);
    // The stage unmounts on close so a playing video stops with it.
    const [isOpen, setIsOpen] = useState(false);
    const items: Item[] = [...category.images.map((src) => ({kind: "image" as const, src})), ...category.videos.map((src) => ({kind: "video" as const, src}))];

    if (items.length === 0) {
        return <div className={`${coverClassName} bg-rent-surface`} aria-hidden />;
    }

    const open = (at: number) => {
        setIndex(at);
        setIsOpen(true);
        dialogRef.current?.showModal();
    };
    const current = items[index] ?? items[0];
    const count = String(resolveLanguageKey(category.images.length === 1 ? "photoCount" : "photosCount")).replace("{count}", String(category.images.length));
    const label = [category.images.length ? count : null, category.videos.length ? resolveLanguageKey("video") : null].filter(Boolean).join(" · ");
    const cover = items[0];

    return (
        <>
            <button
                type="button"
                onClick={() => open(0)}
                className={`group relative block overflow-hidden ${coverClassName}`}
                aria-label={String(resolveLanguageKey("openGallery")).replace("{name}", category.name)}
            >
                {cover.kind === "image" ? (
                    <img src={cover.src} alt={category.name} className="size-full object-cover transition-transform group-hover:scale-[1.02]" loading="lazy" />
                ) : (
                    <video src={cover.src} className="size-full object-cover" muted playsInline preload="metadata" />
                )}
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                    {category.videos.length ? <IconPlayerPlayFilled size={12} aria-hidden /> : <IconPhoto size={13} aria-hidden />}
                    {label}
                </span>
            </button>

            <dialog
                ref={dialogRef}
                className="m-auto w-[min(960px,calc(100vw-2rem))] rounded-2xl bg-rent-ink p-0 text-white backdrop:bg-black/75"
                aria-label={category.name}
                onClick={(e) => {
                    if (e.target === dialogRef.current) dialogRef.current.close();
                }}
                onClose={() => setIsOpen(false)}
            >
                {isOpen ? (
                    <>
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                            <p className="truncate font-semibold">{category.name}</p>
                            <p className="text-sm text-white/70 tabular-nums">
                                {index + 1} / {items.length}
                            </p>
                            <button
                                type="button"
                                onClick={() => dialogRef.current?.close()}
                                className={ROUND_BUTTON}
                                aria-label={String(resolveLanguageKey("close"))}
                            >
                                <IconX size={18} aria-hidden />
                            </button>
                        </div>
                        <div className="relative flex aspect-[16/10] items-center justify-center bg-black">
                            {current.kind === "image" ? (
                                <img src={current.src} alt={category.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                // Keyed so switching clips restarts the player instead of reusing the old source.
                                <video key={current.src} src={current.src} className="max-h-full max-w-full" controls playsInline preload="metadata" />
                            )}
                            {items.length > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIndex((index - 1 + items.length) % items.length)}
                                        className={`${ROUND_BUTTON} absolute left-3 top-1/2 -translate-y-1/2`}
                                        aria-label={String(resolveLanguageKey("previous"))}
                                    >
                                        <IconChevronLeft size={20} aria-hidden />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIndex((index + 1) % items.length)}
                                        className={`${ROUND_BUTTON} absolute right-3 top-1/2 -translate-y-1/2`}
                                        aria-label={String(resolveLanguageKey("next"))}
                                    >
                                        <IconChevronRight size={20} aria-hidden />
                                    </button>
                                </>
                            ) : null}
                        </div>
                        {items.length > 1 ? (
                            <ul className="flex gap-2 overflow-x-auto p-3">
                                {items.map((item, at) => (
                                    <li key={item.src} className="shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setIndex(at)}
                                            aria-current={at === index}
                                            className={`relative block h-14 w-20 overflow-hidden rounded-md border-2 ${at === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`}
                                            aria-label={`${at + 1} / ${items.length}`}
                                        >
                                            {item.kind === "image" ? (
                                                <img src={item.src} alt="" className="size-full object-cover" loading="lazy" />
                                            ) : (
                                                <span className="flex size-full items-center justify-center bg-white/10">
                                                    <IconPlayerPlayFilled size={18} aria-hidden />
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </>
                ) : null}
            </dialog>
        </>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/shared/rentalCategoryMedia.tsx"))(RentalCategoryMedia);
