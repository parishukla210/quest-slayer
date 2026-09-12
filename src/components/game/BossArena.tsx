import { useEffect, useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Skull } from "lucide-react";
import { bossQuery, questsQuery } from "@/lib/queries";
import { BOSS_HURT_LINES, BOSS_TAUNTS_IDLE, BOSS_TAUNTS_OVERDUE, pick } from "@/lib/game";
import bossImg from "@/assets/boss-procrastinator.png";

export interface Hit {
  id: number;
  damage: number;
  crit: boolean;
}

export function BossArena({ hits }: { hits: Hit[] }) {
  const { data: boss } = useSuspenseQuery(bossQuery);
  const { data: quests } = useSuspenseQuery(questsQuery);

  const overdue = useMemo(
    () => quests.filter((q) => !q.completed_at && q.due_at && new Date(q.due_at) < new Date()).length,
    [quests],
  );

  const [taunt, setTaunt] = useState<string>("");
  const [hurt, setHurt] = useState(false);
  const lastHit = hits[hits.length - 1];

  useEffect(() => {
    setTaunt(overdue > 0 ? pick(BOSS_TAUNTS_OVERDUE) : pick(BOSS_TAUNTS_IDLE));
  }, [overdue, boss?.id]);

  useEffect(() => {
    if (!lastHit) return;
    setHurt(true);
    setTaunt(pick(BOSS_HURT_LINES));
    const t = window.setTimeout(() => {
      setHurt(false);
      setTaunt(overdue > 0 ? pick(BOSS_TAUNTS_OVERDUE) : pick(BOSS_TAUNTS_IDLE));
    }, 2600);
    return () => window.clearTimeout(t);
  }, [lastHit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!boss) return null;
  const pct = Math.max(0, (boss.current_hp / boss.max_hp) * 100);
  const hue = ((boss.tier - 1) * 47) % 360;

  return (
    <section className="panel relative overflow-hidden p-5 md:p-6" aria-label="Boss arena">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-hp/20 blur-3xl" />
      <header className="relative flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-hp">
            <Skull className="size-3.5" /> Boss Arena · Tier {boss.tier}
          </p>
          <h2 className="font-display text-2xl font-bold md:text-3xl">{boss.name}</h2>
        </div>
        {overdue > 0 && (
          <span className="rounded-full border border-hp/50 bg-hp/15 px-2.5 py-1 text-xs font-semibold text-hp">
            {overdue} overdue quest{overdue > 1 ? "s" : ""} feeding the boss
          </span>
        )}
      </header>

      <div className="relative mt-4 grid items-center gap-4 md:grid-cols-[1fr_260px]">
        <div className="order-2 md:order-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-hp">HP</span>
            <span className="font-display font-bold">
              {boss.current_hp.toLocaleString()} / {boss.max_hp.toLocaleString()}
            </span>
          </div>
          <div className="mt-1.5 h-5 w-full overflow-hidden rounded-full border border-hp/40 bg-background/60 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-hp via-hp to-vitality shadow-[0_0_14px_var(--hp)] transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="relative mt-4 rounded-xl border border-border bg-background/50 p-3 text-sm italic text-muted-foreground">
            <span className="absolute -top-2 left-4 rounded bg-card px-1.5 text-[10px] font-semibold uppercase not-italic tracking-widest text-hp">
              {hurt ? "boss cries" : "boss taunts"}
            </span>
            "{taunt}"
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Every completed quest strikes for its XP value. Defeat the boss for bonus loot — the next one hits back with more HP.
          </p>
        </div>

        <div className="relative order-1 mx-auto md:order-2">
          <div className={`relative ${hurt ? "animate-shake" : "animate-bob"}`}>
            <img
              src={bossImg}
              alt={boss.name}
              width={1024}
              height={1024}
              className={`w-52 select-none drop-shadow-[0_18px_30px_oklch(0.4_0.2_300/0.6)] md:w-60 ${hurt ? "animate-hit-flash" : ""}`}
              style={{ filter: hue ? `hue-rotate(${hue}deg)` : undefined }}
              draggable={false}
            />
            {hurt && (
              <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-56 animate-slash rounded-full bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_20px_var(--gold)]" />
            )}
          </div>
          {hits.map((h) => (
            <span
              key={h.id}
              className={`pointer-events-none absolute left-1/2 top-8 animate-float-up font-display text-3xl font-black drop-shadow-[0_2px_0_oklch(0_0_0)] ${h.crit ? "text-gold text-4xl" : "text-hp"}`}
            >
              -{h.damage}
              {h.crit ? "!" : ""}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
