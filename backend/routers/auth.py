from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
async def login(data: schemas.AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.AdminUser).where(models.AdminUser.email == data.email)
    )
    user = result.scalar_one_or_none()
    
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    
    user.last_login = datetime.utcnow()
    await db.commit()
    
    return schemas.TokenResponse(
        access_token=auth.create_access_token(str(user.id), user.role.value),
        refresh_token=auth.create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=schemas.TokenResponse)
async def refresh_token(data: schemas.RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = auth.decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = payload.get("sub")
    result = await db.execute(select(models.AdminUser).where(models.AdminUser.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    
    return schemas.TokenResponse(
        access_token=auth.create_access_token(str(user.id), user.role.value),
        refresh_token=auth.create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=schemas.AdminUserOut)
async def get_me(current_user: models.AdminUser = Depends(auth.get_current_admin)):
    return current_user
