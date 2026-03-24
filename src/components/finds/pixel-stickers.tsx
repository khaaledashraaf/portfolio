import Image from "next/image";

const stickers = {
  star: { src: "/svg/star.svg", alt: "Star" },
  heart: { src: "/svg/heart.svg", alt: "Heart" },
  "thumbs-up": { src: "/svg/thumbs up.svg", alt: "Thumbs up" },
} as const;

const stickerKeys = Object.keys(stickers) as (keyof typeof stickers)[];

export function FeaturedSticker({ findId, stickerType }: { findId: string; stickerType?: keyof typeof stickers }) {
  const key =
    stickerType ??
    stickerKeys[
      findId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
      stickerKeys.length
    ];
  const sticker = stickers[key];

  // Deterministic rotation
  const index = stickerKeys.indexOf(key);
  const rotation = ((index * 17 + 7) % 25) - 12;

  return (
    <div
      className="absolute top-2 right-2 z-10 animate-wobble"
      style={{ "--wobble-angle": `${rotation}deg` } as React.CSSProperties}
    >
      <Image
        src={sticker.src}
        alt={sticker.alt}
        width={28}
        height={28}
        className="w-auto h-auto pointer-events-none [filter:drop-shadow(1.25px_0_0_white)_drop-shadow(-1.25px_0_0_white)_drop-shadow(0_1.25px_0_white)_drop-shadow(0_-1.25px_0_white)_drop-shadow(1.25px_1.25px_0_white)_drop-shadow(-1.25px_1.25px_0_white)_drop-shadow(1.25px_-1.25px_0_white)_drop-shadow(-1.25px_-1.25px_0_white)_drop-shadow(0_1px_2px_rgba(0,0,0,0.15))]"
      />
    </div>
  );
}
