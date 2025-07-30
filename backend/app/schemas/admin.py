from pydantic import BaseModel, Field
from typing import Optional

class AdminCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminInDB(BaseModel):
    id: Optional[str]
    username: str
    password_hash: str
