import { useMemo } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Flame, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { questLogQuery, streakRewardsQuery } from "@/lib/queries";
import { GAME_KEYS } from "@/lib/queries";
import { localTimeZone, MOTIVATION, pick, toLocalISODate, weekStartISO } from "@/lib/game";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function StreakTracker() {
  const { data: log } = useSuspenseQuery(questLogQuery);
  const { data: claimed } = useSuspenseQuery(streakRewardsQuery);
  const qc = useQueryClient();

  const { days, doneCount, todayIdx, weekStart, isWeekend, streakRun } = useMemo(() => {
    const now = new Date();
    const weekStart = weekStartISO(now);
    const monday = new Date(`${weekStart}T00:00:00`);
    const doneDates = new Set(log.map((l) => toLocalISODate(new Date(l.completed_at))));
    const days = DAYS.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = toLocalISODate(d);
      return { label, iso, done: doneDates.has(iso), future: d > now && iso !== toLocalISODate(now) };
    });
    const todayIdx = (now.getDay() + 6) % 7;
    let streakRun = 0;
    for (const d of days) {
      if (d.done) streakRun += 1;
      else if (!d.future && d.iso !== toLocalISODate(now)) streakRun = 0;
    }
    return {
      days,
      doneCount: days.filter((d) => d.done).length,
      todayIdx,
      weekStart,
      isWeekend: todayIdx > 4,
      streakRun,
    };
  }, [log]);

  const alreadyClaimed = claimed.includes(weekStart);
  const canClaim = doneCount === 5 && !alreadyClaimed;

  const line = useMemo(() => {
    if (doneCount === 5) return pick(MOTIVATION.done);
    if (isWeekend) return pick(MOTIVATION.weekend);
    if (doneCount === 0) return pick(MOTIVATION.zero);
    if (doneCount <= 2) return pick(MOTIVATION.low);
    if (doneCount === 3) return pick(MOTIVATION.mid);
    return pick(MOTIVATION.high);
  }, [doneCount, isWeekend]);

  const claim = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("claim_streak_reward", {
        p_week_start: weekStart,
        p_tz: localTimeZone(),
      });
      if (error) throw error;
      return data as { gold: number; xp: number; leveled_up: boolean; level: number };
    },
    onSuccess: (r) => {
      playSound(r.leveled_up ? "levelup" : "coin");
      toast.success(`5-day streak reward: +${r.gold} Gold, +${r.xp} XP${r.leveled_up ? ` — LEVEL ${r.level}!` : ""}`);
      GAME_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: k }));
    },
    onError: (e) => {
      playSound("error");
      toast.error(e instanceof Error ? e.message : "Could not claim reward");
    },
  });

  return (
    <section className="panel p-5" aria-label="Weekly streak">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Weekly streak</p>
          <h2 className="font-display text-xl font-bold">Mon → Fri</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-vitality/50 bg-vitality/10 px-2.5 py-1 text-sm font-bold text-vitality">
          <Flame className={cn("size-4", streakRun > 0 && "animate-sparkle")} /> {streakRun} day{streakRun === 1 ? "" : "s"}
        </span>
      </header>

      <ol className="mt-4 grid grid-cols-5 gap-2">
        {days.map((d, i) => {
          const today = i === todayIdx;
          return (
            <li key={d.iso} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border text-sm font-bold transition-all",
                  d.done
                    ? "border-vitality bg-vitality text-primary-foreground shadow-[0_0_18px_-4px_var(--vitality)]"
                    : today
                      ? "border-primary text-primary animate-glow-pulse"
                      : d.future
                        ? "border-border text-muted-foreground/60"
                        : "border-border/60 text-muted-foreground/40 line-through",
                )}
              >
                {d.done ? "🔥" : d.label[0]}
              </span>
              <span className={cn("text-[10px]", today ? "font-bold text-foreground" : "text-muted-foreground")}>{d.label}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 rounded-lg bg-background/40 p-3 text-sm italic text-muted-foreground">"{line}"</p>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {doneCount}/5 days · milestone: <span className="text-gold">+250 G</span>, <span className="text-xp">+300 XP</span>
        </span>
        {alreadyClaimed ? (
          <span className="rounded-full bg-xp/15 px-2 py-1 font-semibold text-xp">Claimed ✓</span>
        ) : (
          <Button size="sm" disabled={!canClaim || claim.isPending} onClick={() => claim.mutate()} className={cn(canClaim && "animate-glow-pulse")}>
            <Gift /> Claim
          </Button>
        )}
      </div>
    </section>
  );
}
