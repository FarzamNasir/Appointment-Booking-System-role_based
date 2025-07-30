from fastapi import APIRouter, HTTPException
from app.schemas.chat_schema import ChatMessageCreate, ChatMessageResponse
from app.services.chat_service import (
    save_chat_message,
    get_chat_messages_by_appointment,
)

router = APIRouter(prefix="/chat-messages", tags=["Chat Messages"])


@router.post("/", response_model=ChatMessageResponse)
async def create_chat_message(message: ChatMessageCreate):
    saved = await save_chat_message(message)
    return saved


@router.get("/appointment/{appointment_id}", response_model=list[ChatMessageResponse])
async def get_messages(appointment_id: str):
    messages = await get_chat_messages_by_appointment(appointment_id)
    return messages
