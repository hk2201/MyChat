import uuid
from src.db.models import Message, User
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import UUID, and_, or_, select
from .schemas import MessageCreateSchema


class ChatService:
    async def create_new_message(
        self, data: MessageCreateSchema, current_user: User, session: AsyncSession
    ):
        new_msg = Message(
            content=data.content,
            sender_id=current_user.uid,
            recipient_id=data.recipient_id,
        )

        session.add(new_msg)
        await session.commit()
        return new_msg

    async def get_chat_user(
        self, user_id: uuid.UUID, current_user: User, session: AsyncSession
    ):
        query = (
            select(Message)
            .where(
                or_(
                    and_(
                        Message.sender_id == current_user.uid,
                        Message.recipient_id == user_id,
                    ),
                    and_(
                        Message.sender_id == user_id,
                        Message.recipient_id == current_user.uid,
                    ),
                )
            )
            .order_by(Message.timestamp.asc())
        )

        result = await session.exec(query)

        return result.all()
