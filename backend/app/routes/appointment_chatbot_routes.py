from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from app.schemas.patient_schema import PatientCreate
from app.services.openaiService import OpenAIService
from app.services.atlasSearchService import DoctorSearchService
from app.services.patient_service import create_patient_logic
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_db
import re
from bson import ObjectId
from app.utils.serializers import serialize_mongo_doc
router = APIRouter(prefix="/api")
openai_service = OpenAIService()
doctor_search_service = DoctorSearchService()


class ChatMessage(BaseModel):
    role: str
    content: str
    isUser: Optional[bool] = False


class ChatRequest(BaseModel):
    message: str
    conversationHistory: List[ChatMessage]


@router.post("/chat")
async def chat_endpoint(
        body: ChatRequest,
        db: AsyncIOMotorDatabase = Depends(get_db),
):
    message = body.message
    conversation_history = [msg.dict() for msg in body.conversationHistory]

    ai_response = openai_service.chat_with_patient(message, conversation_history)

    if not ai_response.get("success"):
        return {"error": ai_response["message"]}

    extracted_info = openai_service.extract_patient_info_with_llm(ai_response["conversationHistory"])
    clean_extracted_info = {}

    for key, value in extracted_info.items():
        if value:
            cleaned_value = value.strip()

            if key == "name":
                cleaned_value = (
                    re.sub(r"\b(yes|no|okay|sure|please|thanks|thank you|help)\b", "", value, flags=re.I)
                    .strip()
                )
                cleaned_value = " ".join(cleaned_value.split()[:4])

            if key == "age":
                try:
                    age_num = int(value)
                    cleaned_value = age_num if 0 < age_num < 120 else None
                except:
                    cleaned_value = None

            if key == "symptoms":
                cleaned_value = re.sub(
                    r"\b(doctor|recommendation|help|please|thanks|thank you|yes|no|okay|sure|proceed with recommendations)\b",
                    "",
                    value,
                    flags=re.I,
                ).strip()

            if key == "contact":
                cleaned_value = value.replace(" ", "").strip()

            if key == "location":
                cleaned_value = (
                    re.sub(r"[^\w\s,]", "", value)
                    .replace(r"\b(my age is|age is|age)\b.*$", "", 1)
                    .strip()
                )
                cleaned_value = " ".join([w for w in cleaned_value.split() if len(w) > 2 and w.isalpha()])

            if cleaned_value:
                clean_extracted_info[key] = cleaned_value

    patient_info = clean_extracted_info.copy()

    has_valid_name = patient_info.get("name") and 2 <= len(patient_info["name"]) <= 50
    has_valid_contact = patient_info.get("contact") and len(patient_info["contact"]) >= 7
    has_valid_age = patient_info.get("age") and isinstance(patient_info["age"], int) and 0 < patient_info["age"] < 120
    has_valid_gender = patient_info.get("gender", "").lower() in ["male", "female", "other"]
    has_valid_symptoms = patient_info.get("symptoms") and 2 < len(patient_info["symptoms"]) < 200
    has_valid_location = patient_info.get("location") and 2 < len(patient_info["location"]) < 100
    has_enough_info = all(
        [has_valid_name, has_valid_contact, has_valid_age, has_valid_gender, has_valid_symptoms, has_valid_location])

    is_confirming = openai_service.is_confirming_recommendations(message)

    doctor_recommendations: Optional[List[DoctorRecommendation]] = None

    if has_enough_info and (is_confirming or "recommend" in message.lower()):
        search_query = openai_service.generate_doctor_search_query(patient_info)
        for method in [doctor_search_service.search_doctors, doctor_search_service.fallback_search]:
            result = await method(db, search_query)
            if result["success"] and result["doctors"]:
                doctor_recommendations = result["doctors"]
                break

    return {
        "message": ai_response["message"],
        "conversationHistory": ai_response["conversationHistory"],
        "patientInfo": patient_info,
        "doctorRecommendations": doctor_recommendations or [],
        "hasEnoughInfo": has_enough_info,
        "isConfirming": is_confirming,
    }


