from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, EmailStr
import uuid


class MessageCreateSchema(BaseModel):
    content: str
    recipient_id: uuid.UUID
