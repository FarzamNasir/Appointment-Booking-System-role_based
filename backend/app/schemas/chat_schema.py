from pydantic import BaseModel
from typing import Literal
from datetime import datetime


class ChatMessageCreate(BaseModel):
    appointment_id: str
    sender: Literal["user", "assistant"]
    message: str


class ChatMessageResponse(ChatMessageCreate):
    id: str
    timestamp: datetime
