"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { AsciiBackground } from "./ascii-background";
import { Footer } from "./footer";
import { LyingCharacter } from "./lying-character";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAbout = pathname === "/about";
  const isFinds = pathname.startsWith("/finds");
  const showFooterExtras = !isAbout && !isFinds;
  const isProjects = pathname === "/projects";

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {!isAbout && <AsciiBackground />}
      <main
        className="relative z-10 mx-auto flex-1 flex flex-col w-full max-w-4xl px-6 bg-transparent"
      >
        {children}
      </main>
      <div className="relative">
        {showFooterExtras && <LyingCharacter className={isProjects ? "hidden sm:flex" : ""} />}
        {isFinds && (
          <div className="flex justify-center sm:absolute sm:bottom-0 sm:left-1/2 sm:-translate-x-1/2">
            <Image
              src="/me_fascinated.png"
              alt=""
              width={220}
              height={220}
              className="opacity-80 dark:invert"
            />
          </div>
        )}
        <Footer light={isAbout} showAscii={showFooterExtras} />
      </div>
    </div>
  );
}
