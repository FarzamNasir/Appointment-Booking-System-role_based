# #patient_schema
# from pydantic import BaseModel
#
#
# class PatientCreate(BaseModel):  # for incoming request
#     name: str
#     dob: str
#     gender: str
#     contact: str
#
# class PatientResponse(PatientCreate):  # for outgoing response
#     id: str
from datetime import datetime

from pydantic import BaseModel
from typing import Literal, Optional


class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact: str
    condition: str
    status: Literal["Active", "Inactive", "Critical"]

class PatientResponse(PatientCreate):
    id: str