from typing import Any
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from src.mail import mail
from src.mail import create_message
from src.auth.dependencies import (
    AccessTokenBearer,
    RefreshTokenBearer,
    get_current_user,
)
from src.db.main import get_session
from .schemas import CreateUserSchema, UserRead, LoginSchema, EmailModel
from src.db.models import User
import uuid
from datetime import datetime, timedelta
from .services import UserService
from .utils import verify_passwd, create_access_token
from src.config import Config

auth_router = APIRouter()
user_service = UserService()


@auth_router.post(
    "/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED
)
async def create_user(
    user_data: CreateUserSchema, session: AsyncSession = Depends(get_session)
):
    # Check if username or email already exists
    result = await user_service.get_user_by_email(user_data.email, session)

    if result:
        raise HTTPException(
            status_code=400, detail="Username or email already registered"
        )

    # Create user instance
    new_user = await user_service.create_user(user_data, session)

    return new_user


@auth_router.post("/login", response_model=UserRead, status_code=status.HTTP_200_OK)
async def login(login_data: LoginSchema, session: AsyncSession = Depends(get_session)):
    user: User = await user_service.get_user_by_email(login_data.email, session)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    if not verify_passwd(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # Optional: check if user is active
    # if not user.is_active:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
    #     )

    # Create JWT token
    token = create_access_token(
        user_data={
            "email": user.email,
            "user_uid": str(user.uid),
        }
    )

    refresh_token = create_access_token(
        user_data={"email": user.email, "user_uid": str(user.uid)},
        refresh=True,
        expiry=timedelta(days=2),
    )

    # Attach token to response (optional)
    user_read = UserRead.model_validate(user, from_attributes=True)
    user_read.token = (
        token,  # Add `token: Optional[str] = None` in `UserRead` schema if needed
    )
    user_read.refresh_token = {
        refresh_token,
    }

    return user_read


@auth_router.get("/refreshtoken")
async def refresh_token(tokenDetail: dict = Depends(RefreshTokenBearer())):

    expiry_timestamp = tokenDetail["exp"]

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = create_access_token(user_data=tokenDetail["user"])
        new_refresh_token = create_access_token(
            user_data=tokenDetail["user"],
            refresh=True,
            expiry=timedelta(days=2),
        )

        return JSONResponse(
            content={
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
            }
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
    )


# @auth_router.get("/logout")
# async def revoke_token(token_details: dict = Depends(AccessTokenBearer())):
#     jti = token_details["jti"]

#     await add_jti_to_blocklist(jti)

#     return JSONResponse(
#         content={"message": "Logged out successfully"}, status_code=status.HTTP_200_OK
#     )


@auth_router.post("/invite")
async def send_mail(
    emails: EmailModel,
    current_user: Any = Depends(get_current_user),
):
    emails = emails.addresses
    print(current_user.email)
    url = Config.DOMAIN
    message = create_message(
        recipients=emails,
        subject="Join MyChat!!!",
        invite_url=url,
        sender_name=current_user.email,
    )

    await mail.send_message(message, template_name="invite.html")

    return {"message": "Email send successfully"}
