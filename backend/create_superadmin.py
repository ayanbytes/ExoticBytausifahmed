# Create first super admin — run this ONCE after setting up .env
import asyncio
import sys
sys.path.insert(0, ".")

from database import AsyncSessionLocal
from models import AdminUser, UserRole
from auth import hash_password


async def create_superadmin(email: str, password: str, name: str = "Super Admin"):
    async with AsyncSessionLocal() as db:
        user = AdminUser(
            email=email,
            hashed_password=hash_password(password),
            full_name=name,
            role=UserRole.super_admin,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        print(f"✅ Super admin created: {email}")


if __name__ == "__main__":
    email = input("Email: ")
    password = input("Password: ")
    name = input("Full name (optional): ") or "Super Admin"
    asyncio.run(create_superadmin(email, password, name))
