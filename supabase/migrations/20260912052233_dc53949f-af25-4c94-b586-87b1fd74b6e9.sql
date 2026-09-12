CREATE TYPE public.quest_category AS ENUM ('coding','studying','meditation','fitness','creative','social');
CREATE TYPE public.quest_difficulty AS ENUM ('easy','medium','hard','epic');
CREATE TYPE public.item_slot AS ENUM ('outfit','theme','pet','weapon','badge');

-- ---------- profiles ----------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'Adventurer',
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  gold integer NOT NULL DEFAULT 50,
  intellect integer NOT NULL DEFAULT 0,
  wisdom integer NOT NULL DEFAULT 0,
  mind integer NOT NULL DEFAULT 0,
  vitality integer NOT NULL DEFAULT 0,
  creativity integer NOT NULL DEFAULT 0,
  charisma integer NOT NULL DEFAULT 0,
  quests_completed integer NOT NULL DEFAULT 0,
  bosses_defeated integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name, updated_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---------- quests ----------
CREATE TABLE public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category public.quest_category NOT NULL DEFAULT 'coding',
  difficulty public.quest_difficulty NOT NULL DEFAULT 'medium',
  tags text[] NOT NULL DEFAULT '{}',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quests_user_idx ON public.quests (user_id, completed_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quests TO authenticated;
GRANT ALL ON public.quests TO service_role;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quests_all_own" ON public.quests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- bosses ----------
CREATE TABLE public.bosses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier integer NOT NULL DEFAULT 1,
  name text NOT NULL,
  max_hp integer NOT NULL,
  current_hp integer NOT NULL,
  defeated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bosses_user_idx ON public.bosses (user_id, defeated_at);
GRANT SELECT ON public.bosses TO authenticated;
GRANT ALL ON public.bosses TO service_role;
ALTER TABLE public.bosses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bosses_select_own" ON public.bosses FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ---------- shop_items ----------
CREATE TABLE public.shop_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL,
  slot public.item_slot NOT NULL,
  emoji text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.shop_items TO authenticated;
GRANT ALL ON public.shop_items TO service_role;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop_items_read" ON public.shop_items FOR SELECT TO authenticated USING (true);
INSERT INTO public.shop_items (id, name, description, price, slot, emoji, sort_order) VALUES
  ('wizard_outfit', 'Wizard Outfit', 'Robes woven from midnight silk. Your avatar becomes an arcane master.', 200, 'outfit', '🧙', 1),
  ('ember_theme', 'Ember Theme', 'Paint your realm in forge-fire reds and molten gold.', 250, 'theme', '🔥', 2),
  ('galaxy_theme', 'Galaxy Theme', 'Paint your realm in nebula purples and starlight.', 300, 'theme', '🌌', 3),
  ('dragon_pet', 'Dragon Pet', 'A loyal ember-scaled companion who silently judges your open tabs.', 500, 'pet', '🐉', 4),
  ('golden_sword', 'Golden Sword', 'Forged from pure focus. Deals +50% damage to every boss.', 800, 'weapon', '⚔️', 5),
  ('special_badge', 'Special Badge', 'Legendary emblem of a true Slayer of Procrastination.', 1000, 'badge', '🏅', 6);

-- ---------- user_items ----------
CREATE TABLE public.user_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id text NOT NULL REFERENCES public.shop_items(id),
  equipped boolean NOT NULL DEFAULT false,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);
GRANT SELECT ON public.user_items TO authenticated;
GRANT ALL ON public.user_items TO service_role;
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_items_select_own" ON public.user_items FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ---------- quest_log ----------
CREATE TABLE public.quest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_id uuid,
  title text NOT NULL,
  category public.quest_category NOT NULL,
  difficulty public.quest_difficulty NOT NULL,
  xp integer NOT NULL,
  gold integer NOT NULL,
  damage integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quest_log_user_idx ON public.quest_log (user_id, completed_at DESC);
GRANT SELECT ON public.quest_log TO authenticated;
GRANT ALL ON public.quest_log TO service_role;
ALTER TABLE public.quest_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quest_log_select_own" ON public.quest_log FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ---------- streak_rewards ----------
CREATE TABLE public.streak_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  gold integer NOT NULL,
  xp integer NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
GRANT SELECT ON public.streak_rewards TO authenticated;
GRANT ALL ON public.streak_rewards TO service_role;
ALTER TABLE public.streak_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streak_rewards_select_own" ON public.streak_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ---------- helpers ----------
CREATE OR REPLACE FUNCTION public.level_for_xp(p_xp integer)
RETURNS integer LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE lvl integer := 1; need integer; remaining integer := p_xp;
BEGIN
  LOOP
    need := floor(100 * power(lvl, 1.5));
    EXIT WHEN remaining < need OR lvl >= 99;
    remaining := remaining - need;
    lvl := lvl + 1;
  END LOOP;
  RETURN lvl;
END $$;

