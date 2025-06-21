from sqlmodel import text, SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from src.config import Config
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker


engine = create_async_engine(Config.DATABASE_URL, echo=True)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:

    Session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as session:
        yield session
