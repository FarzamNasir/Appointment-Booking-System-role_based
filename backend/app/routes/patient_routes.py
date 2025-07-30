from fastapi import APIRouter, HTTPException
from app.schemas.patient_schema import PatientCreate, PatientResponse
from app.services.patient_service import (
    create_patient_logic,
    get_all_patients,
    get_patient_by_id,
    delete_patient, update_patient,
)

router = APIRouter(prefix="/patients", tags=["Patients"])

# CREATE
@router.post("/", response_model=PatientResponse)
async def create_patient(patient: PatientCreate):
    created = await create_patient_logic(patient)
    return created

# READ all
@router.get("/", response_model=list[PatientResponse])
async def list_patients():
    return await get_all_patients()

# READ by ID
@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str):
    patient = await get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

# DELETE
@router.delete("/{patient_id}")
async def remove_patient(patient_id: str):
    success = await delete_patient(patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found or already deleted")
    return {"message": "Patient deleted successfully"}

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_existing_patient(patient_id: str, patient: PatientCreate):
    updated = await update_patient(patient_id, patient)
    if not updated:
        raise HTTPException(status_code=404, detail="Patient not found")
    return updated