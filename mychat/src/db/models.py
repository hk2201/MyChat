from typing import List
from sqlmodel import SQLModel, Field, Relationship, Column
import sqlalchemy.dialects.postgresql as pg
from datetime import datetime
import uuid


class User(SQLModel, table=True):
    __tablename__ = "users"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    )
    username: str = Field(index=True, unique=True)
    password: str = Field(exclude=True)
    email: str = Field(index=True, unique=True)
    first_name: str
    last_name: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages_sent: List["Message"] = Relationship(
        back_populates="sender",
        sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"},
    )


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    )
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = Field(default=False)
    read_at: datetime | None = None

    sender_id: uuid.UUID = Field(foreign_key="users.uid", index=True)
    recipient_id: uuid.UUID = Field(foreign_key="users.uid", index=True)

    sender: "User" = Relationship(
        back_populates="messages_sent",
        sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"},
    )

    def __repr__(self):
        return f"<Message from {self.sender_id} to {self.recipient_id}>"
