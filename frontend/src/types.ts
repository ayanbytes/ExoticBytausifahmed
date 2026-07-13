// ─── Shared Types ────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  is_hover: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  color_hex?: string;
  sku?: string;
  stock: number;
  price_modifier: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  category?: Category;
  tags?: string[];
  is_published: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  total_stock: number;
  low_stock_threshold: number;
  size_guide?: string;
  shipping_info?: string;
  return_policy?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductListItem extends Omit<Product, 'variants' | 'description' | 'size_guide' | 'shipping_info' | 'return_policy'> {}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_size?: string;
  variant_color?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  delivery_address: string;
  city?: string;
  state?: string;
  pincode?: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  whatsapp_sent: boolean;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface LookbookHotspot {
  id: string;
  product_id: string;
  x_percent: number;
  y_percent: number;
  product?: ProductListItem;
}

export interface LookbookImage {
  id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  layout_size: 'small' | 'medium' | 'large' | 'full';
  hotspots: LookbookHotspot[];
}

export interface LookbookCollection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  season?: string;
  cover_image_url?: string;
  is_published: boolean;
  sort_order: number;
  images: LookbookImage[];
  created_at: string;
}

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  total_products: number;
  low_stock_products: number;
  revenue_this_month: number;
  orders_today: number;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string; // unique cart item id = product.id + variant.id
  product_id: string;
  product_name: string;
  product_slug: string;
  variant_id?: string;
  variant_size?: string;
  variant_color?: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: 'staff' | 'super_admin';
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
