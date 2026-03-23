"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const TRAIN = `  _ _       __    _ _
 | | |     /  \\  | | |
 |_  _|   | () | |_  _|
  _|_|_   _\\__/   _|_|_
_|"""""|_|"""""|_|"""""|
"\`-0-0-'"\`-0-0-'"\`-0-0-'`;

const SMOKE_FRAMES = [
  ["      ", "      ", "  ()  "],
  ["      ", "  ()  ", " (  ) "],
  ["  ()  ", " (  ) ", "()    "],
  [" (  ) ", "()    ", "      "],
  ["()    ", "      ", "      "],
  ["      ", "      ", "      "],
];

export default function NotFound() {
  const [arrived, setArrived] = useState(false);
  const [smokeFrame, setSmokeFrame] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setArrived(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!arrived) return;
    const timer = setInterval(() => {
      setSmokeFrame((prev) => (prev + 1) % SMOKE_FRAMES.length);
    }, 400);
    return () => clearInterval(timer);
  }, [arrived]);

  return (
    <div className="flex min-h-[calc(100vh-15rem)] flex-col items-center justify-center gap-4">
      <div className="overflow-hidden">
        <div
          className="transition-transform duration-700 ease-out"
          style={{ transform: arrived ? "translateX(0)" : "translateX(100cqw)" }}
        >
          <pre className="font-mono text-sm text-muted-foreground whitespace-pre text-center">
            {arrived
              ? SMOKE_FRAMES[smokeFrame].join("\n") + "\n" + TRAIN
              : TRAIN}
          </pre>
        </div>
      </div>
      <p className="text-muted-foreground">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="font-mono text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Go home
      </Link>
    </div>
  );
}
