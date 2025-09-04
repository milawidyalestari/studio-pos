export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          code: string
          category_name: string
          group_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          category_name: string
          group_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          category_name?: string
          group_name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          kode: string
          nama: string
          email: string
          whatsapp: string
          address: string
          level: 'Regular' | 'VIP' | 'Premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kode: string
          nama: string
          email: string
          whatsapp: string
          address: string
          level?: 'Regular' | 'VIP' | 'Premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kode?: string
          nama?: string
          email?: string
          whatsapp?: string
          address?: string
          level?: 'Regular' | 'VIP' | 'Premium'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          name: string
          email: string
          position: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          position: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          position?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: string
          material_id: string
          tanggal: string
          tipe_mutasi: string
          jumlah: number
          keterangan: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          material_id: string
          tanggal: string
          tipe_mutasi: string
          jumlah: number
          keterangan: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          material_id?: string
          tanggal?: string
          tipe_mutasi?: string
          jumlah?: number
          keterangan?: string
          user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          }
        ]
      }
      materials: {
        Row: {
          id: string
          kode: string
          nama: string
          kategori: string | null
          stok_akhir: number | null
          stok_aktif: boolean
          stok_minimum: number | null
          stok_keluar: number | null
          stok_opname: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kode: string
          nama: string
          kategori?: string | null
          stok_akhir?: number | null
          stok_aktif?: boolean
          stok_minimum?: number | null
          stok_keluar?: number | null
          stok_opname?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kode?: string
          nama?: string
          kategori?: string | null
          stok_akhir?: number | null
          stok_aktif?: boolean
          stok_minimum?: number | null
          stok_keluar?: number | null
          stok_opname?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          message: string
          type: 'order_created' | 'order_deleted' | 'order_updated' | 'order_processing' | 'order_completed'
          order_id: string | null
          user_name: string
          timestamp: string
          is_read: boolean
          order_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          message: string
          type: 'order_created' | 'order_deleted' | 'order_updated' | 'order_processing' | 'order_completed'
          order_id?: string | null
          user_name: string
          timestamp?: string
          is_read?: boolean
          order_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          message?: string
          type?: 'order_created' | 'order_deleted' | 'order_updated' | 'order_processing' | 'order_completed'
          order_id?: string | null
          user_name?: string
          timestamp?: string
          is_read?: boolean
          order_data?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          item_id: string | null
          bahan: string | null
          item_name: string
          panjang: number | null
          lebar: number | null
          quantity: number
          finishing: string | null
          sub_total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          item_id?: string | null
          bahan?: string | null
          item_name: string
          panjang?: number | null
          lebar?: number | null
          quantity: number
          finishing?: string | null
          sub_total: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          item_id?: string | null
          bahan?: string | null
          item_name?: string
          panjang?: number | null
          lebar?: number | null
          quantity?: number
          finishing?: string | null
          sub_total?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      order_statuses: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          tanggal: string
          waktu: string | null
          estimasi: string | null
          estimasi_waktu: string | null
          outdoor: boolean
          laser_printing: boolean
          mug_nota: boolean
          jasa_desain: number
          biaya_lain: number
          sub_total: number
          discount: number
          ppn: number
          total_amount: number
          payment_type: string | null
          bank: string | null
          admin_id: string | null
          desainer_id: string | null
          komputer: string | null
          notes: string | null
          status_id: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_name: string
          tanggal: string
          waktu?: string | null
          estimasi?: string | null
          estimasi_waktu?: string | null
          outdoor?: boolean
          laser_printing?: boolean
          mug_nota?: boolean
          jasa_desain?: number
          biaya_lain?: number
          sub_total?: number
          discount?: number
          ppn?: number
          total_amount?: number
          payment_type?: string | null
          bank?: string | null
          admin_id?: string | null
          desainer_id?: string | null
          komputer?: string | null
          notes?: string | null
          status_id?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_name?: string
          tanggal?: string
          waktu?: string | null
          estimasi?: string | null
          estimasi_waktu?: string | null
          outdoor?: boolean
          laser_printing?: boolean
          mug_nota?: boolean
          jasa_desain?: number
          biaya_lain?: number
          sub_total?: number
          discount?: number
          ppn?: number
          total_amount?: number
          payment_type?: string | null
          bank?: string | null
          admin_id?: string | null
          desainer_id?: string | null
          komputer?: string | null
          notes?: string | null
          status_id?: string | null
          updated_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
          }
        ]
      }
      payment_types: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_materials: {
        Row: {
          id: string
          product_id: string
          material_id: string
          quantity_per_unit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          material_id: string
          quantity_per_unit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          material_id?: string
          quantity_per_unit?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          kode: string
          nama: string
          kategori: string | null
          harga: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kode: string
          nama: string
          kategori?: string | null
          harga: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kode?: string
          nama?: string
          kategori?: string | null
          harga?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          kode: string
          nama: string
          email: string
          whatsapp: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kode: string
          nama: string
          email: string
          whatsapp: string
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kode?: string
          nama?: string
          email?: string
          whatsapp?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
