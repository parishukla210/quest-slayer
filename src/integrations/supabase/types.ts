export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bosses: {
        Row: {
          created_at: string
          current_hp: number
          defeated_at: string | null
          id: string
          max_hp: number
          name: string
          tier: number
          user_id: string
        }
        Insert: {
          created_at?: string
          current_hp: number
          defeated_at?: string | null
          id?: string
          max_hp: number
          name: string
          tier?: number
          user_id: string
        }
        Update: {
          created_at?: string
          current_hp?: number
          defeated_at?: string | null
          id?: string
          max_hp?: number
          name?: string
          tier?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bosses_defeated: number
          charisma: number
          created_at: string
          creativity: number
          display_name: string
          gold: number
          id: string
          intellect: number
          level: number
          mind: number
          quests_completed: number
          updated_at: string
          vitality: number
          wisdom: number
          xp: number
        }
        Insert: {
          bosses_defeated?: number
          charisma?: number
          created_at?: string
          creativity?: number
          display_name?: string
          gold?: number
          id: string
          intellect?: number
          level?: number
          mind?: number
          quests_completed?: number
          updated_at?: string
          vitality?: number
          wisdom?: number
          xp?: number
        }
        Update: {
          bosses_defeated?: number
          charisma?: number
          created_at?: string
          creativity?: number
          display_name?: string
          gold?: number
          id?: string
          intellect?: number
          level?: number
          mind?: number
          quests_completed?: number
          updated_at?: string
          vitality?: number
          wisdom?: number
          xp?: number
        }
        Relationships: []
      }
      quest_log: {
        Row: {
          category: Database["public"]["Enums"]["quest_category"]
          completed_at: string
          damage: number
          difficulty: Database["public"]["Enums"]["quest_difficulty"]
          gold: number
          id: string
          quest_id: string | null
          title: string
          user_id: string
          xp: number
        }
        Insert: {
          category: Database["public"]["Enums"]["quest_category"]
          completed_at?: string
          damage: number
          difficulty: Database["public"]["Enums"]["quest_difficulty"]
          gold: number
          id?: string
          quest_id?: string | null
          title: string
          user_id: string
          xp: number
        }
        Update: {
          category?: Database["public"]["Enums"]["quest_category"]
          completed_at?: string
          damage?: number
          difficulty?: Database["public"]["Enums"]["quest_difficulty"]
          gold?: number
          id?: string
          quest_id?: string | null
          title?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      quests: {
        Row: {
          category: Database["public"]["Enums"]["quest_category"]
          completed_at: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["quest_difficulty"]
          due_at: string | null
          id: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["quest_category"]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["quest_difficulty"]
          due_at?: string | null
          id?: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["quest_category"]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["quest_difficulty"]
          due_at?: string | null
          id?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          description: string
          emoji: string
          id: string
          name: string
          price: number
          slot: Database["public"]["Enums"]["item_slot"]
          sort_order: number
        }
        Insert: {
          description: string
          emoji: string
          id: string
          name: string
          price: number
          slot: Database["public"]["Enums"]["item_slot"]
          sort_order?: number
        }
        Update: {
          description?: string
          emoji?: string
          id?: string
          name?: string
          price?: number
          slot?: Database["public"]["Enums"]["item_slot"]
          sort_order?: number
        }
        Relationships: []
      }
      streak_rewards: {
        Row: {
          claimed_at: string
          gold: number
          id: string
          user_id: string
          week_start: string
          xp: number
        }
        Insert: {
          claimed_at?: string
          gold: number
          id?: string
          user_id: string
          week_start: string
          xp: number
        }
        Update: {
          claimed_at?: string
          gold?: number
          id?: string
          user_id?: string
          week_start?: string
          xp?: number
        }
        Relationships: []
      }
      user_items: {
        Row: {
          equipped: boolean
          id: string
          item_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          equipped?: boolean
          id?: string
          item_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          equipped?: boolean
          id?: string
          item_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      boss_hp_for_tier: { Args: { p_tier: number }; Returns: number }
      boss_name_for_tier: { Args: { p_tier: number }; Returns: string }
      claim_streak_reward: {
        Args: { p_tz?: string; p_week_start: string }
        Returns: Json
      }
      complete_quest: { Args: { p_quest_id: string }; Returns: Json }
      ensure_profile: {
        Args: { p_display_name?: string }
        Returns: {
          bosses_defeated: number
          charisma: number
          created_at: string
          creativity: number
          display_name: string
          gold: number
          id: string
          intellect: number
          level: number
          mind: number
          quests_completed: number
          updated_at: string
          vitality: number
          wisdom: number
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      equip_item: {
        Args: { p_equip?: boolean; p_item_id: string }
        Returns: undefined
      }
      level_for_xp: { Args: { p_xp: number }; Returns: number }
      purchase_item: { Args: { p_item_id: string }; Returns: Json }
    }
    Enums: {
      item_slot: "outfit" | "theme" | "pet" | "weapon" | "badge"
      quest_category:
        | "coding"
        | "studying"
        | "meditation"
        | "fitness"
        | "creative"
        | "social"
      quest_difficulty: "easy" | "medium" | "hard" | "epic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      item_slot: ["outfit", "theme", "pet", "weapon", "badge"],
      quest_category: [
        "coding",
        "studying",
        "meditation",
        "fitness",
        "creative",
        "social",
      ],
      quest_difficulty: ["easy", "medium", "hard", "epic"],
    },
  },
} as const