CREATE OR REPLACE FUNCTION public.boss_name_for_tier(p_tier integer)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT (ARRAY['The Procrastinator','Doomscroll Hydra','The Snooze Lich','Deadline Dragon','Tab Hoarder Titan','The Void of Tomorrow'])[((p_tier - 1) % 6) + 1]
    || CASE WHEN p_tier > 6 THEN ' ' || to_char(((p_tier - 1) / 6) + 1, 'FMRN') ELSE '' END;
$$;

CREATE OR REPLACE FUNCTION public.boss_hp_for_tier(p_tier integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT round(500 * power(1.5, p_tier - 1))::integer;
$$;

-- ---------- ensure_profile ----------
CREATE OR REPLACE FUNCTION public.ensure_profile(p_display_name text DEFAULT NULL)
RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); prof public.profiles;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.profiles (id, display_name)
  VALUES (uid, COALESCE(NULLIF(trim(p_display_name), ''), 'Adventurer'))
  ON CONFLICT (id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.bosses WHERE user_id = uid AND defeated_at IS NULL) THEN
    INSERT INTO public.bosses (user_id, tier, name, max_hp, current_hp)
    VALUES (uid, 1, boss_name_for_tier(1), 500, 500);
  END IF;
  SELECT * INTO prof FROM public.profiles WHERE id = uid;
  RETURN prof;
END $$;

-- ---------- complete_quest ----------
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  q public.quests;
  prof public.profiles;
  b public.bosses;
  nb public.bosses;
  v_xp integer; v_gold integer; v_stat integer; v_stat_name text;
  v_damage integer; v_has_weapon boolean;
  v_level_before integer; v_level_after integer;
  v_boss_defeated boolean := false; v_bonus_gold integer := 0; v_bonus_xp integer := 0;
  v_hp_before integer; v_hp_after integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO q FROM public.quests WHERE id = p_quest_id AND user_id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quest not found'; END IF;
  IF q.completed_at IS NOT NULL THEN RAISE EXCEPTION 'Quest already completed'; END IF;
  SELECT * INTO prof FROM public.profiles WHERE id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile missing'; END IF;

  CASE q.difficulty
    WHEN 'easy' THEN v_xp := 30; v_gold := 15; v_stat := 5;
    WHEN 'medium' THEN v_xp := 60; v_gold := 30; v_stat := 10;
    WHEN 'hard' THEN v_xp := 100; v_gold := 50; v_stat := 15;
    ELSE v_xp := 150; v_gold := 80; v_stat := 25;
  END CASE;

  v_stat_name := CASE q.category
    WHEN 'coding' THEN 'intellect'
    WHEN 'studying' THEN 'wisdom'
    WHEN 'meditation' THEN 'mind'
    WHEN 'fitness' THEN 'vitality'
    WHEN 'creative' THEN 'creativity'
    ELSE 'charisma' END;

  SELECT EXISTS (
    SELECT 1 FROM public.user_items ui JOIN public.shop_items si ON si.id = ui.item_id
    WHERE ui.user_id = uid AND ui.equipped AND si.slot = 'weapon'
  ) INTO v_has_weapon;
  v_damage := CASE WHEN v_has_weapon THEN round(v_xp * 1.5)::integer ELSE v_xp END;

  UPDATE public.quests SET completed_at = now(), updated_at = now() WHERE id = q.id;

  SELECT * INTO b FROM public.bosses WHERE user_id = uid AND defeated_at IS NULL ORDER BY tier DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.bosses (user_id, tier, name, max_hp, current_hp)
    VALUES (uid, 1, boss_name_for_tier(1), 500, 500) RETURNING * INTO b;
  END IF;
  v_hp_before := b.current_hp;
  v_hp_after := GREATEST(0, b.current_hp - v_damage);
  IF v_hp_after = 0 THEN
    v_boss_defeated := true;
    v_bonus_gold := 100 * b.tier;
    v_bonus_xp := 150 * b.tier;
    UPDATE public.bosses SET current_hp = 0, defeated_at = now() WHERE id = b.id;
    INSERT INTO public.bosses (user_id, tier, name, max_hp, current_hp)
    VALUES (uid, b.tier + 1, boss_name_for_tier(b.tier + 1), boss_hp_for_tier(b.tier + 1), boss_hp_for_tier(b.tier + 1))
    RETURNING * INTO nb;
  ELSE
    UPDATE public.bosses SET current_hp = v_hp_after WHERE id = b.id;
  END IF;

  v_level_before := prof.level;
  v_level_after := level_for_xp(prof.xp + v_xp + v_bonus_xp);

  UPDATE public.profiles SET
    xp = xp + v_xp + v_bonus_xp,
    gold = gold + v_gold + v_bonus_gold,
    level = v_level_after,
    intellect = intellect + CASE WHEN v_stat_name = 'intellect' THEN v_stat ELSE 0 END,
    wisdom = wisdom + CASE WHEN v_stat_name = 'wisdom' THEN v_stat ELSE 0 END,
    mind = mind + CASE WHEN v_stat_name = 'mind' THEN v_stat ELSE 0 END,
    vitality = vitality + CASE WHEN v_stat_name = 'vitality' THEN v_stat ELSE 0 END,
    creativity = creativity + CASE WHEN v_stat_name = 'creativity' THEN v_stat ELSE 0 END,
    charisma = charisma + CASE WHEN v_stat_name = 'charisma' THEN v_stat ELSE 0 END,
    quests_completed = quests_completed + 1,
    bosses_defeated = bosses_defeated + CASE WHEN v_boss_defeated THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE id = uid;

  INSERT INTO public.quest_log (user_id, quest_id, title, category, difficulty, xp, gold, damage, completed_at)
  VALUES (uid, q.id, q.title, q.category, q.difficulty, v_xp, v_gold, v_damage, now());

  RETURN jsonb_build_object(
    'quest_id', q.id, 'title', q.title, 'category', q.category,
    'xp', v_xp, 'gold', v_gold, 'stat', v_stat, 'stat_name', v_stat_name,
    'damage', v_damage, 'weapon_bonus', v_has_weapon,
    'level_before', v_level_before, 'level_after', v_level_after, 'leveled_up', v_level_after > v_level_before,
    'boss_name', b.name, 'boss_tier', b.tier, 'boss_max_hp', b.max_hp,
    'boss_hp_before', v_hp_before, 'boss_hp_after', v_hp_after,
    'boss_defeated', v_boss_defeated, 'bonus_gold', v_bonus_gold, 'bonus_xp', v_bonus_xp,
    'next_boss', CASE WHEN nb.id IS NULL THEN NULL ELSE jsonb_build_object('name', nb.name, 'tier', nb.tier, 'max_hp', nb.max_hp) END
  );
