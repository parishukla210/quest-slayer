import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Coins, LogOut, ScrollText, ShoppingBag, Swords, User, Volume2, VolumeX } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery, shopItemsQuery, userItemsQuery } from "@/lib/queries";
import { levelProgress } from "@/lib/game";
import { useSound } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { HeroAvatar } from "./HeroAvatar";

const NAV = [
  { to: "/dashboard", label: "Quest Board", icon: ScrollText },
  { to: "/character", label: "Character", icon: User },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
] as const;

export function useEquipped() {
  const { data: items } = useSuspenseQuery(userItemsQuery);
  return new Set(items.filter((i) => i.equipped).map((i) => i.item_id));
}

export function GameShell({ children }: { children: ReactNode }) {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: shop } = useSuspenseQuery(shopItemsQuery);
  const equipped = useEquipped();
  const { enabled, toggle } = useSound();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const themeId = shop.find((s) => s.slot === "theme" && equipped.has(s.id))?.id;
  const theme = themeId === "galaxy_theme" ? "galaxy" : themeId === "ember_theme" ? "ember" : undefined;
  const lp = levelProgress(profile.xp);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div data-theme={theme} className={`realm-bg min-h-screen text-foreground ${theme === "galaxy" ? "stars-bg" : ""}`}>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-display text-base font-bold tracking-wide">
            <Swords className="size-5 text-gold" />
            <span className="hidden sm:inline">Procrastination Slayer</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <n.icon className="size-4" /> {n.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden min-w-32 flex-col sm:flex">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-display font-bold text-foreground">LV {lp.level}</span>
                <span>
                  {lp.current}/{lp.need} XP
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-xp transition-all duration-700" style={{ width: `${lp.pct}%` }} />
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-sm font-semibold text-gold">
              <Coins className="size-4" /> {profile.gold.toLocaleString()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={enabled ? "Mute sound effects" : "Unmute sound effects"}
              title={enabled ? "Sound on" : "Sound off"}
            >
              {enabled ? <Volume2 /> : <VolumeX />}
            </Button>
            <Link to="/character" className="hidden sm:block" aria-label="Character sheet">
              <HeroAvatar equipped={equipped} level={profile.level} size="sm" />
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" title="Sign out">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground"
            activeProps={{ className: "text-gold" }}
          >
            <n.icon className="size-5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
