export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          phone: string | null
          updated_at: string
        }
        Insert: {
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
          phone?: string | null
          updated_at?: string
        }
        Update: {
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
