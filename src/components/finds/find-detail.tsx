"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Find } from "@/content/finds";
import { FindCard } from "./find-card";
import { X } from "lucide-react";

interface FindDetailOverlayProps {
  find: Find;
  allFinds: Find[];
  originRect: DOMRect | null;
  onClose: () => void;
}

export function FindDetailOverlay({
  find,
  originRect,
  onClose,
}: FindDetailOverlayProps) {
  const [landed, setLanded] = useState(false);

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

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

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

  return (
    <div className="fixed inset-0 z-50" style={{ perspective: "1200px" }}>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      {/* Close button */}
      <motion.button
        onClick={onClose}
        className="fixed top-6 right-6 z-[60] p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <X className="h-5 w-5" />
      </motion.button>

      {/* The card — same FindCard, just animated from origin to center */}
      <motion.div
        className="fixed z-[55] pointer-events-none"
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
