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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      facebook_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facebook_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          centris_id: string
          centris_url: string | null
          city: string | null
          created_at: string
          description: string | null
          facebook_post_id: string | null
          id: string
          images: string[] | null
          instagram_post_id: string | null
          is_fully_scraped: boolean | null
          is_published: boolean | null
          is_sold: boolean | null
          postal_code: string | null
          price: number | null
          property_type: string | null
          published_to_facebook: boolean | null
          published_to_instagram: boolean | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
          wistia_hash_id: string | null
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          centris_id: string
          centris_url?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          facebook_post_id?: string | null
          id?: string
          images?: string[] | null
          instagram_post_id?: string | null
          is_fully_scraped?: boolean | null
          is_published?: boolean | null
          is_sold?: boolean | null
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          published_to_facebook?: boolean | null
          published_to_instagram?: boolean | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
          wistia_hash_id?: string | null
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          centris_id?: string
          centris_url?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          facebook_post_id?: string | null
          id?: string
          images?: string[] | null
          instagram_post_id?: string | null
          is_fully_scraped?: boolean | null
          is_published?: boolean | null
          is_sold?: boolean | null
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          published_to_facebook?: boolean | null
          published_to_instagram?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
          wistia_hash_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          broker_sync_url: string | null
          company_name: string | null
          created_at: string
          facebook_access_token: string | null
          facebook_page_id: string | null
          facebook_post_example: string | null
          facebook_post_template: string | null
          first_name: string | null
          id: string
          instagram_access_token: string | null
          instagram_user_id: string | null
          last_name: string | null
          last_sync_timestamp: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          broker_sync_url?: string | null
          company_name?: string | null
          created_at?: string
          facebook_access_token?: string | null
          facebook_page_id?: string | null
          facebook_post_example?: string | null
          facebook_post_template?: string | null
          first_name?: string | null
          id: string
          instagram_access_token?: string | null
          instagram_user_id?: string | null
          last_name?: string | null
          last_sync_timestamp?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          broker_sync_url?: string | null
          company_name?: string | null
          created_at?: string
          facebook_access_token?: string | null
          facebook_page_id?: string | null
          facebook_post_example?: string | null
          facebook_post_template?: string | null
          first_name?: string | null
          id?: string
          instagram_access_token?: string | null
          instagram_user_id?: string | null
          last_name?: string | null
          last_sync_timestamp?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      slideshow_configs: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          music_url: string | null
          music_volume: number | null
          show_address: boolean
          show_agent: boolean
          show_details: boolean
          show_price: boolean
          template: string
          transition_duration: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          music_url?: string | null
          music_volume?: number | null
          show_address?: boolean
          show_agent?: boolean
          show_details?: boolean
          show_price?: boolean
          template?: string
          transition_duration?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          music_url?: string | null
          music_volume?: number | null
          show_address?: boolean
          show_agent?: boolean
          show_details?: boolean
          show_price?: boolean
          template?: string
          transition_duration?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slideshow_configs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      slideshow_renders: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          render_id: string | null
          status: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          render_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          render_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slideshow_renders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      sold_banner_renders: {
        Row: {
          banner_type: string
          created_at: string
          id: string
          image_url: string | null
          listing_id: string
          render_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          banner_type?: string
          created_at?: string
          id?: string
          image_url?: string | null
          listing_id: string
          render_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          banner_type?: string
          created_at?: string
          id?: string
          image_url?: string | null
          listing_id?: string
          render_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sold_banner_renders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_statistics: {
        Row: {
          banner_generations: number
          created_at: string
          description_generations: number
          facebook_generations: number
          id: string
          instagram_generations: number
          slideshow_generations: number
          updated_at: string
          user_id: string
        }
        Insert: {
          banner_generations?: number
          created_at?: string
          description_generations?: number
          facebook_generations?: number
          id?: string
          instagram_generations?: number
          slideshow_generations?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          banner_generations?: number
          created_at?: string
          description_generations?: number
          facebook_generations?: number
          id?: string
          instagram_generations?: number
          slideshow_generations?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      wistia_configs: {
        Row: {
          created_at: string
          id: string
          name: string
          show_address: boolean
          show_agent: boolean
          show_details: boolean
          show_price: boolean
          template: string
          transition_duration: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          show_address?: boolean
          show_agent?: boolean
          show_details?: boolean
          show_price?: boolean
          template?: string
          transition_duration?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          show_address?: boolean
          show_agent?: boolean
          show_details?: boolean
          show_price?: boolean
          template?: string
          transition_duration?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wistia_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_usage_statistic: {
        Args: { statistic_type: string; user_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "user"
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
      user_role: ["admin", "user"],
    },
  },
} as const
