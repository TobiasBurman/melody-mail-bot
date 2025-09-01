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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      campaign_results: {
        Row: {
          campaign_id: string
          created_at: string
          error_message: string | null
          id: string
          opened_at: string | null
          organization_id: string
          replied_at: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          organization_id: string
          replied_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          organization_id?: string
          replied_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          opened_count: number
          replied_count: number
          sent_count: number
          status: string
          subject: string
          target_industry: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          opened_count?: number
          replied_count?: number
          sent_count?: number
          status?: string
          subject: string
          target_industry: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          opened_count?: number
          replied_count?: number
          sent_count?: number
          status?: string
          subject?: string
          target_industry?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_files: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          industry: string
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          industry: string
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          industry?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          company_size: string | null
          contact_person: string | null
          created_at: string
          email: string
          id: string
          industry: string
          location: string | null
          name: string
          notes: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          company_size?: string | null
          contact_person?: string | null
          created_at?: string
          email: string
          id?: string
          industry: string
          location?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_size?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string
          location?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          audio_url: string | null
          client: string | null
          completion_date: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          industry: string | null
          project_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          client?: string | null
          completion_date?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          industry?: string | null
          project_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          client?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          industry?: string | null
          project_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
