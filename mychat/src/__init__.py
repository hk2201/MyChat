from fastapi import FastAPI

from src.auth.routes import auth_router
from src.users.routes import user_router
from src.chat.routes import chat_router
from fastapi.middleware.cors import CORSMiddleware

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

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://mychat-brfy.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] to allow all origins (not recommended in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix=f"/api/{version}/auth", tags=["Auth"])
app.include_router(user_router, prefix=f"/api/{version}/user", tags=["User"])
app.include_router(chat_router, prefix=f"/api/{version}/chats", tags=["Chats"])
