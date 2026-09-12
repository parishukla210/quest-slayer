import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Boss, Profile, Quest, QuestLog, ShopItem, UserItem } from "./game";

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async (): Promise<Profile> => {
    const { data: userData } = await supabase.auth.getUser();
    const displayName =
      (userData.user?.user_metadata?.["display_name"] as string | undefined) ??
      userData.user?.email?.split("@")[0];
    const { data, error } = await supabase.rpc("ensure_profile", {
      p_display_name: displayName ?? "Adventurer",
    });
    if (error) throw error;
    return data as Profile;
  },
});

export const questsQuery = queryOptions({
  queryKey: ["quests"],
  queryFn: async (): Promise<Quest[]> => {
    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .order("completed_at", { ascending: true, nullsFirst: true })
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const bossQuery = queryOptions({
  queryKey: ["boss"],
  queryFn: async (): Promise<Boss | null> => {
    const { data, error } = await supabase
      .from("bosses")
      .select("*")
      .is("defeated_at", null)
      .order("tier", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const shopItemsQuery = queryOptions({
  queryKey: ["shop_items"],
  queryFn: async (): Promise<ShopItem[]> => {
    const { data, error } = await supabase.from("shop_items").select("*").order("sort_order");
    if (error) throw error;
    return data;
  },
  staleTime: 1000 * 60 * 30,
});

export const userItemsQuery = queryOptions({
  queryKey: ["user_items"],
  queryFn: async (): Promise<UserItem[]> => {
    const { data, error } = await supabase.from("user_items").select("*");
    if (error) throw error;
    return data;
  },
});

export const questLogQuery = queryOptions({
  queryKey: ["quest_log"],
  queryFn: async (): Promise<QuestLog[]> => {
    const { data, error } = await supabase
      .from("quest_log")
      .select("*")
      .order("completed_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  },
});

export const streakRewardsQuery = queryOptions({
  queryKey: ["streak_rewards"],
  queryFn: async (): Promise<string[]> => {
    const { data, error } = await supabase.from("streak_rewards").select("week_start");
    if (error) throw error;
    return data.map((r) => r.week_start);
  },
});

export const GAME_KEYS = [
  ["profile"],
  ["quests"],
  ["boss"],
  ["user_items"],
  ["quest_log"],
  ["streak_rewards"],
];
