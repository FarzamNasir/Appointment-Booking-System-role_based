from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from app.services.openaiService import OpenAIService
from app.database import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.chat_schema import ChatMessageCreate
from app.services.chat_service import save_chat_message
from app.rag.notes_chatbot import summarize_key_points, retrieve_relevant_chunks

router = APIRouter()
openai_service = OpenAIService()

class ChatMessage(BaseModel):
    role: str
    content: str
    isUser: Optional[bool] = False

class ChatRequest(BaseModel):
    message: str
    conversationHistory: List[ChatMessage]

class ChatResponse(BaseModel):
    message: str
    conversationHistory: List[ChatMessage]

@router.post("/chatV", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest,
    appointment_id: str = Query(..., description="Appointment ID"),
    db: AsyncIOMotorDatabase = Depends(get_db)  # still needed in case you use it later
):
    # Save user message
    await save_chat_message(ChatMessageCreate(
        appointment_id=appointment_id,
        sender="user",
        message=req.message,
    ))

    # AI response with context
    response = openai_service.chat_with_patient_rag(
        user_message=req.message,
        conversation_history=[msg.dict() for msg in req.conversationHistory],
        appointment_id=appointment_id
    )

    ai_message = response["message"]

    # Save assistant message
    await save_chat_message(ChatMessageCreate(
        appointment_id=appointment_id,
        sender="assistant",
        message=ai_message,
    ))

    return ChatResponse(
        message=ai_message,
        conversationHistory=req.conversationHistory + [
            ChatMessage(role="user", content=req.message, isUser=True),
            ChatMessage(role="assistant", content=ai_message, isUser=False),
        ]
    )
class SummaryResponse(BaseModel):
    summary: str
@router.get("/appointments/{appointment_id}/summary", response_model=SummaryResponse)
async def summary_endpoint(appointment_id: str):
    chunks = retrieve_relevant_chunks("summary", appointment_id=appointment_id, top_k=5)
    summary = summarize_key_points(chunks)
    return SummaryResponse(summary=summary)