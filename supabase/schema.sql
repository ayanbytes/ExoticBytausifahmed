-- ============================================================
-- EXOTIC Fashion E-Commerce — Supabase Schema
-- Run this in the Supabase SQL Editor to initialize your database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    image_url   VARCHAR(500),
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                 VARCHAR(200) NOT NULL,
    slug                 VARCHAR(220) UNIQUE NOT NULL,
    description          TEXT,
    price                NUMERIC(10, 2) NOT NULL,
    compare_at_price     NUMERIC(10, 2),
    category_id          UUID REFERENCES categories(id) ON DELETE SET NULL,
    tags                 JSONB DEFAULT '[]',
    is_published         BOOLEAN DEFAULT false,
    is_featured          BOOLEAN DEFAULT false,
    is_new_arrival       BOOLEAN DEFAULT false,
    total_stock          INTEGER DEFAULT 0,
    low_stock_threshold  INTEGER DEFAULT 5,
    size_guide           TEXT,
    shipping_info        TEXT,
    return_policy        TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Product Images ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    alt_text    VARCHAR(200),
    is_primary  BOOLEAN DEFAULT false,
    is_hover    BOOLEAN DEFAULT false,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Product Variants ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size            VARCHAR(50),
    color           VARCHAR(50),
    color_hex       VARCHAR(7),
    sku             VARCHAR(100),
    stock           INTEGER DEFAULT 0,
    price_modifier  NUMERIC(10, 2) DEFAULT 0,
    is_active       BOOLEAN DEFAULT true
);

-- ─── Admin Users ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email            VARCHAR(200) UNIQUE NOT NULL,
    hashed_password  VARCHAR(200) NOT NULL,
    full_name        VARCHAR(200),
    role             VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('staff', 'super_admin')),
    is_active        BOOLEAN DEFAULT true,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    last_login       TIMESTAMPTZ
);

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number      VARCHAR(20) UNIQUE NOT NULL,
    customer_name     VARCHAR(200) NOT NULL,
    customer_email    VARCHAR(200),
    customer_phone    VARCHAR(20) NOT NULL,
    delivery_address  TEXT NOT NULL,
    city              VARCHAR(100),
    state             VARCHAR(100),
    pincode           VARCHAR(10),
    subtotal          NUMERIC(10, 2) NOT NULL,
    shipping_cost     NUMERIC(10, 2) DEFAULT 0,
    total             NUMERIC(10, 2) NOT NULL,
    status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
    notes             TEXT,
    whatsapp_sent     BOOLEAN DEFAULT false,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Order Items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    UUID NOT NULL REFERENCES products(id),
    product_name  VARCHAR(200) NOT NULL,
    variant_size  VARCHAR(50),
    variant_color VARCHAR(50),
    quantity      INTEGER NOT NULL,
    unit_price    NUMERIC(10, 2) NOT NULL,
    total_price   NUMERIC(10, 2) NOT NULL,
    image_url     VARCHAR(500)
);

-- ─── Lookbook Collections ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lookbook_collections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) UNIQUE NOT NULL,
    description     TEXT,
    season          VARCHAR(100),
    cover_image_url VARCHAR(500),
    is_published    BOOLEAN DEFAULT false,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Lookbook Images ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lookbook_images (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id   UUID NOT NULL REFERENCES lookbook_collections(id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL,
    alt_text        VARCHAR(200),
    sort_order      INTEGER DEFAULT 0,
    layout_size     VARCHAR(20) DEFAULT 'medium' CHECK (layout_size IN ('small','medium','large','full'))
);

-- ─── Lookbook Hotspots ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lookbook_hotspots (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id    UUID NOT NULL REFERENCES lookbook_images(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id),
    x_percent   NUMERIC(5, 2) NOT NULL,
    y_percent   NUMERIC(5, 2) NOT NULL
);

-- ─── Hero Banners ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_banners (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(200) NOT NULL,
    subtitle    VARCHAR(500),
    cta_text    VARCHAR(100),
    cta_link    VARCHAR(200),
    image_url   VARCHAR(500),
    video_url   VARCHAR(500),
    is_active   BOOLEAN DEFAULT true,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Seed: Default Hero Banner ────────────────────────────────────────────────
INSERT INTO hero_banners (title, subtitle, cta_text, cta_link, is_active, sort_order) VALUES
('New Season. New Story.', 'Explore the latest collection — where luxury meets the street.', 'Shop Now', '/shop', true, 0),
('Festive Edit ''26', 'Curated pieces for the moments that matter.', 'Explore Lookbook', '/lookbook', true, 1)
ON CONFLICT DO NOTHING;

-- ─── Seed: Categories ─────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
('Apparel', 'apparel', 'Premium fashion-forward clothing', 0, true),
('Accessories', 'accessories', 'Statement accessories to complete your look', 1, true),
('Footwear', 'footwear', 'Curated footwear for every occasion', 2, true),
('Bags', 'bags', 'Luxury bags and totes', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['products','categories','orders','lookbook_collections'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', tbl);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl);
  END LOOP;
END;
$$;

-- ─── Storage Buckets (run these if not created via dashboard) ─────────────────
-- Note: Bucket creation via SQL requires Supabase admin. Easier to create via dashboard.
-- Go to: Storage > New bucket > Name: "product-images", Public: ON
-- Also create: "lookbook-images" (Public: ON) and "category-images" (Public: ON)
