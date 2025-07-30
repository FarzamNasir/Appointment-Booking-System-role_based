from fastapi import APIRouter, HTTPException
from app.schemas.availability_schema import DoctorAvailabilityCreate, DoctorAvailabilityResponse
from app.services.availability_service import (
    create_availability_logic,
    get_all_availabilities,
    get_availabilities_by_doctor,
    delete_availability_by_id,
    update_availability
)

router = APIRouter(prefix="/availabilities", tags=["Doctor Availability"])


@router.post("/", response_model=DoctorAvailabilityResponse)
async def create_availability(data: DoctorAvailabilityCreate):
    created = await create_availability_logic(data)
    return created


@router.get("/", response_model=list[DoctorAvailabilityResponse])
async def read_all_availabilities():
    slots = await get_all_availabilities()
    return slots


@router.get("/doctor/{doctor_id}", response_model=list[DoctorAvailabilityResponse])
async def read_availabilities_by_doctor(doctor_id: str):
    slots = await get_availabilities_by_doctor(doctor_id)
    return slots


@router.delete("/{availability_id}", status_code=204)
async def delete_availability(availability_id: str):
    success = await delete_availability_by_id(availability_id)
    if not success:
        raise HTTPException(status_code=404, detail="Availability not found")


@router.put("/{availability_id}", response_model=DoctorAvailabilityResponse)
async def update_availability_route(availability_id: str, data: DoctorAvailabilityCreate):
    updated = await update_availability(availability_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Availability not found")
    return updated
