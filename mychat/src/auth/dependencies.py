from datetime import datetime, timezone
from fastapi.security import HTTPBearer
from fastapi import Request, WebSocket, status, Depends
from fastapi.security.http import HTTPAuthorizationCredentials
from jose import JWTError, jwt
from .utils import decode_token
from fastapi.exceptions import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from .services import UserService
from typing import List
from src.db.models import User

user_service = UserService()


class TokenBearer(HTTPBearer):
    def __init__(self, auto_error=True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> dict:
        creds: HTTPAuthorizationCredentials = await super().__call__(request)

        if not creds:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Authorization credentials missing",
            )

        token = creds.credentials
        token_data = decode_token(token)

        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or expired token",
            )

        self.verify_token_data(token_data)

        return token_data

    def verify_token_data(self, token_data: dict):
        raise NotImplementedError("Please override this method in child classes")


class AccessTokenBearer(TokenBearer):
    def verify_token_data(self, token_data: dict) -> None:
        if token_data.get("refresh"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access token required, not a refresh token",
            )


class RefreshTokenBearer(TokenBearer):
    def verify_token_data(self, token_data: dict) -> None:
        if not token_data.get("refresh"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Refresh token required, not an access token",
            )


async def get_current_user(
    token_details: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    user_email = token_details["user"].get("email")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email missing in token",
        )

    user = await user_service.get_user_by_email(user_email, session)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


# class RoleChecker:
#     def __init__(self, allowed_roles: List[str]) -> None:
#         self.allowed_roles = allowed_roles

#     def __call__(self, current_user: User = Depends(get_current_user)):
#         if not current_user.is_verified:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="User is not verified",
#             )

#         if current_user.role not in self.allowed_roles:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="You do not have permission to perform this action",
#             )

#         return True


async def get_user_id_from_socket(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=403, detail="Missing token")

    try:

        payload = decode_token(token)
        return payload["user"]["user_uid"]
    except JWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=403, detail="Invalid token")
