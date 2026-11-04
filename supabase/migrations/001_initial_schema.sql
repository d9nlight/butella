-- ==============================================================================
-- BUTELLA BOUTIQUE — PostgreSQL Schema & Security Policies
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    category TEXT NOT NULL,
    base_price INTEGER NOT NULL CHECK (base_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new_arrival BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by category, slug, and status
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (is_active);

-- 3. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);

-- 4. PRODUCT VARIANTS (Sizes, Colors, Inventory)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    sku TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'local', 'kazakhstan')),
    delivery_address TEXT,
    comment TEXT,
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    shipping_cost INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')),
    order_status TEXT NOT NULL DEFAULT 'NEW' CHECK (order_status IN ('NEW', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- 7. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'kaspi',
    transaction_id TEXT,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'PENDING',
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions (order_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 1. PRODUCTS:
-- Public can view active products
CREATE POLICY "Public can view active products" 
    ON public.products 
    FOR SELECT 
    USING (is_active = true OR auth.role() = 'authenticated');

-- Authenticated owner can insert, update, delete products
CREATE POLICY "Authenticated users can manage products" 
    ON public.products 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- 2. PRODUCT IMAGES:
CREATE POLICY "Public can view product images" 
    ON public.product_images 
    FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can manage product images" 
    ON public.product_images 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- 3. PRODUCT VARIANTS:
CREATE POLICY "Public can view product variants" 
    ON public.product_variants 
    FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can manage product variants" 
    ON public.product_variants 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- 4. ORDERS:
-- Private: Public cannot read or list orders. Only authenticated admin or service_role can view orders.
CREATE POLICY "Authenticated users can view orders" 
    ON public.orders 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders" 
    ON public.orders 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- 5. ORDER ITEMS:
CREATE POLICY "Authenticated users can view order items" 
    ON public.order_items 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- 6. PAYMENT TRANSACTIONS:
CREATE POLICY "Authenticated users can view payment transactions" 
    ON public.payment_transactions 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION
-- ==============================================================================
-- Insert the "products" storage bucket for photography
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Public can read, authenticated can upload and delete
CREATE POLICY "Public can read product photos" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product photos" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product photos" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'products' AND auth.role() = 'authenticated');
