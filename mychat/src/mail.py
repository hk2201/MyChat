from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from src.config import Config
from pathlib import Path
from typing import List


BASE_DIR = Path(__file__).resolve().parent


config = ConnectionConfig(
    MAIL_USERNAME=Config.MAIL_USERNAME,
    MAIL_PASSWORD=Config.MAIL_PASSWORD,
    MAIL_FROM=Config.MAIL_FROM,
    MAIL_PORT=Config.MAIL_PORT,
    MAIL_SERVER=Config.MAIL_SERVER,
    MAIL_FROM_NAME=Config.MAIL_FROM_NAME,
    MAIL_STARTTLS=Config.MAIL_STARTTLS,
    MAIL_SSL_TLS=Config.MAIL_SSL_TLS,
    USE_CREDENTIALS=Config.USE_CREDENTIALS,
    VALIDATE_CERTS=Config.VALIDATE_CERTS,
    TEMPLATE_FOLDER=Path(BASE_DIR, "templates"),
)

mail = FastMail(config)


def create_message(
    recipients: List[str], subject: str, invite_url: str, sender_name: str
):
    message = MessageSchema(
        recipients=recipients,
        subject=subject,
        subtype=MessageType.html,
        template_body={"invite_url": invite_url, "sender_name": sender_name},
    )

    return message
