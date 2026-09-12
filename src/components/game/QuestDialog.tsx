import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  CATEGORY_KEYS,
  DIFFICULTIES,
  DIFFICULTY_KEYS,
  type Quest,
  type QuestCategory,
  type QuestDifficulty,
} from "@/lib/game";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  quest?: Quest | null;
}

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function QuestDialog({ open, onOpenChange, quest }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QuestCategory>("coding");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("medium");
  const [tags, setTags] = useState("");
  const [due, setDue] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(quest?.title ?? "");
    setDescription(quest?.description ?? "");
    setCategory(quest?.category ?? "coding");
    setDifficulty(quest?.difficulty ?? "medium");
    setTags(quest?.tags.join(", ") ?? "");
    setDue(toLocalInput(quest?.due_at ?? null));
  }, [open, quest]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        difficulty,
        tags: tags
          .split(",")
          .map((t) => t.trim().replace(/^#/, ""))
          .filter(Boolean)
          .slice(0, 8),
        due_at: due ? new Date(due).toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      if (quest) {
        const { error } = await supabase.from("quests").update(payload).eq("id", quest.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quests").insert({ ...payload, user_id: u.user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      playSound("click");
      toast.success(quest ? "Quest updated" : "Quest added to the board");
      qc.invalidateQueries({ queryKey: ["quests"] });
      onOpenChange(false);
    },
    onError: (e) => {
      playSound("error");
      toast.error(e instanceof Error ? e.message : "Could not save quest");
    },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    save.mutate();
  }

  const d = DIFFICULTIES[difficulty];
  const c = CATEGORIES[category];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{quest ? "Edit quest" : "New quest"}</DialogTitle>
          <DialogDescription>
            A real-life task. Completing it rewards XP, gold and {c.statLabel}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="q-title">Title</Label>
            <Input
              id="q-title"
              autoFocus
              required
              maxLength={120}
              placeholder="Refactor the auth module"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category → stat</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_KEYS.map((k) => {
                const cat = CATEGORIES[k];
                const active = category === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCategory(k)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-left text-xs transition-all",
                      active
                        ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)]"
                        : "border-border bg-background/40 hover:border-muted-foreground/50",
                    )}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <div className="font-semibold">{cat.label}</div>
                    <div className="text-[10px] text-muted-foreground">+{cat.statLabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTY_KEYS.map((k) => {
                const df = DIFFICULTIES[k];
                const active = difficulty === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setDifficulty(k)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-center text-xs transition-all",
                      active
                        ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)]"
                        : "border-border bg-background/40 hover:border-muted-foreground/50",
                    )}
                  >
                    <div className="text-gold">{"★".repeat(df.stars)}</div>
                    <div className="font-semibold">{df.label}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Rewards: <span className="text-xp">+{d.xp} XP</span> · <span className="text-gold">+{d.gold} Gold</span> ·{" "}
              <span className="text-foreground">+{d.stat} {c.statLabel}</span> · deals {d.xp} damage
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="q-tags">Tags</Label>
              <Input
                id="q-tags"
                placeholder="work, deep-focus"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q-due">Due (optional)</Label>
              <Input id="q-due" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q-desc">Notes</Label>
            <Textarea
              id="q-desc"
              rows={2}
              maxLength={500}
              placeholder="Anything that helps you start."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending || !title.trim()}>
              {quest ? "Save changes" : "Add quest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
