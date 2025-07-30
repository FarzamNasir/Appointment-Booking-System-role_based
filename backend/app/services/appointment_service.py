# backend/app/services/appointment_service.py

from app.schemas.appointment_schema import AppointmentCreate
from app.models.appointment import Appointment
from app.database import db
from bson import ObjectId
from datetime import datetime
from app.utils.serializers import serialize_mongo_doc


# CREATE Appointment
async def create_appointment_logic(data: AppointmentCreate) -> Appointment:
    appointment_dict = data.dict()
    appointment_dict["status"] = "Pending"
    appointment_dict["created_at"] = datetime.utcnow()
    appointment_dict["updated_at"] = datetime.utcnow()

    result = await db.appointments.insert_one(appointment_dict)
    created_doc = await db.appointments.find_one({"_id": result.inserted_id})
    return Appointment(**serialize_mongo_doc(created_doc))

# READ ALL Appointments
async def get_all_appointments() -> list[Appointment]:
    cursor = db.appointments.find()
    return [Appointment(**serialize_mongo_doc(doc)) async for doc in cursor]

# READ by ID
async def get_appointment_by_id(appointment_id: str) -> Appointment | None:
    doc = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    return Appointment(**serialize_mongo_doc(doc)) if doc else None

# DELETE
async def delete_appointment(appointment_id: str) -> bool:
    result = await db.appointments.delete_one({"_id": ObjectId(appointment_id)})
    return result.deleted_count == 1

async def update_appointment_logic(appointment_id: str, data: AppointmentCreate) -> Appointment | None:
    result = await db.appointments.find_one_and_update(
        {"_id": ObjectId(appointment_id)},
        {"$set": data.dict()},
        return_document=True
    )
    if not result:
        return None
    return Appointment(**serialize_mongo_doc(result))

# UPDATE: Add/Update audio file reference
async def attach_audio_to_appointment(appointment_id: str, audio_file_id: str) -> bool:
    result = await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {
            "$set": {
                "audio_file_id": audio_file_id,
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count == 1