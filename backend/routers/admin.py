from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=schemas.DashboardStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_orders = await db.scalar(func.count(models.Order.id))
    pending_orders = await db.scalar(
        select(func.count()).where(models.Order.status == models.OrderStatus.pending)
    )
    total_products = await db.scalar(func.count(models.Product.id))
    low_stock = await db.scalar(
        select(func.count()).where(
            models.Product.total_stock <= models.Product.low_stock_threshold,
            models.Product.is_published == True,
        )
    )
    revenue_result = await db.execute(
        select(func.sum(models.Order.total)).where(
            models.Order.created_at >= month_start,
            models.Order.status != models.OrderStatus.cancelled,
        )
    )
    revenue = revenue_result.scalar() or 0.0

    orders_today = await db.scalar(
        select(func.count()).where(models.Order.created_at >= today_start)
    )

    return schemas.DashboardStats(
        total_orders=total_orders or 0,
        pending_orders=pending_orders or 0,
        total_products=total_products or 0,
        low_stock_products=low_stock or 0,
        revenue_this_month=float(revenue),
        orders_today=orders_today or 0,
    )


@router.get("/users", response_model=list[schemas.AdminUserOut])
async def list_admin_users(
    db: AsyncSession = Depends(get_db),
    current_user: models.AdminUser = Depends(auth.require_super_admin),
):
    result = await db.execute(select(models.AdminUser).order_by(models.AdminUser.created_at))
    return result.scalars().all()


@router.post("/users", response_model=schemas.AdminUserOut, status_code=201)
async def create_admin_user(
    data: schemas.AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.require_super_admin),
):
    # Check duplicate email
    existing = await db.scalar(
        select(models.AdminUser).where(models.AdminUser.email == data.email)
    )
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = models.AdminUser(
        email=data.email,
        hashed_password=auth.hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
