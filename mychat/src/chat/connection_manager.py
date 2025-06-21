from fastapi import WebSocket
from typing import Dict
import uuid


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[uuid.UUID, WebSocket] = {}

    async def connect(self, user_id: uuid.UUID, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[str(user_id)] = websocket

    def disconnect(self, user_id: uuid.UUID):
        self.active_connections.pop(user_id, None)

    async def send_message_to_user(self, user_id: uuid.UUID, message: dict):
        print(f"Looking for: {user_id} (type: {type(user_id)})")
        print("Stored connections:")
        for k in self.active_connections:
            print(f" - {k} (type: {type(k)})")
            print(f"   Equal? {k == user_id}")

        websocket = self.active_connections.get(str(user_id))
        print("Resulting websocket:", websocket)
        if websocket:
            await websocket.send_json(message)

    def is_user_online(self, user_id: uuid.UUID) -> bool:
        return user_id in self.active_connections
