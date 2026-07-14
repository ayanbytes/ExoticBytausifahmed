from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[schemas.ProductListOut])
async def list_products(
    category: str | None = Query(None),
    search: str | None = Query(None),
    featured: bool | None = Query(None),
    new_arrival: bool | None = Query(None),
    published_only: bool = Query(True),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    sort: str = Query("newest"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(models.Product)
        .options(
            selectinload(models.Product.images),
            selectinload(models.Product.category),
        )
    )

    if published_only:
        query = query.where(models.Product.is_published == True)
    if featured is not None:
        query = query.where(models.Product.is_featured == featured)
    if new_arrival is not None:
        query = query.where(models.Product.is_new_arrival == new_arrival)
    if category:
        query = query.join(models.Category).where(models.Category.slug == category)
    if search:
        query = query.where(
            or_(
                models.Product.name.ilike(f"%{search}%"),
                models.Product.description.ilike(f"%{search}%"),
            )
        )
    if min_price is not None:
        query = query.where(models.Product.price >= min_price)
    if max_price is not None:
        query = query.where(models.Product.price <= max_price)

    if sort == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort == "popularity":
        query = query.order_by(models.Product.is_featured.desc(), models.Product.created_at.desc())
    else:
        query = query.order_by(models.Product.created_at.desc())

    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{slug}", response_model=schemas.ProductOut)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Product)
        .options(
            selectinload(models.Product.images),
            selectinload(models.Product.variants),
            selectinload(models.Product.category),
        )
        .where(models.Product.slug == slug)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ─── Admin endpoints ─────────────────────────────────────────────────────────

@router.post("", response_model=schemas.ProductOut, status_code=201)
async def create_product(
    data: schemas.ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    product = models.Product(
        name=data.name,
        slug=data.slug,
        description=data.description,
        price=data.price,
        compare_at_price=data.compare_at_price,
        category_id=data.category_id,
        tags=data.tags or [],
        is_published=data.is_published,
        is_featured=data.is_featured,
        is_new_arrival=data.is_new_arrival,
        total_stock=data.total_stock,
        low_stock_threshold=data.low_stock_threshold,
        size_guide=data.size_guide,
        shipping_info=data.shipping_info,
        return_policy=data.return_policy,
    )
    db.add(product)
    await db.flush()

    if data.variants:
        total_stock = 0
        for v in data.variants:
            variant = models.ProductVariant(product_id=product.id, **v.model_dump())
            db.add(variant)
            total_stock += v.stock
        product.total_stock = total_stock

    await db.commit()
    await db.refresh(product)

    result = await db.execute(
        select(models.Product)
        .options(
            selectinload(models.Product.images),
            selectinload(models.Product.variants),
            selectinload(models.Product.category),
        )
        .where(models.Product.id == product.id)
    )
    return result.scalar_one()


@router.put("/{product_id}", response_model=schemas.ProductOut)
async def update_product(
    product_id: str,
    data: schemas.ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(select(models.Product).where(models.Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in data.model_dump(exclude_none=True).items():
        setattr(product, key, value)

    await db.commit()
    await db.refresh(product)

    result = await db.execute(
        select(models.Product)
        .options(
            selectinload(models.Product.images),
            selectinload(models.Product.variants),
            selectinload(models.Product.category),
        )
        .where(models.Product.id == product_id)
    )
    return result.scalar_one()


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(select(models.Product).where(models.Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(product)
    await db.commit()


@router.post("/{product_id}/images", response_model=schemas.ProductImageOut, status_code=201)
async def add_product_image(
    product_id: str,
    url: str,
    alt_text: str | None = None,
    is_primary: bool = False,
    is_hover: bool = False,
    sort_order: int = 0,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    image = models.ProductImage(
        product_id=product_id,
        url=url,
        alt_text=alt_text,
        is_primary=is_primary,
        is_hover=is_hover,
        sort_order=sort_order,
    )
    db.add(image)
    await db.commit()
    await db.refresh(image)
    return image


@router.delete("/images/{image_id}", status_code=204)
async def delete_product_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(select(models.ProductImage).where(models.ProductImage.id == image_id))
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(image)
    await db.commit()
