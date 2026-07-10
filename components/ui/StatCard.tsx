export function StatCard({
  label,
  value,
  hint,
  accent = "cyan",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "cyan" | "violet" | "amber" | "rose" | "blue";
}) {
  const accents: Record<string, string> = {
    cyan: "text-aria-cyan border-aria-cyan/20",
    violet: "text-aria-violet border-aria-violet/20",
    amber: "text-aria-amber border-aria-amber/20",
    rose: "text-aria-rose border-aria-rose/20",
    blue: "text-aria-blue border-aria-blue/20",
  };
  return (
    <div className="panel p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold ${accents[accent].split(" ")[0]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
