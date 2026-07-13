import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from models import OrderStatus, UserRole


# ─── Auth ────────────────────────────────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ─── Category ────────────────────────────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryOut(CategoryBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Product ─────────────────────────────────────────────────────────────────

class ProductImageOut(BaseModel):
    id: uuid.UUID
    url: str
    alt_text: Optional[str] = None
    is_primary: bool
    is_hover: bool
    sort_order: int

    model_config = {"from_attributes": True}


class ProductVariantOut(BaseModel):
    id: uuid.UUID
    size: Optional[str] = None
    color: Optional[str] = None
    color_hex: Optional[str] = None
    sku: Optional[str] = None
    stock: int
    price_modifier: float
    is_active: bool

    model_config = {"from_attributes": True}


class ProductVariantCreate(BaseModel):
    size: Optional[str] = None
    color: Optional[str] = None
    color_hex: Optional[str] = None
    sku: Optional[str] = None
    stock: int = 0
    price_modifier: float = 0
    is_active: bool = True


class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None
    category_id: Optional[uuid.UUID] = None
    tags: Optional[list[str]] = None
    is_published: bool = False
    is_featured: bool = False
    is_new_arrival: bool = False
    low_stock_threshold: int = 5
    size_guide: Optional[str] = None
    shipping_info: Optional[str] = None
    return_policy: Optional[str] = None


class ProductCreate(ProductBase):
    variants: Optional[list[ProductVariantCreate]] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    category_id: Optional[uuid.UUID] = None
    tags: Optional[list[str]] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    low_stock_threshold: Optional[int] = None
    size_guide: Optional[str] = None
    shipping_info: Optional[str] = None
    return_policy: Optional[str] = None


class ProductOut(ProductBase):
    id: uuid.UUID
    total_stock: int
    category: Optional[CategoryOut] = None
    images: list[ProductImageOut] = []
    variants: list[ProductVariantOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    price: float
    compare_at_price: Optional[float] = None
    total_stock: int
    is_published: bool
    is_featured: bool
    is_new_arrival: bool
    category: Optional[CategoryOut] = None
    images: list[ProductImageOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Order ───────────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    product_name: str
    variant_size: Optional[str] = None
    variant_color: Optional[str] = None
    quantity: int
    unit_price: float
    image_url: Optional[str] = None


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: Optional[EmailStr] = None
    customer_phone: str
    delivery_address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    notes: Optional[str] = None
    items: list[OrderItemCreate]


class OrderItemOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    variant_size: Optional[str] = None
    variant_color: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: uuid.UUID
    order_number: str
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: str
    delivery_address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    subtotal: float
    shipping_cost: float
    total: float
    status: OrderStatus
    notes: Optional[str] = None
    whatsapp_sent: bool
    items: list[OrderItemOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ─── Lookbook ────────────────────────────────────────────────────────────────

class HotspotCreate(BaseModel):
    product_id: uuid.UUID
    x_percent: float
    y_percent: float


class HotspotOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    x_percent: float
    y_percent: float
    product: Optional[ProductListOut] = None

    model_config = {"from_attributes": True}


class LookbookImageCreate(BaseModel):
    url: str
    alt_text: Optional[str] = None
    sort_order: int = 0
    layout_size: str = "medium"


class LookbookImageOut(BaseModel):
    id: uuid.UUID
    url: str
    alt_text: Optional[str] = None
    sort_order: int
    layout_size: str
    hotspots: list[HotspotOut] = []

    model_config = {"from_attributes": True}


class LookbookCollectionBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    season: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_published: bool = False
    sort_order: int = 0


class LookbookCollectionCreate(LookbookCollectionBase):
    pass


class LookbookCollectionUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    season: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_published: Optional[bool] = None
    sort_order: Optional[int] = None


class LookbookCollectionOut(LookbookCollectionBase):
    id: uuid.UUID
    images: list[LookbookImageOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Hero Banners ────────────────────────────────────────────────────────────

class HeroBannerBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class HeroBannerCreate(HeroBannerBase):
    pass


class HeroBannerOut(HeroBannerBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Admin User ──────────────────────────────────────────────────────────────

class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.staff


class AdminUserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Upload ──────────────────────────────────────────────────────────────────

class UploadUrlRequest(BaseModel):
    filename: str
    content_type: str
    bucket: str = "product-images"


class UploadUrlResponse(BaseModel):
    upload_url: str
    public_url: str
    path: str


# ─── Stats ───────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_orders: int
    pending_orders: int
    total_products: int
    low_stock_products: int
    revenue_this_month: float
    orders_today: int
