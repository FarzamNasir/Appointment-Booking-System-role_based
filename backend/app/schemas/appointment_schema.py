from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel

class AppointmentCreate(BaseModel):
    patientName: str
    doctorName: str
    date: str
    time: str
    status: Literal["Confirmed", "Pending", "Cancelled", "Completed"]
    type: str
    notes: Optional[str]


class AppointmentResponse(AppointmentCreate):
    id: str
    audio_file_id: Optional[str] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
