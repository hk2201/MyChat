from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt
from src.config import Config
import uuid
from itsdangerous import URLSafeSerializer
import logging

paswd_context = CryptContext(schemes=["bcrypt"])

ACCESS_TOKEN_EXPIRY = 3600


def generate_passwd_hash(password: str) -> str:
    hash = paswd_context.hash(password)

    return hash


def verify_passwd(password: str, hash: str) -> bool:
    return paswd_context.verify(password, hash)


def create_access_token(
    user_data: dict, expiry: timedelta = None, refresh: bool = False
):
    payload = {}

    if expiry is None:
        expiry = timedelta(seconds=ACCESS_TOKEN_EXPIRY)

    payload["user"] = user_data
    payload["exp"] = datetime.now(timezone.utc) + expiry

    payload["jti"] = str(uuid.uuid4())

    payload["refresh"] = refresh

    token = jwt.encode(
        claims=payload, key=Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM
    )

    return token


def decode_token(token: str) -> dict:

    try:

        token_data = jwt.decode(
            token, key=Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM]
        )

        print(token_data)
        return token_data
    except jwt.JWTError as e:
        logging.exception(e)

        return None


serializer = URLSafeSerializer(secret_key=Config.JWT_SECRET, salt="email-configuration")


def create_url_safe_token(data: dict):

    token = serializer.dumps(data)

    return token


def decore_url_safe_token(token: str):
    try:
        token_data = serializer.loads(token)

        return token_data

    except Exception as e:
        logging.error(str(e))
