import uuid
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, or_
from src.db.models import User
from src.auth.schemas import UserRead
from src.db.main import get_session
from src.auth.dependencies import AccessTokenBearer, get_current_user
from .services import UserService

user_router = APIRouter()
user_service = UserService()


@user_router.get("/search", response_model=List[UserRead])
async def search_users(
    query: Optional[str] = Query(
        None, description="Search by username, email, first name, or last name"
    ),
    limit: int = Query(10, le=100),
    offset: int = 0,
    token_data: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    print("asdasdasd")
    users = await user_service.search_users(session, query, limit, offset)

    if not users:
        raise HTTPException(status_code=404, detail="No users found")

    return users


@user_router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return current_user


@user_router.get("/{user_id}", response_model=UserRead)
async def get_user_by_id(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(AccessTokenBearer()),  # or get_current_user if needed
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
