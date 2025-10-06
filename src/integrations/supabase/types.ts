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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_order_attachments: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          image_height: number | null
          image_width: number | null
          is_image: boolean | null
          job_order_id: string
          uploaded_by: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_image?: boolean | null
          job_order_id: string
          uploaded_by: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_image?: boolean | null
          job_order_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_order_attachments_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      job_order_comments: {
        Row: {
          comment: string
          created_at: string
          created_by: string
          id: string
          job_order_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          created_by: string
          id?: string
          job_order_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          created_by?: string
          id?: string
          job_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_order_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_order_comments_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      job_order_items: {
        Row: {
          created_at: string
          description: string
          id: string
          job_order_id: string
          job_title_id: string
          order_sequence: number
          quantity: number
          total_price: number | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          job_order_id: string
          job_title_id: string
          order_sequence?: number
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          job_order_id?: string
          job_title_id?: string
          order_sequence?: number
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      job_orders: {
        Row: {
          actual_hours: number | null
          approval_notes: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          assignee: string | null
          branch: string | null
          client_name: string | null
          created_at: string
          created_by: string
          customer_id: string
          delivered_at: string | null
          designer_id: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          invoice_number: string | null
          job_order_details: string | null
          job_order_number: string
          job_title_id: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          salesman_id: string | null
          status: Database["public"]["Enums"]["job_status"]
          total_value: number | null
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          assignee?: string | null
          branch?: string | null
          client_name?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          delivered_at?: string | null
          designer_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          invoice_number?: string | null
          job_order_details?: string | null
          job_order_number: string
          job_title_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          salesman_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          assignee?: string | null
          branch?: string | null
          client_name?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          delivered_at?: string | null
          designer_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          invoice_number?: string | null
          job_order_details?: string | null
          job_order_number?: string
          job_title_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          salesman_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_orders_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_orders_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_orders_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_orders_designer"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_orders_salesman"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_orders_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles: {
        Row: {
          created_at: string
          id: string
          job_title_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_title_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_title_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
        }
        Insert: {
          branch?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
        }
        Update: {
          branch?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          description: string
          id: string
          job_title_id: string
          order_sequence: number
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          job_title_id: string
          order_sequence?: number
          quantity?: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          description?: string
          id?: string
          job_title_id?: string
          order_sequence?: number
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: []
      }
      quotations: {
        Row: {
          converted_to_job_order_id: string | null
          created_at: string
          created_by: string
          customer_id: string
          id: string
          notes: string | null
          quotation_number: string
          salesman_id: string
          status: Database["public"]["Enums"]["quotation_status"]
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          converted_to_job_order_id?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          id?: string
          notes?: string | null
          quotation_number: string
          salesman_id: string
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          converted_to_job_order_id?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          notes?: string | null
          quotation_number?: string
          salesman_id?: string
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_quotation_to_job_order: {
        Args: { quotation_id_param: string }
        Returns: string
      }
      generate_job_order_number: {
        Args: { branch: string }
        Returns: string
      }
      generate_quotation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "employee"
        | "designer"
        | "salesman"
        | "job_order_manager"
      job_status:
        | "pending"
        | "in-progress"
        | "designing"
        | "completed"
        | "finished"
        | "cancelled"
        | "invoiced"
      priority_level: "low" | "medium" | "high" | "urgent"
      quotation_status: "draft" | "sent" | "accepted" | "rejected" | "converted"
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
      app_role: [
        "admin",
        "manager",
        "employee",
        "designer",
        "salesman",
        "job_order_manager",
      ],
      job_status: [
        "pending",
        "in-progress",
        "designing",
        "completed",
        "finished",
        "cancelled",
        "invoiced",
      ],
      priority_level: ["low", "medium", "high", "urgent"],
      quotation_status: ["draft", "sent", "accepted", "rejected", "converted"],
    },
  },
} as const
