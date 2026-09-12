import { useEffect } from "react";
import { Coins, Sparkles, Swords, Skull, TrendingUp } from "lucide-react";
import { CATEGORIES, titleForLevel, type CompleteQuestResult } from "@/lib/game";
import { Button } from "@/components/ui/button";
import bossImg from "@/assets/boss-procrastinator.png";

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl animate-sparkle"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 6) * 0.25}s`,
              opacity: 0.6,
            }}
          >
            {i % 3 === 0 ? "✨" : i % 3 === 1 ? "⭐" : "💫"}
          </span>
        ))}
      </div>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

export function QuestCompleteOverlay({ result: r, onClose }: { result: CompleteQuestResult; onClose: () => void }) {
  const cat = CATEGORIES[r.category];
  return (
    <Overlay onClose={onClose}>
      <div className="panel overflow-hidden p-6 text-center animate-pop-in md:p-8">
        <p className="font-display text-3xl font-black tracking-wide text-gradient-gold animate-banner-in md:text-4xl">
          QUEST COMPLETE!
        </p>
        <p className="mt-2 truncate text-sm text-muted-foreground">
          {cat.icon} {r.title}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Reward delay={0.15} icon={<Sparkles className="size-5 text-xp" />} label="XP" value={`+${r.xp}`} tone="text-xp" />
          <Reward delay={0.3} icon={<Coins className="size-5 text-gold" />} label="Gold" value={`+${r.gold}`} tone="text-gold" />
          <Reward delay={0.45} icon={<span className="text-lg">{cat.icon}</span>} label={cat.statLabel} value={`+${r.stat}`} tone="text-foreground" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-hp/10 px-3 py-2 text-sm animate-pop-in" style={{ animationDelay: "0.6s" }}>
          <Swords className="size-4 text-hp" />
          <span>
            You struck <b>{r.boss_name}</b> for <b className="text-hp">{r.damage}</b> damage
            {r.weapon_bonus && <span className="text-gold"> (Golden Sword +50%)</span>}
          </span>
        </div>

        {r.leveled_up && (
          <div className="mt-4 rounded-xl border border-gold/60 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 p-4 animate-banner-in" style={{ animationDelay: "0.8s" }}>
            <p className="inline-flex items-center gap-2 font-display text-2xl font-black text-gold">
              <TrendingUp className="size-6" /> LEVEL UP!
            </p>
            <p className="mt-1 text-sm">
              Level {r.level_before} → <b className="text-gold">Level {r.level_after}</b>
            </p>
            <p className="text-xs text-muted-foreground">{titleForLevel(r.level_after)}</p>
          </div>
        )}

        <Button onClick={onClose} size="lg" className="mt-6 w-full font-semibold">
          {r.boss_defeated ? "See what happened to the boss…" : "Onward"}
        </Button>
      </div>
    </Overlay>
  );
}

function Reward({ icon, label, value, tone, delay }: { icon: React.ReactNode; label: string; value: string; tone: string; delay: number }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3 animate-pop-in" style={{ animationDelay: `${delay}s` }}>
      <div className="flex justify-center">{icon}</div>
      <p className={`mt-1 font-display text-xl font-black ${tone}`}>{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

export function BossDefeatedOverlay({ result: r, onClose }: { result: CompleteQuestResult; onClose: () => void }) {
  return (
    <Overlay onClose={onClose}>
      <div className="panel relative overflow-hidden p-6 text-center animate-pop-in md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-hp/20 via-transparent to-gold/10" />
        <div className="relative">
          <img
            src={bossImg}
            alt=""
            width={1024}
            height={1024}
            className="mx-auto w-36 rotate-12 opacity-60 grayscale drop-shadow-[0_10px_20px_oklch(0_0_0/0.6)]"
            style={{ filter: `grayscale(1) hue-rotate(${((r.boss_tier - 1) * 47) % 360}deg)` }}
          />
          <p className="-mt-6 font-display text-4xl font-black tracking-wide text-hp drop-shadow-[0_2px_0_oklch(0_0_0)] animate-banner-in md:text-5xl">
            💥 BOSS DEFEATED
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <b className="text-foreground">{r.boss_name}</b> (Tier {r.boss_tier}) has been vanquished by pure productivity.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Reward delay={0.3} icon={<Coins className="size-5 text-gold" />} label="Bonus gold" value={`+${r.bonus_gold}`} tone="text-gold" />
            <Reward delay={0.45} icon={<Sparkles className="size-5 text-xp" />} label="Bonus XP" value={`+${r.bonus_xp}`} tone="text-xp" />
          </div>

          {r.next_boss && (
            <div className="mt-5 rounded-xl border border-border bg-background/50 p-4 animate-pop-in" style={{ animationDelay: "0.7s" }}>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-hp">
                <Skull className="size-3.5" /> A new challenger rises
              </p>
              <p className="mt-1 font-display text-xl font-bold">{r.next_boss.name}</p>
              <p className="text-sm text-muted-foreground">
                Tier {r.next_boss.tier} · <b className="text-hp">{r.next_boss.max_hp.toLocaleString()} HP</b>
              </p>
            </div>
          )}

          <Button onClick={onClose} size="lg" className="mt-6 w-full font-semibold">
            Face the next boss
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
