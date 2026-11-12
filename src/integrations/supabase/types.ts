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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_user: {
        Row: {
          created_at: string
          email: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          name?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          product_id: number
          quantity_committed: number
          quantity_on_hand: number
          updated_at: string
        }
        Insert: {
          product_id: number
          quantity_committed?: number
          quantity_on_hand?: number
          updated_at?: string
        }
        Update: {
          product_id?: number
          quantity_committed?: number
          quantity_on_hand?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "staff_inventory"
            referencedColumns: ["product_id"]
          },
        ]
      }
      order_item: {
        Row: {
          order_id: number
          order_item_id: number
          product_id: number
          quantity: number
          unit_price: number
        }
        Insert: {
          order_id: number
          order_item_id?: never
          product_id: number
          quantity: number
          unit_price: number
        }
        Update: {
          order_id?: number
          order_item_id?: never
          product_id?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_overview"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_item_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_order"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "staff_inventory"
            referencedColumns: ["product_id"]
          },
        ]
      }
      payment: {
        Row: {
          amount: number
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          entered_at: string
          entered_by: string
          is_cancelled: boolean
          kind: Database["public"]["Enums"]["payment_kind"]
          method: string
          order_id: number
          order_item_id: number | null
          payment_id: number
          quantity: number | null
          reason: Database["public"]["Enums"]["refund_reason"] | null
          transacted_at: string
        }
        Insert: {
          amount: number
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          entered_at?: string
          entered_by: string
          is_cancelled?: boolean
          kind: Database["public"]["Enums"]["payment_kind"]
          method?: string
          order_id: number
          order_item_id?: number | null
          payment_id?: never
          quantity?: number | null
          reason?: Database["public"]["Enums"]["refund_reason"] | null
          transacted_at?: string
        }
        Update: {
          amount?: number
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          entered_at?: string
          entered_by?: string
          is_cancelled?: boolean
          kind?: Database["public"]["Enums"]["payment_kind"]
          method?: string
          order_id?: number
          order_item_id?: number | null
          payment_id?: never
          quantity?: number | null
          reason?: Database["public"]["Enums"]["refund_reason"] | null
          transacted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_overview"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payment_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_order"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payment_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_item"
            referencedColumns: ["order_item_id"]
          },
        ]
      }
      product: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          is_active: boolean
          name: string
          order_unit: number
          product_code: string
          product_id: number
          safety_stock: number
          specification: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          is_active?: boolean
          name: string
          order_unit: number
          product_code: string
          product_id?: never
          safety_stock?: number
          specification?: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          is_active?: boolean
          name?: string
          order_unit?: number
          product_code?: string
          product_id?: never
          safety_stock?: number
          specification?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      production_log: {
        Row: {
          operator_id: string
          produced_at: string
          product_id: number
          production_id: number
          quantity: number
          recorded_at: string
        }
        Insert: {
          operator_id: string
          produced_at: string
          product_id: number
          production_id?: never
          quantity: number
          recorded_at?: string
        }
        Update: {
          operator_id?: string
          produced_at?: string
          product_id?: number
          production_id?: never
          quantity?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_log_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "production_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "staff_inventory"
            referencedColumns: ["product_id"]
          },
        ]
      }
      purchase_order: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          order_id: number
          ordered_at: string
          retailer_id: number
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          order_id?: never
          ordered_at?: string
          retailer_id: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          order_id?: never
          ordered_at?: string
          retailer_id?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchase_order_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailer"
            referencedColumns: ["retailer_id"]
          },
        ]
      }
      retailer: {
        Row: {
          address: string
          anonymized_at: string | null
          company_name: string
          consented_at: string
          contact_person: string
          created_at: string
          decided_at: string | null
          phone: string
          retailer_id: number
          status: Database["public"]["Enums"]["retailer_status"]
          user_id: string
        }
        Insert: {
          address: string
          anonymized_at?: string | null
          company_name: string
          consented_at: string
          contact_person: string
          created_at?: string
          decided_at?: string | null
          phone: string
          retailer_id?: never
          status?: Database["public"]["Enums"]["retailer_status"]
          user_id: string
        }
        Update: {
          address?: string
          anonymized_at?: string | null
          company_name?: string
          consented_at?: string
          contact_person?: string
          created_at?: string
          decided_at?: string | null
          phone?: string
          retailer_id?: never
          status?: Database["public"]["Enums"]["retailer_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "app_user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shipment: {
        Row: {
          order_id: number
          recorded_at: string
          recorded_by: string
          shipment_id: number
          shipped_at: string
          tracking_ref: string
        }
        Insert: {
          order_id: number
          recorded_at?: string
          recorded_by: string
          shipment_id?: never
          shipped_at: string
          tracking_ref?: string
        }
        Update: {
          order_id?: number
          recorded_at?: string
          recorded_by?: string
          shipment_id?: never
          shipped_at?: string
          tracking_ref?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "order_overview"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "shipment_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "purchase_order"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "shipment_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stock_adjustment: {
        Row: {
          adjustment_id: number
          counted_quantity: number | null
          created_at: string
          created_by: string
          order_item_id: number | null
          product_id: number
          quantity_delta: number
          reason: string
          reason_type: Database["public"]["Enums"]["adjustment_reason"]
        }
        Insert: {
          adjustment_id?: never
          counted_quantity?: number | null
          created_at?: string
          created_by: string
          order_item_id?: number | null
          product_id: number
          quantity_delta: number
          reason: string
          reason_type: Database["public"]["Enums"]["adjustment_reason"]
        }
        Update: {
          adjustment_id?: never
          counted_quantity?: number | null
          created_at?: string
          created_by?: string
          order_item_id?: number | null
          product_id?: number
          quantity_delta?: number
          reason?: string
          reason_type?: Database["public"]["Enums"]["adjustment_reason"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "stock_adjustment_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_item"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "stock_adjustment_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_adjustment_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "staff_inventory"
            referencedColumns: ["product_id"]
          },
        ]
      }
    }
    Views: {
      order_overview: {
        Row: {
          cancel_reason: string | null
          company_name: string | null
          order_id: number | null
          ordered_at: string | null
          paid_amount: number | null
          refund_needed: boolean | null
          refunded_amount: number | null
          retailer_id: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number | null
          unpaid_flag: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailer"
            referencedColumns: ["retailer_id"]
          },
        ]
      }
      staff_inventory: {
        Row: {
          category: Database["public"]["Enums"]["product_category"] | null
          is_active: boolean | null
          name: string | null
          orderable: number | null
          product_code: string | null
          product_id: number | null
          quantity_committed: number | null
          quantity_on_hand: number | null
          safety_stock: number | null
          updated_at: string | null
          warn_orderable_zero: boolean | null
          warn_reserve_in_use: boolean | null
        }
        Relationships: []
      }
      stock_history: {
        Row: {
          actor: string | null
          change: number | null
          happened_at: string | null
          kind: string | null
          product_id: number | null
          reason: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      adjust_stock: {
        Args: {
          p_counted_quantity?: number
          p_order_item_id?: number
          p_product_id: number
          p_quantity_delta?: number
          p_reason: string
          p_reason_type: Database["public"]["Enums"]["adjustment_reason"]
        }
        Returns: number
      }
      cancel_order: {
        Args: { p_order_id: number; p_reason?: string }
        Returns: undefined
      }
      cancel_payment: {
        Args: { p_payment_id: number; p_reason: string }
        Returns: undefined
      }
      cancel_refund: {
        Args: { p_payment_id: number; p_reason: string }
        Returns: undefined
      }
      catalogue: {
        Args: never
        Returns: {
          category: Database["public"]["Enums"]["product_category"]
          name: string
          order_unit: number
          orderable_boxes: number
          product_code: string
          product_id: number
          specification: string
          unit_price: number
        }[]
      }
      check_invariants: {
        Args: never
        Returns: {
          check_name: string
          detail: string
        }[]
      }
      close_retailer: { Args: { p_retailer_id: number }; Returns: undefined }
      confirm_payment: {
        Args: {
          p_amount: number
          p_method: string
          p_order_id: number
          p_transacted_at?: string
        }
        Returns: number
      }
      create_product: {
        Args: {
          p_category: Database["public"]["Enums"]["product_category"]
          p_code: string
          p_name: string
          p_order_unit: number
          p_safety_stock: number
          p_specification: string
          p_unit_price: number
        }
        Returns: number
      }
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      decide_registration: {
        Args: { p_approve: boolean; p_retailer_id: number }
        Returns: undefined
      }
      is_staff: { Args: never; Returns: boolean }
      my_retailer_id: { Args: never; Returns: number }
      place_order: { Args: { p_lines: Json }; Returns: number }
      record_production: {
        Args: {
          p_produced_at?: string
          p_product_id: number
          p_quantity: number
        }
        Returns: number
      }
      record_refund: {
        Args: {
          p_amount?: number
          p_method: string
          p_order_id: number
          p_order_item_id?: number
          p_quantity?: number
          p_reason: Database["public"]["Enums"]["refund_reason"]
          p_transacted_at?: string
        }
        Returns: number
      }
      register_retailer: {
        Args: {
          p_address: string
          p_company: string
          p_consent: boolean
          p_contact: string
          p_phone: string
        }
        Returns: number
      }
      require_active_retailer: { Args: never; Returns: number }
      require_staff: { Args: never; Returns: string }
      seoul_today: { Args: never; Returns: string }
      set_product_active: {
        Args: { p_active: boolean; p_product_id: number }
        Returns: undefined
      }
      ship_order: {
        Args: { p_order_id: number; p_tracking_ref?: string }
        Returns: number
      }
      summary: {
        Args: { p_from: string; p_grain: string; p_to: string }
        Returns: {
          net_amount: number
          order_amount: number
          order_count: number
          paid_amount: number
          period_start: string
          refund_amount: number
          shipped_boxes: number
        }[]
      }
      update_product: {
        Args: {
          p_category: Database["public"]["Enums"]["product_category"]
          p_name: string
          p_order_unit: number
          p_product_id: number
          p_safety_stock: number
          p_specification: string
          p_unit_price: number
        }
        Returns: undefined
      }
      update_retailer: {
        Args: {
          p_address: string
          p_company: string
          p_contact: string
          p_phone: string
          p_retailer_id: number
        }
        Returns: undefined
      }
    }
    Enums: {
      adjustment_reason:
        | "LOSS"
        | "DAMAGE"
        | "MISCOUNT"
        | "FOUND"
        | "CORRECTION"
        | "RETURN"
      order_status:
        | "PENDING_PAYMENT"
        | "READY_TO_SHIP"
        | "SHIPPED"
        | "CANCELLED"
      payment_kind: "PAYMENT" | "REFUND"
      product_category: "CUP" | "LID" | "CONTAINER" | "SLEEVE" | "OTHER"
      refund_reason:
        | "ORDER_CANCELLED"
        | "RETURN"
        | "TRANSIT_ISSUE"
        | "OVERCHARGE"
      retailer_status: "PENDING" | "ACTIVE" | "REJECTED" | "CLOSED"
      user_role: "RETAILER" | "STAFF"
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
      adjustment_reason: [
        "LOSS",
        "DAMAGE",
        "MISCOUNT",
        "FOUND",
        "CORRECTION",
        "RETURN",
      ],
      order_status: [
        "PENDING_PAYMENT",
        "READY_TO_SHIP",
        "SHIPPED",
        "CANCELLED",
      ],
      payment_kind: ["PAYMENT", "REFUND"],
      product_category: ["CUP", "LID", "CONTAINER", "SLEEVE", "OTHER"],
      refund_reason: [
        "ORDER_CANCELLED",
        "RETURN",
        "TRANSIT_ISSUE",
        "OVERCHARGE",
      ],
      retailer_status: ["PENDING", "ACTIVE", "REJECTED", "CLOSED"],
      user_role: ["RETAILER", "STAFF"],
    },
  },
} as const
