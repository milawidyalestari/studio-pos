export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          category_name: string
          code: string
          created_at: string
          group_name: string
          id: string
          updated_at: string
        }
        Insert: {
          category_name: string
          code: string
          created_at?: string
          group_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          category_name?: string
          code?: string
          created_at?: string
          group_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          kode: string
          level: Database["public"]["Enums"]["customer_level"] | null
          nama: string
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          kode: string
          level?: Database["public"]["Enums"]["customer_level"] | null
          nama: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          kode?: string
          level?: Database["public"]["Enums"]["customer_level"] | null
          nama?: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string | null
          id: string
          kode: string
          nama: string
          posisi: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kode: string
          nama: string
          posisi?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kode?: string
          nama?: string
          posisi?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: string;
          material_id: string;
          tanggal: string;
          tipe_mutasi: string;
          jumlah: number;
          keterangan: string | null;
          user_id: string | null;
        }
        Insert: {
          id?: string;
          material_id: string;
          tanggal?: string;
          tipe_mutasi: string;
          jumlah: number;
          keterangan?: string | null;
          user_id?: string | null;
        }
        Update: {
          id?: string;
          material_id?: string;
          tanggal?: string;
          tipe_mutasi?: string;
          jumlah?: number;
          keterangan?: string | null;
          user_id?: string | null;
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_material_id_fkey",
            columns: ["material_id"],
            isOneToOne: false,
            referencedRelation: "materials",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "employees",
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          bahan: string | null
          created_at: string | null
          description: string | null
          finishing: string | null
          id: string
          item_name: string
          lebar: number | null
          order_id: string | null
          panjang: number | null
          quantity: number
          sub_total: number | null
          unit_price: number | null
        }
        Insert: {
          bahan?: string | null
          created_at?: string | null
          description?: string | null
          finishing?: string | null
          id?: string
          item_name: string
          lebar?: number | null
          order_id?: string | null
          panjang?: number | null
          quantity: number
          sub_total?: number | null
          unit_price?: number | null
        }
        Update: {
          bahan?: string | null
          created_at?: string | null
          description?: string | null
          finishing?: string | null
          id?: string
          item_name?: string
          lebar?: number | null
          order_id?: string | null
          panjang?: number | null
          quantity?: number
          sub_total?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_statuses: {
        Row: {
          color: string | null
          created_at: string | null
          display_order: number
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          display_order: number
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          display_order?: number
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_id: string | null
          bank: string | null
          biaya_lain: number | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          desainer_id: string | null
          discount: number | null
          down_payment: number | null
          estimasi: string | null
          estimasi_waktu: string | null
          id: string
          jasa_desain: number | null
          komputer: string | null
          laser_printing: boolean | null
          mug_nota: boolean | null
          notes: string | null
          order_number: string
          outdoor: boolean | null
          payment_type: Database["public"]["Enums"]["payment_type"] | null
          ppn: number | null
          remaining_payment: number | null
          status_id: number | null
          sub_total: number | null
          tanggal: string
          total_amount: number | null
          updated_at: string | null
          waktu: string | null
        }
        Insert: {
          admin_id?: string | null
          bank?: string | null
          biaya_lain?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          desainer_id?: string | null
          discount?: number | null
          down_payment?: number | null
          estimasi?: string | null
          estimasi_waktu?: string | null
          id?: string
          jasa_desain?: number | null
          komputer?: string | null
          laser_printing?: boolean | null
          mug_nota?: boolean | null
          notes?: string | null
          order_number: string
          outdoor?: boolean | null
          payment_type?: Database["public"]["Enums"]["payment_type"] | null
          ppn?: number | null
          remaining_payment?: number | null
          status_id?: number | null
          sub_total?: number | null
          tanggal: string
          total_amount?: number | null
          updated_at?: string | null
          waktu?: string | null
        }
        Update: {
          admin_id?: string | null
          bank?: string | null
          biaya_lain?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          desainer_id?: string | null
          discount?: number | null
          down_payment?: number | null
          estimasi?: string | null
          estimasi_waktu?: string | null
          id?: string
          jasa_desain?: number | null
          komputer?: string | null
          laser_printing?: boolean | null
          mug_nota?: boolean | null
          notes?: string | null
          order_number?: string
          outdoor?: boolean | null
          payment_type?: Database["public"]["Enums"]["payment_type"] | null
          ppn?: number | null
          remaining_payment?: number | null
          status_id?: number | null
          sub_total?: number | null
          tanggal?: string
          total_amount?: number | null
          updated_at?: string | null
          waktu?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_desainer_id_fkey"
            columns: ["desainer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "order_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_types: {
        Row: {
          code: string
          created_at: string
          id: string
          payment_method: string
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          payment_method: string
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          payment_method?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          harga_beli: number | null
          harga_jual: number | null
          id: string
          jenis: string | null
          kode: string
          nama: string
          satuan: string | null
          stok_awal: number | null
          stok_keluar: number | null
          stok_masuk: number | null
          stok_minimum: number | null
          stok_opname: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          harga_beli?: number | null
          harga_jual?: number | null
          id?: string
          jenis?: string | null
          kode: string
          nama: string
          satuan?: string | null
          stok_awal?: number | null
          stok_keluar?: number | null
          stok_masuk?: number | null
          stok_minimum?: number | null
          stok_opname?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          harga_beli?: number | null
          harga_jual?: number | null
          id?: string
          jenis?: string | null
          kode?: string
          nama?: string
          satuan?: string | null
          stok_awal?: number | null
          stok_keluar?: number | null
          stok_masuk?: number | null
          stok_minimum?: number | null
          stok_opname?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_materials: {
        Row: {
          product_id: string;
          material_id: string;
        };
        Insert: {
          product_id: string;
          material_id: string;
        };
        Update: {
          product_id?: string;
          material_id?: string;
        };
        Relationships: [];
      },
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          outstanding_balance: number | null
          payment_terms: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          outstanding_balance?: number | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          outstanding_balance?: number | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          customer_name: string | null
          estimated_date: string | null
          id: string
          notes: string | null
          order_id: string | null
          payment_method: Database["public"]["Enums"]["payment_type"] | null
          status: string | null
          transaction_date: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          customer_name?: string | null
          estimated_date?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_type"] | null
          status?: string | null
          transaction_date: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          customer_name?: string | null
          estimated_date?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_type"] | null
          status?: string | null
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          id: string;
          kode: string;
          nama: string;
          satuan: string | null;
          lebar_maksimum: number;
          harga_per_meter: number;
          stok_awal: number | null;
          stok_masuk: number | null;
          stok_keluar: number | null;
          stok_akhir: number | null;
          stok_opname: number | null;
          stok_minimum: number;
          created_at: string | null;
          updated_at: string | null;
          stok_aktif: boolean;
          kategori: string | null;
        };
        Insert: {
          id?: string;
          kode: string;
          nama: string;
          satuan?: string | null;
          lebar_maksimum: number;
          harga_per_meter: number;
          stok_awal?: number | null;
          stok_masuk?: number | null;
          stok_keluar?: number | null;
          stok_akhir?: number | null;
          stok_opname?: number | null;
          stok_minimum?: number;
          created_at?: string | null;
          updated_at?: string | null;
          stok_aktif?: boolean;
          kategori?: string | null;
        };
        Update: {
          id?: string;
          kode?: string;
          nama?: string;
          satuan?: string | null;
          lebar_maksimum?: number;
          harga_per_meter?: number;
          stok_awal?: number | null;
          stok_masuk?: number | null;
          stok_keluar?: number | null;
          stok_akhir?: number | null;
          stok_opname?: number | null;
          stok_minimum?: number;
          created_at?: string | null;
          updated_at?: string | null;
          stok_aktif?: boolean;
          kategori?: string | null;
        };
        Relationships: [];
      },
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_customer_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      customer_level: "Regular" | "Premium" | "VIP"
      employee_status: "Active" | "Inactive"
      payment_type: "cash" | "transfer" | "credit"
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
      customer_level: ["Regular", "Premium", "VIP"],
      employee_status: ["Active", "Inactive"],
      payment_type: ["cash", "transfer", "credit"],
    },
  },
} as const
