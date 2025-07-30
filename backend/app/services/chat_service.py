from typing import Optional, List
from app.schemas.chat_schema import ChatMessageCreate, ChatMessageResponse
from app.models.chat import ChatMessage
from app.utils.serializers import serialize_mongo_doc
from app.database import db
from bson import ObjectId
from datetime import datetime


async def save_chat_message(data: ChatMessageCreate) -> ChatMessage:
    chat_dict = data.dict()
    chat_dict["timestamp"] = datetime.utcnow()
    result = await db.chat_messages.insert_one(chat_dict)
    saved = await db.chat_messages.find_one({"_id": result.inserted_id})
    return ChatMessage(**serialize_mongo_doc(saved))


async def get_chat_messages_by_appointment(appointment_id: str) -> List[ChatMessage]:
    cursor = db.chat_messages.find({"appointment_id": appointment_id}).sort("timestamp", 1)
    return [ChatMessage(**serialize_mongo_doc(doc)) async for doc in cursor]
