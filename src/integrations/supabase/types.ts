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
      body_metrics: {
        Row: {
          arm_cm: number | null
          body_fat_pct: number | null
          chest_cm: number | null
          hips_cm: number | null
          id: string
          note: string | null
          recorded_at: string
          thigh_cm: number | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          hips_cm?: number | null
          id?: string
          note?: string | null
          recorded_at?: string
          thigh_cm?: number | null
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          hips_cm?: number | null
          id?: string
          note?: string | null
          recorded_at?: string
          thigh_cm?: number | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          form_tip: string | null
          id: string
          muscles: string[]
          name: string
          position: number
          reps: number
          rest_seconds: number
          sets: number
          video_url: string | null
          workout_id: string
          youtube_query: string | null
        }
        Insert: {
          form_tip?: string | null
          id?: string
          muscles?: string[]
          name: string
          position?: number
          reps?: number
          rest_seconds?: number
          sets?: number
          video_url?: string | null
          workout_id: string
          youtube_query?: string | null
        }
        Update: {
          form_tip?: string | null
          id?: string
          muscles?: string[]
          name?: string
          position?: number
          reps?: number
          rest_seconds?: number
          sets?: number
          video_url?: string | null
          workout_id?: string
          youtube_query?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          calories: number
          carbs_g: number
          cost_estimate: number | null
          country: string | null
          created_at: string
          currency: string | null
          dietary_tags: string[]
          fat_g: number
          id: string
          image_url: string | null
          ingredients: string[]
          instructions: string | null
          is_published: boolean
          meal_type: string
          protein_g: number
          title: string
        }
        Insert: {
          calories?: number
          carbs_g?: number
          cost_estimate?: number | null
          country?: string | null
          created_at?: string
          currency?: string | null
          dietary_tags?: string[]
          fat_g?: number
          id?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string | null
          is_published?: boolean
          meal_type?: string
          protein_g?: number
          title: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          cost_estimate?: number | null
          country?: string | null
          created_at?: string
          currency?: string | null
          dietary_tags?: string[]
          fat_g?: number
          id?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string | null
          is_published?: boolean
          meal_type?: string
          protein_g?: number
          title?: string
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          artist: string | null
          audio_url: string
          bpm: number | null
          cover_url: string | null
          created_at: string
          duration_seconds: number | null
          genre: string | null
          id: string
          is_published: boolean
          title: string
        }
        Insert: {
          artist?: string | null
          audio_url: string
          bpm?: number | null
          cover_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_published?: boolean
          title: string
        }
        Update: {
          artist?: string | null
          audio_url?: string
          bpm?: number | null
          cover_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          genre?: string | null
          id?: string
          is_published?: boolean
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          budget: string | null
          country: string | null
          created_at: string
          dietary: string[] | null
          display_name: string | null
          goal: string | null
          id: string
          is_premium: boolean
          onboarded: boolean
          streak: number
          updated_at: string
          workout_env: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          budget?: string | null
          country?: string | null
          created_at?: string
          dietary?: string[] | null
          display_name?: string | null
          goal?: string | null
          id: string
          is_premium?: boolean
          onboarded?: boolean
          streak?: number
          updated_at?: string
          workout_env?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          budget?: string | null
          country?: string | null
          created_at?: string
          dietary?: string[] | null
          display_name?: string | null
          goal?: string | null
          id?: string
          is_premium?: boolean
          onboarded?: boolean
          streak?: number
          updated_at?: string
          workout_env?: string | null
          xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          duration_seconds: number | null
          id: string
          notes: string | null
          perceived_difficulty: string | null
          started_at: string
          total_volume_kg: number | null
          user_id: string
          workout_id: string | null
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          perceived_difficulty?: string | null
          started_at?: string
          total_volume_kg?: number | null
          user_id: string
          workout_id?: string | null
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          perceived_difficulty?: string | null
          started_at?: string
          total_volume_kg?: number | null
          user_id?: string
          workout_id?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          difficulty: string
          duration_min: number
          environment: string
          goal: string | null
          id: string
          is_published: boolean
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_min?: number
          environment?: string
          goal?: string | null
          id?: string
          is_published?: boolean
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_min?: number
          environment?: string
          goal?: string | null
          id?: string
          is_published?: boolean
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
