import { createFileRoute, Link } from "@tanstack/react-router";
import { Swords, Sparkles, Flame, ShoppingBag, Skull, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import heroImg from "@/assets/landing-hero.jpg";
import bossImg from "@/assets/boss-procrastinator.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Procrastination Slayer — Turn Tasks Into Quests" },
      {
        name: "description",
        content:
          "A gamified RPG to-do app: complete real-life quests, earn XP and gold, level your stats, defeat the Procrastinator boss and keep your weekly streak alive.",
      },
      { property: "og:title", content: "Procrastination Slayer — Turn Tasks Into Quests" },
      {
        property: "og:description",
        content: "Complete quests, level up your character, and slay the Procrastinator boss.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Swords,
    title: "Quest Board",
    text: "Turn coding, study, fitness and mindfulness tasks into quests with real rewards.",
  },
  {
    icon: Sparkles,
    title: "Level & Attributes",
    text: "Every quest feeds a stat: Intellect, Wisdom, Mind, Vitality, Creativity, Charisma.",
  },
  {
    icon: Skull,
    title: "Boss Arena",
    text: "Each completed quest strikes the Procrastinator. Drain its HP, defeat it, face the next.",
  },
  {
    icon: Flame,
    title: "Weekly Streak",
    text: "Complete a quest Monday to Friday for a 5-day milestone reward.",
  },
  {
    icon: ShoppingBag,
    title: "Reward Shop",
    text: "Spend gold on outfits, realm themes, a dragon companion and a legendary sword.",
  },
  {
    icon: Trophy,
    title: "Epic Celebrations",
    text: "Combat text, level-up banners and victory screens that make finishing feel heroic.",
  },
];

function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const cta = isAuthenticated ? { to: "/dashboard" as const, label: "Enter the realm" } : { to: "/auth" as const, label: "Begin your quest" };

  return (
    <main className="realm-bg min-h-screen text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <Swords className="size-6 text-gold" />
          <span className="font-display text-lg font-bold tracking-wide">Procrastination Slayer</span>
        </div>
        <nav className="flex items-center gap-2">
          {!loading && (
            <Button asChild variant={isAuthenticated ? "default" : "outline"} size="sm">
              <Link to={cta.to}>{isAuthenticated ? "Dashboard" : "Sign in"}</Link>
            </Button>
          )}
        </nav>
      </header>

      <section className="relative mx-auto max-w-6xl px-5 pt-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl">
          <img
            src={heroImg}
            alt="A lone adventurer facing the towering Procrastinator boss over a ruined city"
            width={1920}
            height={1080}
            className="h-[520px] w-full object-cover object-center md:h-[600px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
              <Sparkles className="size-3.5" /> Gamified productivity RPG
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] md:text-6xl">
              Your to-do list is a <span className="text-gradient-gold">boss fight</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Every real task you finish deals damage to the Procrastinator, grants XP and gold, and
              levels the stats that matter to you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="animate-glow-pulse font-semibold">
                <Link to={cta.to}>
                  <Swords /> {cta.label}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background/50 backdrop-blur">
                <a href="#features">How it works</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="panel hover-lift p-6">
              <f.icon className="size-7 text-gold" />
              <h2 className="mt-4 text-lg font-bold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="panel relative overflow-hidden p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">
                Meet <span className="text-hp">The Procrastinator</span>
              </h2>
              <p className="mt-3 max-w-lg text-muted-foreground">
                500 HP of pure "I'll do it tomorrow". He taunts you when quests go overdue and only
                grows stronger with each boss you defeat. Show him what discipline looks like.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-foreground/90 sm:grid-cols-2">
                <li>⚔️ Damage = quest XP (Golden Sword: +50%)</li>
                <li>💰 Victory bonus gold &amp; XP</li>
                <li>👑 Next boss spawns with more HP</li>
                <li>🔥 Streak rewards every full week</li>
              </ul>
              <Button asChild className="mt-8" size="lg">
                <Link to={cta.to}>{cta.label}</Link>
              </Button>
            </div>
            <img
              src={bossImg}
              alt="The Procrastinator, a lazy purple sloth boss on a pile of sticky notes"
              width={1024}
              height={1024}
              loading="lazy"
              className="mx-auto w-56 animate-bob drop-shadow-[0_20px_40px_oklch(0.5_0.2_300/0.5)] md:w-full"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Procrastination Slayer — finish the quest, slay the boss.
      </footer>
    </main>
  );
}
