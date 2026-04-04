"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Find, ExpandedCard } from "@/content/finds";
import { FindCard } from "./find-card";
import { X, ExternalLink, FileText } from "lucide-react";

interface FindDetailOverlayProps {
  find: Find;
  allFinds: Find[];
  originRect: DOMRect | null;
  onClose: () => void;
}

// Scattered positions around the center card (px offsets from viewport center)
const CARD_POSITIONS = [
  { x: -340, y: -100 },
  { x: 280, y: -120 },
  { x: -320, y: 200 },
  { x: 300, y: 180 },
  { x: 280, y: 40 },
];

function MiniCard({ card }: { card: ExpandedCard }) {
  if (card.type === "image") {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 dark:backdrop-blur-sm shadow-lg">
          <Image
            src={card.src}
            alt={card.caption}
            width={320}
            height={320}
            unoptimized
            className="w-full h-auto"
          />
        </div>
        <span className="font-mono text-[10px] text-white px-0.5 truncate drop-shadow-md">
          {card.caption}
        </span>
      </div>
    );
  }

  if (card.type === "link") {
    return (
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-1.5 group"
      >
        <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 dark:backdrop-blur-sm shadow-lg p-4 flex flex-col gap-2 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800 transition-colors">
          <ExternalLink className="h-4 w-4 text-neutral-400 dark:text-white/40" />
          <span className="font-mono text-xs text-neutral-700 dark:text-white/80 font-medium">
            {card.title}
          </span>
        </div>
        <span className="font-mono text-[10px] text-white px-0.5 truncate drop-shadow-md">
          {card.caption}
        </span>
      </a>
    );
  }

  // snippet
  return (
    <div className="flex flex-col gap-1.5">
      <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 dark:backdrop-blur-sm shadow-lg p-4 flex flex-col gap-2">
        <FileText className="h-4 w-4 text-neutral-400 dark:text-white/40" />
        <p className="font-mono text-[11px] text-neutral-600 dark:text-white/70 leading-relaxed line-clamp-4">
          {card.text}
        </p>
      </div>
      <span className="font-mono text-[10px] text-white px-0.5 truncate drop-shadow-md">
        {card.caption}
      </span>
    </div>
  );
}

export function FindDetailOverlay({
  find,
  originRect,
  onClose,
}: FindDetailOverlayProps) {
  const [landed, setLanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [cardsRetracted, setCardsRetracted] = useState(false);

  // Scroll lock
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    };
  }, []);

  const handleClose = useCallback(() => {
    if (closing) return;
    const cards = find.expandedCards ?? [];
    if (landed && cards.length > 0) {
      setClosing(true);
      // Wait for subcards to retract, then allow main card to exit
      const retractDuration = cards.length * 60 + 350;
      setTimeout(() => setCardsRetracted(true), retractDuration);
    } else {
      onClose();
    }
  }, [closing, landed, find.expandedCards, onClose]);

  // Once subcards are retracted, trigger the real close
  useEffect(() => {
    if (cardsRetracted) onClose();
  }, [cardsRetracted, onClose]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  // Origin position
  const ox = originRect?.left ?? 0;
  const oy = originRect?.top ?? 0;
  const ow = originRect?.width ?? 300;
  const oh = originRect?.height ?? 400;

  // Target: center of viewport, same width as origin card
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const tx = (vw - ow) / 2;
  const ty = (vh - oh) / 2;

  const cards = find.expandedCards ?? [];

  // Subcards show when landed and not retracting
  const showCards = landed;

  return (
    <div className="fixed inset-0 z-50" style={{ perspective: "1200px" }}>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleClose}
      />

      {/* Close button */}
      <motion.button
        onClick={handleClose}
        className="fixed top-6 right-6 z-[60] p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ delay: closing ? 0 : 0.3 }}
      >
        <X className="h-5 w-5" />
      </motion.button>

      {/* Mini cards */}
      {showCards &&
        cards.map((card, i) => {
          const pos = CARD_POSITIONS[i % CARD_POSITIONS.length];
          const centerX = vw / 2 - (card.type === "image" ? 80 : 70);
          const centerY = vh / 2 - 40;
          return (
            <motion.div
              key={i}
              className="fixed z-[52] cursor-pointer"
              style={{
                width: card.type === "image" ? 160 : 140,
                pointerEvents: closing ? "none" : "auto",
              }}
              whileHover={closing ? {} : { y: -6, scale: 1.05 }}
              initial={{
                left: centerX,
                top: centerY,
                opacity: 0,
                scale: 0.4,
              }}
              animate={
                closing
                  ? {
                      left: centerX,
                      top: centerY,
                      opacity: 0,
                      scale: 0.4,
                      rotate: 0,
                    }
                  : {
                      left: vw / 2 + pos.x,
                      top: vh / 2 + pos.y,
                      opacity: 1,
                      scale: 1,
                      rotate: card.rotate ?? 0,
                    }
              }
              transition={
                closing
                  ? {
                      delay: (cards.length - 1 - i) * 0.06,
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                    }
                  : {
                      default: {
                        delay: i * 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 22,
                      },
                      y: { type: "spring", stiffness: 400, damping: 20, delay: 0 },
                      scale: { type: "spring", stiffness: 400, damping: 20, delay: 0 },
                    }
              }
            >
              <MiniCard card={card} />
            </motion.div>
          );
        })}

      {/* The card — same FindCard, just animated from origin to center */}
      <motion.div
        className="fixed z-[55] pointer-events-none rounded-2xl bg-background"
        style={{ width: ow }}
        initial={{
          left: ox,
          top: oy,
          rotateY: 0,
          rotateX: 0,
        }}
        animate={{
          left: tx,
          top: ty,
          rotateY: 360,
        }}
        exit={{
          left: ox,
          top: oy,
          rotateY: 0,
        }}
        transition={{
          left: { type: "spring", stiffness: 200, damping: 26, mass: 0.8 },
          top: { type: "spring", stiffness: 200, damping: 26, mass: 0.8 },
          rotateY: { type: "tween", duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        }}
        onAnimationComplete={() => setLanded(true)}
      >
        <FindCard find={find} onInspect={() => {}} />
      </motion.div>
    </div>
  );
}
