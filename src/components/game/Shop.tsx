import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Coins, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GAME_KEYS, profileQuery, shopItemsQuery, userItemsQuery } from "@/lib/queries";
import { ITEM_VISUALS, SLOT_LABELS } from "@/lib/game";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function useItemActions() {
  const qc = useQueryClient();
  const refresh = () => GAME_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: k }));
  const buy = useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.rpc("purchase_item", { p_item_id: itemId });
      if (error) throw error;
      return data as { name: string; gold_left: number };
    },
    onSuccess: (r) => {
      playSound("coin");
      toast.success(`Purchased ${r.name}! ${r.gold_left} gold left.`);
      refresh();
    },
    onError: (e) => {
      playSound("error");
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    },
  });
  const equip = useMutation({
    mutationFn: async ({ itemId, on }: { itemId: string; on: boolean }) => {
      const { error } = await supabase.rpc("equip_item", { p_item_id: itemId, p_equip: on });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      playSound("equip");
      toast.success(v.on ? "Equipped" : "Unequipped");
      qc.invalidateQueries({ queryKey: ["user_items"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not equip"),
  });
  return { buy, equip };
}

export function Shop() {
  const { data: items } = useSuspenseQuery(shopItemsQuery);
  const { data: owned } = useSuspenseQuery(userItemsQuery);
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { buy, equip } = useItemActions();
  const ownedMap = new Map(owned.map((o) => [o.item_id, o]));

  return (
    <section className="panel p-5 md:p-6" aria-label="Reward shop">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Reward Shop</p>
          <h2 className="font-display text-2xl font-bold">Spend your gold</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-semibold text-gold">
          <Coins className="size-4" /> {profile.gold.toLocaleString()} gold
        </span>
      </header>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const own = ownedMap.get(it.id);
          const vis = ITEM_VISUALS[it.id] ?? { rarity: "Common", glow: "from-muted/30" };
          const affordable = profile.gold >= it.price;
          return (
            <li key={it.id} className={cn("hover-lift relative overflow-hidden rounded-xl border border-border bg-gradient-to-b to-card p-5", vis.glow)}>
              <div className="flex items-start justify-between">
                <span className="text-4xl drop-shadow">{it.emoji}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {vis.rarity} · {SLOT_LABELS[it.slot]}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">{it.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-muted-foreground">{it.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-display font-bold text-gold">
                  <Coins className="size-4" /> {it.price.toLocaleString()}
                </span>
                {own ? (
                  <Button
                    size="sm"
                    variant={own.equipped ? "secondary" : "default"}
                    disabled={equip.isPending}
                    onClick={() => equip.mutate({ itemId: it.id, on: !own.equipped })}
                  >
                    {own.equipped ? (
                      <>
                        <Check /> Equipped
                      </>
                    ) : (
                      <>
                        <Sparkles /> Equip
                      </>
                    )}
                  </Button>
                ) : (
                  <Button size="sm" disabled={!affordable || buy.isPending} onClick={() => buy.mutate(it.id)} title={affordable ? "" : "Not enough gold"}>
                    {affordable ? "Buy" : "Need more gold"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Inventory() {
  const { data: items } = useSuspenseQuery(shopItemsQuery);
  const { data: owned } = useSuspenseQuery(userItemsQuery);
  const { equip } = useItemActions();
  const mine = owned
    .map((o) => ({ ...o, item: items.find((i) => i.id === o.item_id) }))
    .filter((o) => o.item);

  return (
    <section className="panel p-5 md:p-6" aria-label="Inventory">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Inventory</p>
      <h2 className="font-display text-2xl font-bold">Your loot</h2>
      {mine.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Your bag is empty. Complete quests, earn gold, visit the shop.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {mine.map((o) => (
            <li key={o.id} className={cn("flex items-center gap-3 rounded-lg border p-3", o.equipped ? "border-gold/50 bg-gold/5" : "border-border bg-background/40")}>
              <span className="text-2xl">{o.item!.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{o.item!.name}</p>
                <p className="text-xs text-muted-foreground">{SLOT_LABELS[o.item!.slot]}</p>
              </div>
              <Button size="sm" variant={o.equipped ? "outline" : "default"} disabled={equip.isPending} onClick={() => equip.mutate({ itemId: o.item_id, on: !o.equipped })}>
                {o.equipped ? "Unequip" : "Equip"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
