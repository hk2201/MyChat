from sqlmodel import func, select, or_
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional, List
from src.db.models import User


class UserService:
    async def search_users(
        self,
        session: AsyncSession,
        query: Optional[str] = None,
        limit: int = 10,
        offset: int = 0,
    ) -> List[User]:

        stmt = select(User).limit(limit).offset(offset)

        if query:
            like_query = f"%{query.lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(User.username) == query.lower(),
                    func.lower(User.email) == query.lower(),
                    func.lower(User.first_name) == query.lower(),
                    func.lower(User.last_name) == query.lower(),
                )
            )

        result = await session.exec(stmt)
        return result.all()
