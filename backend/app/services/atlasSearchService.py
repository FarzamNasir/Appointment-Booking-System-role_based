import re
import logging
from typing import Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase


specialty_synonyms = {
    "cardiologist": ["cardiologist", "cardiology", "heart doctor", "heart specialist"],
    "neurologist": ["neurologist", "neurology", "brain doctor", "nerve specialist"],
    "dermatologist": ["dermatologist", "dermatology", "skin doctor", "skin specialist"],
    "orthopedist": ["orthopedist", "orthopedics", "bone doctor", "joint specialist"],
    "psychiatrist": ["psychiatrist", "psychiatry", "mental health", "mental doctor"],
    "gastroenterologist": ["gastroenterologist", "gastroenterology", "stomach doctor", "digestive specialist"],
    "general": ["general practitioner", "gp", "family doctor", "primary care"]
}


def parse_search_query(search_query: str) -> Dict[str, str]:
    match = re.search(r"([a-zA-Z ]+) in ([a-zA-Z ]+)", search_query, re.I)
    if match:
        return {
            "specialty": match.group(1).strip(),
            "location": match.group(2).strip()
        }
    return {"specialty": search_query.strip(), "location": ""}


def get_specialty_regex(specialty: str) -> re.Pattern:
    if not specialty:
        return re.compile(".*", re.I)
    key = specialty.lower()
    synonyms = specialty_synonyms.get(key, [key])
    pattern = "|".join(re.escape(term) for term in synonyms)
    return re.compile(pattern, re.I)


class DoctorSearchService:

    async def search_doctors(self, db: AsyncIOMotorDatabase, search_query: str) -> Dict[str, Any]:
        try:
            parsed = parse_search_query(search_query)
            specialty = parsed["specialty"]
            location = parsed["location"]

            compound_filters = []
            if specialty:
                compound_filters.append({
                    "text": {"query": specialty, "path": "specialization"}
                })
            if location:
                compound_filters.append({
                    "text": {"query": location, "path": "location"}
                })

            pipeline = [
                {
                    "$search": {
                        "index": "default",
                        "compound": {
                            "must": compound_filters
                        }
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "name": 1,
                        "specialization": 1,
                        "location": 1,
                        "contact": 1,
                        "experience": 1,
                        "rating": 1,
                        "availability": 1,
                        "description": 1
                    }
                },
                {"$limit": 5}
            ]

            doctors_cursor = db["doctors"].aggregate(pipeline)
            doctors = await doctors_cursor.to_list(length=5)

            return {
                "success": True,
                "doctors": [
                    {
                        "id": str(doc["_id"]),
                        "name": doc["name"],
                        "specialization": doc["specialization"],
                        "location": doc["location"],
                        "contact": doc["contact"],
                        "experience": doc["experience"],
                        "rating": doc.get("rating"),
                        "availability": doc["availability"],
                        "description": doc.get("description")
                    } for doc in doctors
                ]
            }
        except Exception as e:
            logging.error(f"Mongo Atlas Search Error: {e}")
            return {"success": False, "doctors": [], "error": str(e)}

    async def fallback_search(self, db: AsyncIOMotorDatabase, search_query: str) -> Dict[str, Any]:
        try:
            parsed = parse_search_query(search_query)
            specialty = parsed["specialty"]
            location = parsed["location"]

            specialty_regex = get_specialty_regex(specialty)
            location_regex = re.compile(location, re.I) if location else re.compile(".*", re.I)

            query = {
                "$and": [
                    {"location": {"$regex": location_regex}},
                    {
                        "$or": [
                            {"specialization": {"$regex": specialty_regex}},
                            {"description": {"$regex": specialty_regex}}
                        ]
                    }
                ]
            }

            doctors_cursor = db["doctors"].find(query).limit(5)
            doctors = await doctors_cursor.to_list(length=5)

            return {
                "success": True,
                "doctors": [
                    {
                        "id": str(doc["_id"]),
                        "name": doc["name"],
                        "specialization": doc["specialization"],
                        "location": doc["location"],
                        "contact": doc["contact"],
                        "experience": doc["experience"],
                        "rating": doc.get("rating"),
                        "availability": doc["availability"],
                        "description": doc.get("description")
                    } for doc in doctors
                ]
            }
        except Exception as e:
            logging.error(f"Mongo Fallback Search Error: {e}")
            return {"success": False, "doctors": [], "error": str(e)}

    async def get_available_time_slots(self, db: AsyncIOMotorDatabase, doctor_id: str) -> Dict[str, Any]:
        try:
            logging.debug(f"[get_available_time_slots] doctor_id received: {doctor_id}")
            logging.debug(f"[get_available_time_slots] Using collection: availabilities")

            slots_cursor = db["availabilities"].find({
                "doctorId": doctor_id,
                "status": "Available"
            }).sort([("date", 1), ("startTime", 1)])

            slots = await slots_cursor.to_list(length=50)

            logging.debug(f"[get_available_time_slots] Found {len(slots)} available slots for doctor_id={doctor_id}")

            return {
                "success": True,
                "timeSlots": [
                    {
                        "id": str(slot["_id"]),
                        "doctorId": slot["doctorId"],
                        "doctorName": slot["doctorName"],
                        "date": slot["date"],
                        "startTime": slot["startTime"],
                        "endTime": slot["endTime"],
                        "status": slot["status"]
                    } for slot in slots
                ]
            }
        except Exception as e:
            logging.error(f"[get_available_time_slots] Mongo Get Time Slots Error: {e}")
            return {"success": False, "timeSlots": [], "error": str(e)}