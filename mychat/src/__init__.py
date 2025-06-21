from fastapi import FastAPI

from src.auth.routes import auth_router
from src.users.routes import user_router
from src.chat.routes import chat_router

from contextlib import asynccontextmanager

from src.db.main import init_db

# from .middleware import register_middleware


# Work of asynccontextmanager is like what needs to be done when app starts and when app closes or ends
@asynccontextmanager
async def life_span(app: FastAPI):
    print("Start")
    await init_db()
    yield
    print("End")


version = "v1"


app = FastAPI(
    title="MyChat",
    description="A rest api for Chat Purpose",
    version=version,
    # lifespan=life_span, // removed as we are using alembic
)


# register_middleware(app)


app.include_router(auth_router, prefix=f"/api/{version}/auth", tags=["Auth"])
app.include_router(user_router, prefix=f"/api/{version}/user", tags=["User"])
app.include_router(chat_router, prefix=f"/api/{version}/chats", tags=["Chats"])
