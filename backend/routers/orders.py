import random
import string
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/orders", tags=["orders"])


def generate_order_number() -> str:
    letters = "".join(random.choices(string.ascii_uppercase, k=4))
    digits = "".join(random.choices(string.digits, k=4))
    return f"EX-{letters}{digits}"


@router.post("", response_model=schemas.OrderOut, status_code=201)
async def create_order(data: schemas.OrderCreate, db: AsyncSession = Depends(get_db)):
    """Public endpoint — creates pending order when WhatsApp link is generated."""
    subtotal = sum(item.unit_price * item.quantity for item in data.items)
    shipping = 0.0  # Free shipping or calculate based on business logic
    total = subtotal + shipping

    order = models.Order(
        order_number=generate_order_number(),
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        customer_phone=data.customer_phone,
        delivery_address=data.delivery_address,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        subtotal=subtotal,
        shipping_cost=shipping,
        total=total,
        notes=data.notes,
        status=models.OrderStatus.pending,
    )
    db.add(order)
    await db.flush()

    for item_data in data.items:
        item = models.OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            product_name=item_data.product_name,
            variant_size=item_data.variant_size,
            variant_color=item_data.variant_color,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=item_data.unit_price * item_data.quantity,
            image_url=item_data.image_url,
        )
        db.add(item)

    await db.commit()
    await db.refresh(order)

    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.id == order.id)
    )
    return result.scalar_one()


@router.get("/{order_number}/track", response_model=schemas.OrderOut)
async def track_order(order_number: str, db: AsyncSession = Depends(get_db)):
    """Public tracking endpoint for customers."""
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ─── Admin endpoints ─────────────────────────────────────────────────────────

@router.get("", response_model=list[schemas.OrderOut])
async def list_orders(
    status: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    query = (
        select(models.Order)
        .options(selectinload(models.Order.items))
        .order_by(models.Order.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if status:
        query = query.where(models.Order.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{order_id}", response_model=schemas.OrderOut)
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
async def update_order_status(
    order_id: str,
    data: schemas.OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    await db.commit()
    await db.refresh(order)
    return order


@router.patch("/{order_id}/whatsapp-sent", response_model=schemas.OrderOut)
async def mark_whatsapp_sent(
    order_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.whatsapp_sent = True
    await db.commit()
    await db.refresh(order)
    return order
