"use client";


export function Footer({ light = false }: { light?: boolean }) {
  return (
    <footer className="relative">
      <div className="relative z-10 py-8">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className={`flex flex-col items-center justify-between gap-4 text-sm sm:flex-row ${light ? "text-white/60" : "text-foreground/80"}`}>
            <div className={`flex items-center gap-2 ${light ? "text-white/80" : ""}`}>
              <span>© {new Date().getFullYear()} Khaled Ashraf</span>
              <span className="text-foreground/40 dark:text-white/40">·</span>
              <a href="/privacy" className={`transition-colors ${light ? "text-white/40 hover:text-white/60" : "text-foreground/40 hover:text-foreground/60"}`}>Privacy</a>
            </div>
            <div className="flex gap-4">
              <a
                href="https://github.com/khaaledashraaf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => window.gtag?.("event", "outbound_click", { link: "github" })}
                className={`transition-colors ${light ? "hover:text-white" : "hover:text-foreground"}`}
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/khaledaelmaleh/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => window.gtag?.("event", "outbound_click", { link: "linkedin" })}
                className={`transition-colors ${light ? "hover:text-white" : "hover:text-foreground"}`}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
