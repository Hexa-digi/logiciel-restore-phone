"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: "◈" },
  { href: "/clients", label: "Clients", icon: "◉" },
  { href: "/devis", label: "Devis", icon: "▤" },
  { href: "/taches", label: "Taches", icon: "☑" },
  { href: "/rdv", label: "Rendez-vous", icon: "◷" },
  { href: "/prospection", label: "Prospection", icon: "◎" },
  { href: "/emails", label: "Emails", icon: "✉" },
  { href: "/assistant", label: "Assistant IA", icon: "✦" },
  { href: "/actus", label: "Veille & Actus", icon: "◍" },
  { href: "/parametres", label: "Parametres", icon: "⚙" },
];

export function Sidebar({ companyName }: { companyName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-void-950/60 backdrop-blur-xl md:flex">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-aria-cyan/30 bg-aria-cyan/10 font-bold text-aria-cyan shadow-glow">
          N
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-wide text-slate-100">NEXUS</p>
          <p className="text-xs text-slate-500">{companyName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <form action={logoutAction}>
          <button type="submit" className="nav-link w-full text-left text-slate-500 hover:text-aria-rose">
            <span className="w-5 text-center text-base">⏻</span>
            Deconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.slice(0, 5);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-void-950/90 py-2 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium ${
              active ? "text-aria-cyan" : "text-slate-500"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label.split(" ")[0]}
          </Link>
        );
      })}
    </nav>
  );
}
