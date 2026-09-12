import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { profileQuery, questLogQuery, shopItemsQuery, userItemsQuery } from "@/lib/queries";
import { CATEGORIES } from "@/lib/game";
import { GameShell } from "@/components/game/GameShell";
import { StatSheet } from "@/components/game/StatSheet";
import { Inventory } from "@/components/game/Shop";

export const Route = createFileRoute("/_authenticated/character")({
  head: () => ({
    meta: [
      { title: "Character Sheet — Procrastination Slayer" },
      { name: "description", content: "Your level, attributes, equipment and quest history." },
      { property: "og:title", content: "Character Sheet — Procrastination Slayer" },
      { property: "og:description", content: "Level, attributes, loot and history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(shopItemsQuery),
      context.queryClient.ensureQueryData(userItemsQuery),
      context.queryClient.ensureQueryData(questLogQuery),
    ]),
  pendingComponent: () => <div className="realm-bg min-h-screen" />,
  errorComponent: ({ error }) => <div className="realm-bg min-h-screen p-10 text-center">{error.message}</div>,
  component: CharacterPage,
});

function CharacterPage() {
  const { data: log } = useSuspenseQuery(questLogQuery);
  return (
    <GameShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <StatSheet />
        <div className="space-y-5">
          <Inventory />
          <section className="panel p-5" aria-label="Recent activity">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Chronicle</p>
            <h2 className="font-display text-xl font-bold">Recent victories</h2>
            {log.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No quests completed yet. Your legend awaits.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {log.slice(0, 12).map((l) => (
                  <li key={l.id} className="flex items-center gap-2 rounded-lg bg-background/40 px-3 py-2">
                    <span>{CATEGORIES[l.category].icon}</span>
                    <span className="min-w-0 flex-1 truncate">{l.title}</span>
                    <span className="text-xs text-xp">+{l.xp}xp</span>
                    <span className="text-xs text-hp">-{l.damage}</span>
                    <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(l.completed_at), { addSuffix: true })}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </GameShell>
  );
}
