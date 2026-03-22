"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const STAR_CHARS = ["*", ".", "+", "·"];
function generateLoadingStars(count: number) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    char: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
    delay: Math.random() * 3,
  }));
}

const LoadingContext = createContext(true);

/** Returns true once the loading screen has fully faded out */
export function useLoadingDone() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const stars = useMemo(() => generateLoadingStars(15), []);
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const { resolvedTheme } = useTheme();

  useLayoutEffect(() => {
    if (resolvedTheme) setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    const start = Date.now();

    function dismiss() {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 2000 - elapsed);
      setTimeout(() => {
        setVisible(false);
      }, remaining);
    }

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss);
      return () => window.removeEventListener("load", dismiss);
    }
  }, []);

  const onExitComplete = useCallback(() => {
    setDone(true);
  }, []);

  return (
    <LoadingContext.Provider value={done}>
      <AnimatePresence onExitComplete={onExitComplete}>
        {visible && (
          <motion.div
            key="loading-screen"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-background"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {isDark === null ? null : isDark ? (
              <div className="relative w-40 h-40 flex items-center justify-center">
                {stars.map((star, i) => (
                  <span
                    key={i}
                    className="absolute font-mono text-foreground/30 animate-twinkle"
                    style={{
                      left: `${star.x}%`,
                      top: `${star.y}%`,
                      animationDelay: `${star.delay}s`,
                    }}
                  >
                    {star.char}
                  </span>
                ))}
                <Image
                  src="/moon.png"
                  alt=""
                  width={96}
                  height={96}
                  className="w-16 h-16 object-contain"
                  priority
                />
              </div>
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Image
                  src="/sun.png"
                  alt=""
                  width={120}
                  height={120}
                  className="w-20 h-20 object-contain"
                  priority
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </LoadingContext.Provider>
  );
}
