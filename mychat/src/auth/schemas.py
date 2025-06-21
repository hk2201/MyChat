from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, EmailStr
import uuid


class CreateUserSchema(BaseModel):
    username: str = Field(max_length=10)
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str
    last_name: str


class UserRead(BaseModel):
    uid: uuid.UUID
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    token: Optional[str] = None
    refresh_token: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class EmailModel(BaseModel):
    addresses: List[str]
