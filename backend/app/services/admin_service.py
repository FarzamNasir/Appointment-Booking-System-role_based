from passlib.context import CryptContext
from app.database import db
from bson import ObjectId

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AdminService:
    @staticmethod
    async def create_admin(username: str, password: str):
        existing = await db.admins.find_one({"username": username})
        if existing:
            raise ValueError("Username already exists")
        password_hash = pwd_context.hash(password)
        result = await db.admins.insert_one({"username": username, "password_hash": password_hash})
        return str(result.inserted_id)

    @staticmethod
    async def authenticate_admin(username: str, password: str):
        admin = await db.admins.find_one({"username": username})
        if not admin:
            return None
        if not pwd_context.verify(password, admin["password_hash"]):
            return None
        return str(admin["_id"])
