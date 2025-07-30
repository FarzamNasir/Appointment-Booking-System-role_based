# # backend/app/models/patient.py
# from pydantic import BaseModel, Field
# from typing import Optional
#
# class Patient(BaseModel):
#     id: Optional[str] = Field(alias="_id")  # MongoDB _id → Pydantic id
#     name: str
#     dob: str
#     gender: str
#     contact: str
#
#     class Config:
#         allow_population_by_field_name = True
#         arbitrary_types_allowed = True
#
#
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime



class Patient(BaseModel):
    id: Optional[str]
    name: str
    age: int
    gender: str
    contact: str
    condition: str
    status: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
