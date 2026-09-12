import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery } from "@/lib/queries";
import { levelProgress, STATS, titleForLevel } from "@/lib/game";
import { cn } from "@/lib/utils";
import { HeroAvatar } from "./HeroAvatar";
import { useEquipped } from "./GameShell";

const STAT_BAR: Record<string, string> = {
  intellect: "bg-intellect",
  wisdom: "bg-wisdom",
  mind: "bg-mind",
  vitality: "bg-vitality",
  creativity: "bg-creativity",
  charisma: "bg-charisma",
};

export function StatSheet({ compact = false }: { compact?: boolean }) {
  const { data: p } = useSuspenseQuery(profileQuery);
  const equipped = useEquipped();
  const lp = levelProgress(p.xp);
  const maxStat = Math.max(50, ...STATS.map((s) => p[s.key]));

  return (
    <section className={cn("panel p-5", compact ? "" : "md:p-8")} aria-label="Character sheet">
      <div className={cn("flex gap-5", compact ? "items-center" : "flex-col items-center text-center md:flex-row md:text-left")}>
        <HeroAvatar equipped={equipped} level={lp.level} size={compact ? "sm" : "lg"} className={compact ? "" : "mb-2"} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {titleForLevel(lp.level)}
          </p>
          <h2 className={cn("truncate font-display font-bold", compact ? "text-lg" : "text-2xl md:text-3xl")}>
            {p.display_name}
            {equipped.has("special_badge") && <span className="ml-2 text-base">🏅</span>}
          </h2>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Level <span className="font-bold text-foreground">{lp.level}</span>
              </span>
              <span>
                {lp.current} / {lp.need} XP to LV {lp.level + 1}
              </span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-xp/70 to-xp transition-all duration-700"
                style={{ width: `${lp.pct}%` }}
              />
            </div>
          </div>
          {!compact && (
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground md:justify-start">
              <span>
                <b className="text-foreground">{p.xp.toLocaleString()}</b> total XP
              </span>
              <span>
                <b className="text-foreground">{p.quests_completed}</b> quests done
              </span>
              <span>
                <b className="text-foreground">{p.bosses_defeated}</b> bosses slain
              </span>
            </div>
          )}
        </div>
      </div>

      <ul className={cn("mt-5 grid gap-3", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
        {STATS.map((s) => {
          const val = p[s.key];
          return (
            <li key={s.key} className="rounded-lg bg-background/40 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span aria-hidden>{s.icon}</span> {s.label}
                </span>
                <span className="font-display font-bold">{val}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", STAT_BAR[s.key])}
                  style={{ width: `${Math.min(100, (val / maxStat) * 100)}%` }}
                />
              </div>
              {!compact && <p className="mt-1 text-[11px] text-muted-foreground">{s.blurb}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
