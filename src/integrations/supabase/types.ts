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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          estimated_quantity: number | null
          followed_up_by: string | null
          id: string
          jersey_type: string | null
          name: string
          notes: string | null
          organisation: string | null
          phone: string
          status: Database["public"]["Enums"]["enquiry_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_quantity?: number | null
          followed_up_by?: string | null
          id?: string
          jersey_type?: string | null
          name: string
          notes?: string | null
          organisation?: string | null
          phone: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_quantity?: number | null
          followed_up_by?: string | null
          id?: string
          jersey_type?: string | null
          name?: string
          notes?: string | null
          organisation?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
        }
        Relationships: []
      }
      follow_up_reminders: {
        Row: {
          contact_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_completed: boolean
          title: string
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_reminders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_sequences: {
        Row: {
          id: string
          last_number: number
          month: number
          year: number
        }
        Insert: {
          id?: string
          last_number?: number
          month: number
          year: number
        }
        Update: {
          id?: string
          last_number?: number
          month?: number
          year?: number
        }
        Relationships: []
      }
      invoices_log: {
        Row: {
          account_number: string | null
          agent: string | null
          bank_name: string | null
          client_name: string | null
          client_phone: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          created_by_email: string | null
          customer_address: string | null
          delivery_term: string | null
          deposit_note: string | null
          design_items: Json
          id: string
          invoice_date: string | null
          invoice_number: string
          jersey_items: Json
          lock_deposit_amount: number
          manager_name: string | null
          manager_title: string | null
          material: string | null
          notes: string | null
          payment_term: string | null
          project_title: string | null
          shirt_deposit_custom: number
          shirt_deposit_enabled: boolean
          shirt_deposit_mode: string
          shirt_deposit_percent: number
          status: string
          title: string | null
          total_amount: number | null
          validity: string | null
        }
        Insert: {
          account_number?: string | null
          agent?: string | null
          bank_name?: string | null
          client_name?: string | null
          client_phone?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          customer_address?: string | null
          delivery_term?: string | null
          deposit_note?: string | null
          design_items?: Json
          id?: string
          invoice_date?: string | null
          invoice_number: string
          jersey_items?: Json
          lock_deposit_amount?: number
          manager_name?: string | null
          manager_title?: string | null
          material?: string | null
          notes?: string | null
          payment_term?: string | null
          project_title?: string | null
          shirt_deposit_custom?: number
          shirt_deposit_enabled?: boolean
          shirt_deposit_mode?: string
          shirt_deposit_percent?: number
          status?: string
          title?: string | null
          total_amount?: number | null
          validity?: string | null
        }
        Update: {
          account_number?: string | null
          agent?: string | null
          bank_name?: string | null
          client_name?: string | null
          client_phone?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          customer_address?: string | null
          delivery_term?: string | null
          deposit_note?: string | null
          design_items?: Json
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          jersey_items?: Json
          lock_deposit_amount?: number
          manager_name?: string | null
          manager_title?: string | null
          material?: string | null
          notes?: string | null
          payment_term?: string | null
          project_title?: string | null
          shirt_deposit_custom?: number
          shirt_deposit_enabled?: boolean
          shirt_deposit_mode?: string
          shirt_deposit_percent?: number
          status?: string
          title?: string | null
          total_amount?: number | null
          validity?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          created_by: string | null
          date: string | null
          id: string
          leads_from: string | null
          name: string
          note: string | null
          number_of_pcs: number | null
          phone: string | null
          purchase_amount: number | null
          stage: Database["public"]["Enums"]["lead_stage"]
          type_of_custom: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date?: string | null
          id?: string
          leads_from?: string | null
          name?: string
          note?: string | null
          number_of_pcs?: number | null
          phone?: string | null
          purchase_amount?: number | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          type_of_custom?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string | null
          id?: string
          leads_from?: string | null
          name?: string
          note?: string | null
          number_of_pcs?: number | null
          phone?: string | null
          purchase_amount?: number | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          type_of_custom?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      monthly_targets: {
        Row: {
          created_at: string
          id: string
          month: number
          target_amount: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          target_amount?: number
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          target_amount?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          order_number: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_number: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          option_type: string
          option_value: string
          price_delta: number
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          option_type: string
          option_value: string
          price_delta?: number
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          option_type?: string
          option_value?: string
          price_delta?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          images: string[]
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          images?: string[]
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          images?: string[]
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          salesperson_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          salesperson_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          salesperson_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"]
          total_amount: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          quote_number: string
          status?: Database["public"]["Enums"]["quote_status"]
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_entries: {
        Row: {
          activity_today: string | null
          created_at: string
          created_by: string | null
          energy_level: string | null
          entry_date: string
          id: string
          jersey_type: string | null
          job_name: string | null
          new_leads: number
          orders_closed: number
          price_per_pc: number | null
          prospects_contacted: number
          quantity: number | null
          quotations_sent: number
          revenue_closed: number
          salesperson: string
          updated_at: string
        }
        Insert: {
          activity_today?: string | null
          created_at?: string
          created_by?: string | null
          energy_level?: string | null
          entry_date: string
          id?: string
          jersey_type?: string | null
          job_name?: string | null
          new_leads?: number
          orders_closed?: number
          price_per_pc?: number | null
          prospects_contacted?: number
          quantity?: number | null
          quotations_sent?: number
          revenue_closed?: number
          salesperson: string
          updated_at?: string
        }
        Update: {
          activity_today?: string | null
          created_at?: string
          created_by?: string | null
          energy_level?: string | null
          entry_date?: string
          id?: string
          jersey_type?: string | null
          job_name?: string | null
          new_leads?: number
          orders_closed?: number
          price_per_pc?: number | null
          prospects_contacted?: number
          quantity?: number | null
          quotations_sent?: number
          revenue_closed?: number
          salesperson?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          created_at: string
          display_order: number
          fee: number
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          states: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          fee?: number
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          states?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          fee?: number
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          states?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      shop_order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          selected_options: Json
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total?: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          selected_options?: Json
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          selected_options?: Json
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          order_number: string
          payment_status: string
          shipping_address: string
          shipping_fee: number
          status: string
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          order_number: string
          payment_status?: string
          shipping_address: string
          shipping_fee?: number
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: string
          shipping_address?: string
          shipping_fee?: number
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_shop_order_number: { Args: never; Returns: string }
      get_next_invoice_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_invoice_sequence: {
        Args: {
          target_last_number: number
          target_month: number
          target_year: number
        }
        Returns: {
          id: string
          last_number: number
          month: number
          year: number
        }
        SetofOptions: {
          from: "*"
          to: "invoice_sequences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "user" | "superadmin"
      enquiry_status: "new" | "contacted" | "converted" | "closed"
      lead_stage: "cold" | "prospect" | "first_buy"
      order_status:
        | "pending"
        | "in_production"
        | "completed"
        | "delivered"
        | "cancelled"
      quote_status: "draft" | "sent" | "accepted" | "rejected"
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
      app_role: ["admin", "user", "superadmin"],
      enquiry_status: ["new", "contacted", "converted", "closed"],
      lead_stage: ["cold", "prospect", "first_buy"],
      order_status: [
        "pending",
        "in_production",
        "completed",
        "delivered",
        "cancelled",
      ],
      quote_status: ["draft", "sent", "accepted", "rejected"],
    },
  },
} as const
