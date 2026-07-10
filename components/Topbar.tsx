"use client";

import { useEffect, useState } from "react";

export function Topbar({ userName }: { userName: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-void-950/70 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aria-cyan opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-aria-cyan" />
        </span>
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">Systeme operationnel</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden font-mono text-xs text-slate-500 sm:inline">
          {now
            ? now.toLocaleString("fr-FR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : ""}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300">
          {userName.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
