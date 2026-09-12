import { createFileRoute } from "@tanstack/react-router";
import { profileQuery, shopItemsQuery, userItemsQuery } from "@/lib/queries";
import { GameShell } from "@/components/game/GameShell";
import { Inventory, Shop } from "@/components/game/Shop";

export const Route = createFileRoute("/_authenticated/shop")({
  head: () => ({
    meta: [
      { title: "Reward Shop — Procrastination Slayer" },
      { name: "description", content: "Spend quest gold on outfits, realm themes, a dragon pet and legendary gear." },
      { property: "og:title", content: "Reward Shop — Procrastination Slayer" },
      { property: "og:description", content: "Buy and equip epic loot with your quest gold." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(shopItemsQuery),
      context.queryClient.ensureQueryData(userItemsQuery),
    ]),
  pendingComponent: () => <div className="realm-bg min-h-screen" />,
  errorComponent: ({ error }) => <div className="realm-bg min-h-screen p-10 text-center">{error.message}</div>,
  component: () => (
    <GameShell>
      <div className="space-y-5">
        <Shop />
        <Inventory />
      </div>
    </GameShell>
  ),
});
