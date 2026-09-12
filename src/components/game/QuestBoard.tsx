import { useMemo, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow, isPast } from "date-fns";
import { Check, Clock, Pencil, Plus, Swords, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { questsQuery } from "@/lib/queries";
import { CATEGORIES, CATEGORY_KEYS, DIFFICULTIES, type Quest, type QuestCategory } from "@/lib/game";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuestDialog } from "./QuestDialog";

interface Props {
  onComplete: (quest: Quest) => void;
  completingId: string | null;
}

export function QuestBoard({ onComplete, completingId }: Props) {
  const { data: quests } = useSuspenseQuery(questsQuery);
  const qc = useQueryClient();
  const [tab, setTab] = useState<"active" | "done">("active");
  const [cat, setCat] = useState<QuestCategory | "all">("all");
  const [dialog, setDialog] = useState<{ open: boolean; quest: Quest | null }>({ open: false, quest: null });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Quest abandoned");
      qc.invalidateQueries({ queryKey: ["quests"] });
    },
    onError: () => toast.error("Could not delete quest"),
  });

  const list = useMemo(
    () =>
      quests
        .filter((q) => (tab === "active" ? !q.completed_at : !!q.completed_at))
        .filter((q) => cat === "all" || q.category === cat)
        .sort((a, b) => {
          if (tab === "done") return (b.completed_at ?? "").localeCompare(a.completed_at ?? "");
          const ad = a.due_at ? new Date(a.due_at).getTime() : Infinity;
          const bd = b.due_at ? new Date(b.due_at).getTime() : Infinity;
          return ad - bd || b.created_at.localeCompare(a.created_at);
        }),
    [quests, tab, cat],
  );

  const activeCount = quests.filter((q) => !q.completed_at).length;
  const doneCount = quests.length - activeCount;

  return (
    <section className="panel p-5 md:p-6" aria-label="Quest board">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Quest Board</p>
          <h2 className="font-display text-2xl font-bold">Your quests</h2>
        </div>
        <Button onClick={() => { playSound("click"); setDialog({ open: true, quest: null }); }} className="font-semibold">
          <Plus /> New quest
        </Button>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-muted p-1 text-xs font-medium">
          {(
            [
              ["active", `Active (${activeCount})`],
              ["done", `Completed (${doneCount})`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                tab === k ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
          {CATEGORY_KEYS.map((k) => (
            <Chip key={k} active={cat === k} onClick={() => setCat(k)}>
              {CATEGORIES[k].icon} {CATEGORIES[k].label}
            </Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-3xl">{tab === "active" ? "🗺️" : "🏆"}</p>
          <p className="mt-2 font-semibold">
            {tab === "active" ? "No active quests" : "No completed quests yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "active"
              ? "The boss is resting comfortably. Add a quest and ruin his day."
              : "Complete a quest to start your legend."}
          </p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {list.map((q) => (
            <QuestCard
              key={q.id}
              quest={q}
              busy={completingId === q.id}
              onComplete={() => onComplete(q)}
              onEdit={() => setDialog({ open: true, quest: q })}
              onDelete={() => remove.mutate(q.id)}
            />
          ))}
        </ul>
      )}

      <QuestDialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} quest={dialog.quest} />
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs transition-colors",
        active ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const CAT_RING: Record<QuestCategory, string> = {
  coding: "border-intellect/50 text-intellect",
  studying: "border-wisdom/50 text-wisdom",
  meditation: "border-mind/50 text-mind",
  fitness: "border-vitality/50 text-vitality",
  creative: "border-creativity/50 text-creativity",
  social: "border-charisma/50 text-charisma",
};

function QuestCard({
  quest: q,
  busy,
  onComplete,
  onEdit,
  onDelete,
}: {
  quest: Quest;
  busy: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cat = CATEGORIES[q.category];
  const diff = DIFFICULTIES[q.difficulty];
  const done = !!q.completed_at;
  const overdue = !done && !!q.due_at && isPast(new Date(q.due_at));

  return (
    <li
      className={cn(
        "group relative flex gap-3 rounded-xl border bg-background/40 p-4 transition-all animate-fade-in",
        done ? "border-border/60 opacity-70" : overdue ? "border-hp/50 shadow-[0_0_24px_-10px_var(--hp)]" : "border-border hover:border-primary/40",
      )}
    >
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg border bg-card text-xl", CAT_RING[q.category])}>
        {cat.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn("font-semibold leading-tight", done && "line-through")}>{q.title}</h3>
          <span className="shrink-0 text-xs text-gold" title={diff.label}>
            {"★".repeat(diff.stars)}
          </span>
        </div>
        {q.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{q.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded bg-xp/15 px-1.5 py-0.5 font-semibold text-xp">+{diff.xp} XP</span>
          <span className="rounded bg-gold/15 px-1.5 py-0.5 font-semibold text-gold">+{diff.gold} G</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-foreground/90">+{diff.stat} {cat.statLabel}</span>
          {q.tags.map((t) => (
            <span key={t} className="rounded-full border border-border px-1.5 py-0.5 text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className={cn("inline-flex items-center gap-1 text-[11px]", overdue ? "font-semibold text-hp" : "text-muted-foreground")}>
            {done ? (
              <>
                <Check className="size-3" /> done {formatDistanceToNow(new Date(q.completed_at!), { addSuffix: true })}
              </>
            ) : q.due_at ? (
              <>
                <Clock className="size-3" /> {overdue ? "overdue" : "due"} {formatDistanceToNow(new Date(q.due_at), { addSuffix: true })}
              </>
            ) : (
              "no deadline"
            )}
          </span>
          <div className="flex items-center gap-1">
            {!done && (
              <>
                <Button variant="ghost" size="icon" className="size-8" onClick={onEdit} aria-label="Edit quest">
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 hover:text-hp" onClick={onDelete} aria-label="Delete quest">
                  <Trash2 />
                </Button>
                <Button size="sm" onClick={onComplete} disabled={busy} className="ml-1 font-semibold" aria-label={`Complete ${q.title}`}>
                  <Swords /> {busy ? "Striking…" : "Complete"}
                </Button>
              </>
            )}
            {done && (
              <Button variant="ghost" size="icon" className="size-8 hover:text-hp" onClick={onDelete} aria-label="Remove quest">
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
