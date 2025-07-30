# backend/app/routes/doctor_routes.py
from fastapi import APIRouter, HTTPException
from app.schemas.doctor_schema import DoctorCreate, DoctorResponse
from app.services.doctor_service import (
    create_doctor_logic,
    get_all_doctors,
    get_doctor_by_id,
    delete_doctor
)

router = APIRouter(prefix="/doctors", tags=["Doctors"])

# POST: Create a doctor
@router.post("/", response_model=DoctorResponse)
async def create_doctor(doctor: DoctorCreate):
    return await create_doctor_logic(doctor)

# GET: List all doctors
@router.get("/", response_model=list[DoctorResponse])
async def get_doctors():
    return await get_all_doctors()

# GET: Get doctor by ID
@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: str):
    doctor = await get_doctor_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

# DELETE: Delete doctor by ID
@router.delete("/{doctor_id}", status_code=204)
async def delete_doctor_route(doctor_id: str):
    success = await delete_doctor(doctor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Doctor not found")

from app.services.doctor_service import update_doctor  # Ensure this exists

@router.put("/{doctor_id}", response_model=DoctorResponse)
async def update_existing_doctor(doctor_id: str, doctor: DoctorCreate):
    updated = await update_doctor(doctor_id, doctor)
    if not updated:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return updated
