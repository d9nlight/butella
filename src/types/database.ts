export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          category: string;
          base_price: number;
          is_active: boolean;
          is_featured: boolean;
          is_new_arrival: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string;
          category: string;
          base_price: number;
          is_active?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          category?: string;
          base_price?: number;
          is_active?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          sku: string | null;
          stock_quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          color: string;
          sku?: string | null;
          stock_quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string;
          color?: string;
          sku?: string | null;
          stock_quantity?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          customer_phone: string;
          delivery_method: string;
          delivery_address: string | null;
          comment: string | null;
          subtotal: number;
          shipping_cost: number;
          total_amount: number;
          payment_status: string;
          order_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_name: string;
          customer_phone: string;
          delivery_method: string;
          delivery_address?: string | null;
          comment?: string | null;
          subtotal: number;
          shipping_cost: number;
          total_amount: number;
          payment_status?: string;
          order_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_name?: string;
          customer_phone?: string;
          delivery_method?: string;
          delivery_address?: string | null;
          comment?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          total_amount?: number;
          payment_status?: string;
          order_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          size: string;
          color: string;
          price: number;
          quantity: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          size: string;
          color: string;
          price: number;
          quantity: number;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          variant_id?: string;
          product_name?: string;
          size?: string;
          color?: string;
          price?: number;
          quantity?: number;
          image_url?: string | null;
          created_at?: string;
        };
      };
      payment_transactions: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          transaction_id: string | null;
          amount: number;
          status: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider: string;
          transaction_id?: string | null;
          amount: number;
          status?: string;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          transaction_id?: string | null;
          amount?: number;
          status?: string;
          payload?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
