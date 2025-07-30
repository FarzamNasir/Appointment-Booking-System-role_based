
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class Appointment(BaseModel):
    id: Optional[str]
    patientName: str
    doctorName: str
    date: str
    time: str
    status: Literal["Confirmed", "Pending", "Cancelled", "Completed"]
    audio_file_id: Optional[str] = None
    type: str
    notes: Optional[str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
