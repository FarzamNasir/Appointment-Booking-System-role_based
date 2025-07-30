from typing import Optional

from app.schemas.patient_schema import PatientCreate,PatientResponse
from app.models.patient import Patient
from app.utils.serializers import serialize_mongo_doc
from app.database import db
from bson import ObjectId


# CREATE
async def create_patient_logic(patient_data: PatientCreate) -> Patient:
    patient_dict = patient_data.dict()
    result = await db.patients.insert_one(patient_dict)
    created_patient = await db.patients.find_one({"_id": result.inserted_id})
    return Patient(**serialize_mongo_doc(created_patient))

# READ all
import logging

async def get_all_patients() -> list[Patient]:
    cursor = db.patients.find()
    patients = []
    async for doc in cursor:
        try:
            patients.append(Patient(**serialize_mongo_doc(doc)))
        except Exception as e:
            logging.warning(f"Skipping invalid patient document: {doc}. Error: {e}")
    return patients

# READ by ID
async def get_patient_by_id(patient_id: str) -> Patient | None:
    doc = await db.patients.find_one({"_id": ObjectId(patient_id)})
    return Patient(**serialize_mongo_doc(doc)) if doc else None

# DELETE
async def delete_patient(patient_id: str) -> bool:
    result = await db.patients.delete_one({"_id": ObjectId(patient_id)})
    return result.deleted_count == 1

async def update_patient(patient_id: str, data: PatientCreate) -> Optional[PatientResponse]:
    result = await db.patients.find_one_and_update(
        {"_id": ObjectId(patient_id)},
        {"$set": data.dict()},
        return_document=True
    )
    if not result:
        return None
    return PatientResponse(id=str(result["_id"]), **result)