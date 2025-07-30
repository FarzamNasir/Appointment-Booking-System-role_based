# backend/app/routes/appointment_routes.py

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.database import db
from app.schemas.appointment_schema import AppointmentCreate, AppointmentResponse
from app.services.appointment_service import (
    create_appointment_logic,
    get_all_appointments,
    get_appointment_by_id,
    delete_appointment, attach_audio_to_appointment
)
from app.services.audio_storage_service import save_audio_to_gridfs
from app.services.consultation_notes_service import save_consultation_note
from app.services.rag_service import build_vector_store_from_appointment
from app.utils.transcription import transcribe_audio_from_gridfs
from app.services.whisper_transcriber_service import merge_segments_by_token_limit

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# POST: Create appointment
@router.post("/", response_model=AppointmentResponse)
async def create_appointment(data: AppointmentCreate):
    return await create_appointment_logic(data)

# GET: All appointments
@router.get("/", response_model=list[AppointmentResponse])
async def read_all_appointments():
    return await get_all_appointments()

# GET: Appointment by ID
@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def read_appointment_by_id(appointment_id: str):
    appointment = await get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

# DELETE: Delete appointment by ID
@router.delete("/{appointment_id}", status_code=204)
async def delete_appointment_by_id(appointment_id: str):
    success = await delete_appointment(appointment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Appointment not found")

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment_by_id(appointment_id: str, data: AppointmentCreate):
    updated = await update_appointment_logic(appointment_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated

# POST: Upload audio file for an existing appointment
@router.post("/{appointment_id}/upload-audio")
async def upload_audio_for_appointment(
    appointment_id: str,
    audio_file: UploadFile = File(...)
):
    file_bytes = await audio_file.read()
    file_id = save_audio_to_gridfs(file_bytes, audio_file.filename)

    await attach_audio_to_appointment(appointment_id, file_id)

    # Transcribe after saving
    transcript = await transcribe_audio_from_gridfs(db, file_id)

    segments = transcript.get("segments", [])

    #Divide into chunks
    transcript = merge_segments_by_token_limit(segments, max_tokens=300)

    # Saving to consultation notes
    await save_consultation_note(appointment_id, transcript)

    await build_vector_store_from_appointment(appointment_id)

    return {"message": "Audio uploaded and transcribed", "file_id": str(file_id), "transcript": transcript}