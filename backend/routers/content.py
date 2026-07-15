import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database import get_db
from config import get_settings
import models
import schemas
import auth
from supabase import create_client

settings = get_settings()
router = APIRouter(prefix="/content", tags=["content"])

def get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# ─── Hero Banners (public + admin) ───────────────────────────────────────────

@router.get("/banners", response_model=list[schemas.HeroBannerOut])
async def list_banners(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.HeroBanner)
        .where(models.HeroBanner.is_active == True)
        .order_by(models.HeroBanner.sort_order)
    )
    return result.scalars().all()


@router.post("/banners", response_model=schemas.HeroBannerOut, status_code=201)
async def create_banner(
    data: schemas.HeroBannerCreate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    banner = models.HeroBanner(**data.model_dump())
    db.add(banner)
    await db.commit()
    await db.refresh(banner)
    return banner


@router.put("/banners/{banner_id}", response_model=schemas.HeroBannerOut)
async def update_banner(
    banner_id: str,
    data: schemas.HeroBannerCreate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(select(models.HeroBanner).where(models.HeroBanner.id == banner_id))
    banner = result.scalar_one_or_none()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for key, value in data.model_dump().items():
        setattr(banner, key, value)
    await db.commit()
    await db.refresh(banner)
    return banner


@router.delete("/banners/{banner_id}", status_code=204)
async def delete_banner(
    banner_id: str,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(select(models.HeroBanner).where(models.HeroBanner.id == banner_id))
    banner = result.scalar_one_or_none()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    await db.delete(banner)
    await db.commit()


# ─── Lookbook ─────────────────────────────────────────────────────────────────

@router.get("/lookbook", response_model=list[schemas.LookbookCollectionOut])
async def list_lookbook_collections(
    published_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(models.LookbookCollection)
        .options(
            selectinload(models.LookbookCollection.images).selectinload(models.LookbookImage.hotspots).selectinload(models.LookbookHotspot.product).selectinload(models.Product.images)
        )
        .order_by(models.LookbookCollection.sort_order)
    )
    if published_only:
        query = query.where(models.LookbookCollection.is_published == True)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/lookbook/{slug}", response_model=schemas.LookbookCollectionOut)
async def get_lookbook_collection(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.LookbookCollection)
        .options(
            selectinload(models.LookbookCollection.images).selectinload(models.LookbookImage.hotspots).selectinload(models.LookbookHotspot.product).selectinload(models.Product.images)
        )
        .where(models.LookbookCollection.slug == slug)
    )
    coll = result.scalar_one_or_none()
    if not coll:
        raise HTTPException(status_code=404, detail="Collection not found")
    return coll


@router.post("/lookbook", response_model=schemas.LookbookCollectionOut, status_code=201)
async def create_lookbook_collection(
    data: schemas.LookbookCollectionCreate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    coll = models.LookbookCollection(**data.model_dump())
    db.add(coll)
    await db.commit()
    await db.refresh(coll)
    return coll


@router.put("/lookbook/{collection_id}", response_model=schemas.LookbookCollectionOut)
async def update_lookbook_collection(
    collection_id: str,
    data: schemas.LookbookCollectionUpdate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    result = await db.execute(select(models.LookbookCollection).where(models.LookbookCollection.id == collection_id))
    coll = result.scalar_one_or_none()
    if not coll:
        raise HTTPException(status_code=404, detail="Collection not found")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(coll, key, value)
    await db.commit()
    await db.refresh(coll)
    return coll


@router.post("/lookbook/{collection_id}/images", response_model=schemas.LookbookImageOut, status_code=201)
async def add_lookbook_image(
    collection_id: str,
    data: schemas.LookbookImageCreate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    image = models.LookbookImage(collection_id=collection_id, **data.model_dump())
    db.add(image)
    await db.commit()
    await db.refresh(image)
    return image


@router.post("/lookbook/images/{image_id}/hotspots", response_model=schemas.HotspotOut, status_code=201)
async def add_hotspot(
    image_id: str,
    data: schemas.HotspotCreate,
    db: AsyncSession = Depends(get_db),
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    hotspot = models.LookbookHotspot(image_id=image_id, **data.model_dump())
    db.add(hotspot)
    await db.commit()
    await db.refresh(hotspot)
    return hotspot


# ─── Image Upload ─────────────────────────────────────────────────────────────

@router.post("/upload-url", response_model=schemas.UploadUrlResponse)
async def get_upload_url(
    data: schemas.UploadUrlRequest,
    _: models.AdminUser = Depends(auth.get_current_admin),
):
    """Returns a signed Supabase Storage upload URL for direct client-side upload."""
    supabase = get_supabase()
    file_path = f"{uuid.uuid4()}/{data.filename}"
    
    try:
        response = supabase.storage.from_(data.bucket).create_signed_upload_url(file_path)
    except Exception as err:
        try:
            # Attempt to create the public bucket automatically
            supabase.storage.create_bucket(data.bucket, options={"public": True})
            response = supabase.storage.from_(data.bucket).create_signed_upload_url(file_path)
        except Exception:
            raise err
            
    public_url = supabase.storage.from_(data.bucket).get_public_url(file_path)
    
    return schemas.UploadUrlResponse(
        upload_url=response.get("signed_url") or response.get("signedURL") or "",
        public_url=public_url,
        path=file_path,
    )