@router.post("/register-patient-from-chat", response_model=Dict)
async def register_patient_from_chat(
        body: Dict,
        db: AsyncIOMotorDatabase = Depends(get_db),
):
    patient_info = body.get("patientInfo")

    if not patient_info:
        raise HTTPException(status_code=400, detail="patientInfo is required")

    if not patient_info.get("name") or not patient_info.get("contact"):
        raise HTTPException(status_code=400, detail="Name and contact are required")

    patient_data = PatientCreate(
        name=patient_info.get("name"),
        age=patient_info.get("age", 0),
        gender=patient_info.get("gender", "Not specified"),
        contact=patient_info.get("contact"),
        condition=patient_info.get("symptoms", "General consultation"),
        status="Active"
    )

    created_patient = await create_patient_logic(patient_data)  # ✅ MUST await

    return {
        "success": True,
        "patient": created_patient.dict(by_alias=True),
        "message": "Patient registered successfully"
    }


@router.get("/doctors/{doctor_id}/availability")
async def get_doctor_availability(
        doctor_id: str,
        db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        result = await doctor_search_service.get_available_time_slots(db, doctor_id)

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))

        # Correct key is timeSlots, not availabilities
        return result["timeSlots"]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching availability: {e}")

#
# @router.post("/book-appointment-from-chat")
# async def book_appointment_from_chat(
#         body: dict,
#         db: AsyncIOMotorDatabase = Depends(get_db)
# ):
#     try:
#         patient_name = body.get("patientName")
#         doctor_id = body.get("doctorId")
#         time_slot_id = body.get("timeSlotId")
#         date = body.get("date")
#         time = body.get("time")
#
#         if not all([patient_name, doctor_id, time_slot_id, date, time]):
#             raise HTTPException(status_code=400, detail="All fields are required")
#
#         # Get Doctor
#         doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
#         if not doctor:
#             raise HTTPException(status_code=404, detail=f"Doctor not found for id: {doctor_id}")
#
#         # Update Availability (time slot) status to Booked
#         await db.availabilities.update_one(
#             {"_id": ObjectId(time_slot_id)},
#             {"$set": {"status": "Booked"}}
#         )
#
#         # Create Appointment
#         appointment_data = {
#             "patientName": patient_name,
#             "doctorName": doctor["name"],
#             "date": date,
#             "time": time,
#             "status": "Confirmed",
#             "type": "Consultation",
#             "notes": "Booked through AI chat"
#         }
#         result = await db.appointments.insert_one(appointment_data)
#         created_appointment = await db.appointments.find_one({"_id": result.inserted_id})
#
#         return {
#             "success": True,
#             "appointment": serialize_mongo_doc(created_appointment),
#             "message": "Appointment booked successfully"
#         }
#
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error booking appointment: {e}")
@router.post("/book-appointment-from-chat")
async def book_appointment_from_chat(
        body: dict,
        db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        patient_name = body.get("patientName")
        doctor_id = body.get("doctorId")
        time_slot_id = body.get("timeSlotId")
        date = body.get("date")
        time = body.get("time")

        if not all([patient_name, doctor_id, time_slot_id, date, time]):
            raise HTTPException(status_code=400, detail="All fields are required")

        print(f"doctor_id: {doctor_id}")
        print(f"time_slot_id: {time_slot_id}")

        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            raise HTTPException(status_code=404, detail=f"Doctor not found for id: {doctor_id}")

        await db.availabilities.update_one(
            {"_id": ObjectId(time_slot_id)},
            {"$set": {"status": "Booked"}}
        )

        appointment_data = {
            "patientName": patient_name,
            "doctorName": doctor["name"],
            "date": date,
            "time": time,
            "status": "Confirmed",
            "type": "Consultation",
            "notes": "Booked through AI chat"
        }
        result = await db.appointments.insert_one(appointment_data)
        created_appointment = await db.appointments.find_one({"_id": result.inserted_id})

        return {
            "success": True,
            "appointment": serialize_mongo_doc(created_appointment),
            "message": "Appointment booked successfully"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error booking appointment: {e}")
