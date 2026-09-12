import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Quest = Database["public"]["Tables"]["quests"]["Row"];
export type Boss = Database["public"]["Tables"]["bosses"]["Row"];
export type ShopItem = Database["public"]["Tables"]["shop_items"]["Row"];
export type UserItem = Database["public"]["Tables"]["user_items"]["Row"];
export type QuestLog = Database["public"]["Tables"]["quest_log"]["Row"];
export type QuestCategory = Database["public"]["Enums"]["quest_category"];
export type QuestDifficulty = Database["public"]["Enums"]["quest_difficulty"];
export type ItemSlot = Database["public"]["Enums"]["item_slot"];

export type StatKey = "intellect" | "wisdom" | "mind" | "vitality" | "creativity" | "charisma";

export const CATEGORIES: Record<
  QuestCategory,
  { label: string; stat: StatKey; statLabel: string; icon: string; color: string }
> = {
  coding: { label: "Coding", stat: "intellect", statLabel: "Intellect", icon: "💻", color: "intellect" },
  studying: { label: "Studying", stat: "wisdom", statLabel: "Wisdom", icon: "📚", color: "wisdom" },
  meditation: { label: "Meditation", stat: "mind", statLabel: "Mind", icon: "🧘", color: "mind" },
  fitness: { label: "Fitness", stat: "vitality", statLabel: "Vitality", icon: "🏋️", color: "vitality" },
  creative: { label: "Creative", stat: "creativity", statLabel: "Creativity", icon: "🎨", color: "creativity" },
  social: { label: "Social", stat: "charisma", statLabel: "Charisma", icon: "🗣️", color: "charisma" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as QuestCategory[];

export const STATS: { key: StatKey; label: string; icon: string; blurb: string }[] = [
  { key: "intellect", label: "Intellect", icon: "💻", blurb: "Coding & problem solving" },
  { key: "wisdom", label: "Wisdom", icon: "📚", blurb: "Studying & learning" },
  { key: "mind", label: "Mind", icon: "🧘", blurb: "Meditation & focus" },
  { key: "vitality", label: "Vitality", icon: "🏋️", blurb: "Fitness & health" },
  { key: "creativity", label: "Creativity", icon: "🎨", blurb: "Art, music & making" },
  { key: "charisma", label: "Charisma", icon: "🗣️", blurb: "Social & connection" },
];

export const DIFFICULTIES: Record<
  QuestDifficulty,
  { label: string; xp: number; gold: number; stat: number; stars: number }
> = {
  easy: { label: "Easy", xp: 30, gold: 15, stat: 5, stars: 1 },
  medium: { label: "Medium", xp: 60, gold: 30, stat: 10, stars: 2 },
  hard: { label: "Hard", xp: 100, gold: 50, stat: 15, stars: 3 },
  epic: { label: "Epic", xp: 150, gold: 80, stat: 25, stars: 4 },
};
export const DIFFICULTY_KEYS = Object.keys(DIFFICULTIES) as QuestDifficulty[];

/** XP needed to advance from `level` to `level + 1` (non-linear curve). */
export function xpToNext(level: number) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/** Break a total XP value into level, xp into current level, xp required for next. */
export function levelProgress(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  while (level < 99 && remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level += 1;
  }
  const need = xpToNext(level);
  return { level, current: remaining, need, pct: Math.min(100, (remaining / need) * 100) };
}

export function titleForLevel(level: number) {
  if (level >= 40) return "Legendary Slayer";
  if (level >= 30) return "Grandmaster of Focus";
  if (level >= 20) return "Champion of Deadlines";
  if (level >= 12) return "Knight of Discipline";
  if (level >= 6) return "Squire of Momentum";
  if (level >= 3) return "Apprentice Doer";
  return "Novice Adventurer";
}

export const BOSS_TAUNTS_OVERDUE = [
  "Overdue again? I'm feeding on your excuses. Delicious.",
  "Tomorrow, tomorrow... I love that word. Keep saying it.",
  "That deadline passed and I grew stronger. Thank you, mortal.",
  "Why finish today what you can dread for a week?",
  "Your to-do list is my throne. Keep stacking it.",
];

export const BOSS_TAUNTS_IDLE = [
  "Still here? Go on, open another tab.",
  "Just five more minutes of scrolling. I'll wait.",
  "You won't hit me. You never do.",
  "Ah, the sweet smell of unfinished work.",
];

export const BOSS_HURT_LINES = [
  "Ouch! That actually... hurt?!",
  "Impossible! You did a thing!",
  "Stop being productive, it stings!",
  "My power... it fades with every task...",
  "Who told you about discipline?!",
];

export const MOTIVATION = {
  zero: [
    "The week is a blank quest log. Write the first line.",
    "Every legend starts with one small, annoying task.",
  ],
  low: ["Momentum spotted. Feed it another quest.", "One down. The boss is sweating already."],
  mid: ["Halfway through the week — the streak holds!", "Discipline is a stat you level by showing up."],
  high: ["One more day and the milestone is yours.", "The Procrastinator fears you now. Finish it."],
  done: ["FIVE FOR FIVE. You are the storm.", "Streak complete. Claim your reward, champion."],
  weekend: ["Rest is a quest too. Recover for Monday.", "Weekend detected. Sharpen the blade."],
};

export const ITEM_VISUALS: Record<string, { rarity: string; glow: string }> = {
  wizard_outfit: { rarity: "Rare", glow: "from-wisdom/30" },
  ember_theme: { rarity: "Rare", glow: "from-vitality/30" },
  galaxy_theme: { rarity: "Epic", glow: "from-creativity/30" },
  dragon_pet: { rarity: "Epic", glow: "from-hp/30" },
  golden_sword: { rarity: "Legendary", glow: "from-gold/30" },
  special_badge: { rarity: "Legendary", glow: "from-gold/40" },
};

export const SLOT_LABELS: Record<ItemSlot, string> = {
  outfit: "Outfit",
  theme: "Realm Theme",
  pet: "Companion",
  weapon: "Weapon",
  badge: "Badge",
};

export interface CompleteQuestResult {
  quest_id: string;
  title: string;
  category: QuestCategory;
  xp: number;
  gold: number;
  stat: number;
  stat_name: StatKey;
  damage: number;
  weapon_bonus: boolean;
  level_before: number;
  level_after: number;
  leveled_up: boolean;
  boss_name: string;
  boss_tier: number;
  boss_max_hp: number;
  boss_hp_before: number;
  boss_hp_after: number;
  boss_defeated: boolean;
  bonus_gold: number;
  bonus_xp: number;
  next_boss: { name: string; tier: number; max_hp: number } | null;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/** Monday (local) of the week containing `d`, as YYYY-MM-DD. */
export function weekStartISO(d = new Date()) {
  const day = (d.getDay() + 6) % 7; // Mon=0
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
  return toLocalISODate(monday);
}

export function toLocalISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function localTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