END $$;

-- ---------- purchase_item ----------
CREATE OR REPLACE FUNCTION public.purchase_item(p_item_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); item public.shop_items; prof public.profiles;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO item FROM public.shop_items WHERE id = p_item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item not found'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_items WHERE user_id = uid AND item_id = p_item_id) THEN
    RAISE EXCEPTION 'You already own this item';
  END IF;
  SELECT * INTO prof FROM public.profiles WHERE id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile missing'; END IF;
  IF prof.gold < item.price THEN RAISE EXCEPTION 'Not enough gold'; END IF;
  UPDATE public.profiles SET gold = gold - item.price, updated_at = now() WHERE id = uid;
  INSERT INTO public.user_items (user_id, item_id, equipped) VALUES (uid, p_item_id, false);
  RETURN jsonb_build_object('item_id', item.id, 'name', item.name, 'price', item.price, 'gold_left', prof.gold - item.price);
END $$;

-- ---------- equip_item ----------
CREATE OR REPLACE FUNCTION public.equip_item(p_item_id text, p_equip boolean DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); v_slot public.item_slot;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT si.slot INTO v_slot FROM public.user_items ui JOIN public.shop_items si ON si.id = ui.item_id
  WHERE ui.user_id = uid AND ui.item_id = p_item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item not owned'; END IF;
  IF p_equip THEN
    UPDATE public.user_items ui SET equipped = false FROM public.shop_items si
    WHERE si.id = ui.item_id AND ui.user_id = uid AND si.slot = v_slot;
    UPDATE public.user_items SET equipped = true WHERE user_id = uid AND item_id = p_item_id;
  ELSE
    UPDATE public.user_items SET equipped = false WHERE user_id = uid AND item_id = p_item_id;
  END IF;
END $$;

-- ---------- claim_streak_reward ----------
CREATE OR REPLACE FUNCTION public.claim_streak_reward(p_week_start date, p_tz text DEFAULT 'UTC')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); prof public.profiles; v_days integer; v_gold integer := 250; v_xp integer := 300; v_level integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF extract(isodow FROM p_week_start) <> 1 THEN RAISE EXCEPTION 'Week must start on Monday'; END IF;
  IF EXISTS (SELECT 1 FROM public.streak_rewards WHERE user_id = uid AND week_start = p_week_start) THEN
    RAISE EXCEPTION 'Reward already claimed for this week';
  END IF;
  SELECT * INTO prof FROM public.profiles WHERE id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile missing'; END IF;
  SELECT count(DISTINCT d) INTO v_days FROM (
    SELECT (completed_at AT TIME ZONE p_tz)::date AS d FROM public.quest_log WHERE user_id = uid
  ) s WHERE d >= p_week_start AND d < p_week_start + 5;
  IF v_days < 5 THEN RAISE EXCEPTION 'Streak incomplete: % of 5 days done', v_days; END IF;
  v_level := level_for_xp(prof.xp + v_xp);
  UPDATE public.profiles SET gold = gold + v_gold, xp = xp + v_xp, level = v_level, updated_at = now() WHERE id = uid;
  INSERT INTO public.streak_rewards (user_id, week_start, gold, xp) VALUES (uid, p_week_start, v_gold, v_xp);
  RETURN jsonb_build_object('gold', v_gold, 'xp', v_xp, 'leveled_up', v_level > prof.level, 'level', v_level);
END $$;

REVOKE EXECUTE ON FUNCTION public.ensure_profile(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.complete_quest(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.purchase_item(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.equip_item(text, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_streak_reward(date, text) FROM anon;