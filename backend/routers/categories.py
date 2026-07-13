from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[schemas.CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Category)
        .where(models.Category.is_active == True)
        .order_by(models.Category.sort_order)
    )
    return result.scalars().all()


@router.get("/{slug}", response_model=schemas.CategoryOut)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Category).where(models.Category.slug == slug)
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


# ─── Admin endpoints ─────────────────────────────────────────────────────────

@router.post("", response_model=schemas.CategoryOut, status_code=201)
async def create_category(
    data: schemas.CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    cat = models.Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=schemas.CategoryOut)
async def update_category(
    category_id: str,
    data: schemas.CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(select(models.Category).where(models.Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(cat, key, value)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(select(models.Category).where(models.Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(cat)
    await db.commit()
