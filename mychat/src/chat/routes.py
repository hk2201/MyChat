from datetime import UTC, datetime, timezone
from typing import List
import uuid
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlmodel import UUID
from sqlmodel.ext.asyncio.session import AsyncSession
from src.chat.services import ChatService
from src.db.models import Message, User
from src.db.main import get_session
from src.auth.dependencies import get_current_user, get_user_id_from_socket
from .schemas import MessageCreateSchema
from src.chat.connection_manager import ConnectionManager


chat_router = APIRouter()
chat_service = ChatService()
manager = ConnectionManager()


@chat_router.post("/messages/send")
async def send_message(
    data: MessageCreateSchema,  # content, recipient_id
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    new_message = await chat_service.create_new_message(data, current_user, session)

    return new_message


@chat_router.get("/messages/{user_id}")
async def get_chat_with_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    getChats = await chat_service.get_chat_user(user_id, current_user, session)

    return getChats


@chat_router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: UUID = Depends(get_user_id_from_socket),
    session: AsyncSession = Depends(get_session),
):
    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            # Validate structure
            if "content" not in data or "recipient_id" not in data:
                continue  # or send error back

            recipient_id = uuid.UUID(data["recipient_id"])
            content = data["content"]

            aware_utc = datetime.now(timezone.utc)  # timezone-aware UTC datetime
            naive_utc = aware_utc.replace(tzinfo=None)  # make it naive
            # Save to DB
            # session: AsyncSession = await get_session()
            message = Message(
                content=content,
                sender_id=user_id,
                recipient_id=recipient_id,
                timestamp=naive_utc,
            )
            session.add(message)
            await session.commit()
            await session.refresh(message)

            payload = {
                "sender_id": str(user_id),
                "recipient_id": str(recipient_id),
                "content": content,
                "timestamp": message.timestamp.isoformat(),
            }

            # Push to recipient if online
            await manager.send_message_to_user(recipient_id, payload)
            print("SUCCESS")
    except WebSocketDisconnect:
        manager.disconnect(user_id)


@chat_router.get("/chatted-users")
async def get_chatted_users(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await chat_service.get_all_chatted_users(current_user, session)
