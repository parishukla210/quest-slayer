import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  bossQuery,
  GAME_KEYS,
  profileQuery,
  questLogQuery,
  questsQuery,
  shopItemsQuery,
  streakRewardsQuery,
  userItemsQuery,
} from "@/lib/queries";
import type { CompleteQuestResult, Quest } from "@/lib/game";
import { playSound } from "@/lib/sound";
import { GameShell } from "@/components/game/GameShell";
import { BossArena, type Hit } from "@/components/game/BossArena";
import { QuestBoard } from "@/components/game/QuestBoard";
import { StatSheet } from "@/components/game/StatSheet";
import { StreakTracker } from "@/components/game/StreakTracker";
import { BossDefeatedOverlay, QuestCompleteOverlay } from "@/components/game/Celebrations";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Quest Board — Procrastination Slayer" },
      { name: "description", content: "Your quests, boss fight, streak and character at a glance." },
      { property: "og:title", content: "Quest Board — Procrastination Slayer" },
      { property: "og:description", content: "Complete quests and strike the boss." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(questsQuery),
      context.queryClient.ensureQueryData(bossQuery),
      context.queryClient.ensureQueryData(shopItemsQuery),
      context.queryClient.ensureQueryData(userItemsQuery),
      context.queryClient.ensureQueryData(questLogQuery),
      context.queryClient.ensureQueryData(streakRewardsQuery),
    ]),
  pendingComponent: () => (
    <div className="realm-bg flex min-h-screen items-center justify-center text-muted-foreground">Summoning your realm…</div>
  ),
  errorComponent: ({ error }) => (
    <div className="realm-bg flex min-h-screen items-center justify-center p-6 text-center">
      <div className="panel max-w-md p-8">
        <h1 className="text-xl font-bold">The realm failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const [hits, setHits] = useState<Hit[]>([]);
  const [celebration, setCelebration] = useState<CompleteQuestResult | null>(null);
  const [victory, setVictory] = useState<CompleteQuestResult | null>(null);
  const hitId = useRef(0);

  const complete = useMutation({
    mutationFn: async (quest: Quest) => {
      const { data, error } = await supabase.rpc("complete_quest", { p_quest_id: quest.id });
      if (error) throw error;
      return data as unknown as CompleteQuestResult;
    },
    onSuccess: (r) => {
      playSound("hit");
      const id = ++hitId.current;
      setHits((h) => [...h, { id, damage: r.damage, crit: r.weapon_bonus }]);
      window.setTimeout(() => setHits((h) => h.filter((x) => x.id !== id)), 1500);
      GAME_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      window.setTimeout(() => {
        playSound(r.leveled_up ? "levelup" : "complete");
        setCelebration(r);
      }, 650);
    },
    onError: (e) => {
      playSound("error");
      toast.error(e instanceof Error ? e.message : "The strike missed");
    },
  });

  function closeCelebration() {
    const r = celebration;
    setCelebration(null);
    if (r?.boss_defeated) {
      playSound("victory");
      setVictory(r);
    }
  }

  return (
    <GameShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <BossArena hits={hits} />
          <QuestBoard onComplete={(q) => complete.mutate(q)} completingId={complete.isPending ? complete.variables?.id ?? null : null} />
        </div>
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <StatSheet compact />
          <StreakTracker />
        </aside>
      </div>
      {celebration && <QuestCompleteOverlay result={celebration} onClose={closeCelebration} />}
      {victory && <BossDefeatedOverlay result={victory} onClose={() => setVictory(null)} />}
    </GameShell>
  );
}
