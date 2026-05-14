from fastapi import APIRouter, HTTPException
from database.connection import get_db

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
async def get_profile():
    db = get_db()
    patient = await db["patients"].find_one({}, {"_id": 1, "name": 1, "age": 1, "gender": 1,
        "blood_group": 1, "phone": 1, "email": 1, "location": 1,
        "health_conditions": 1, "current_medications": 1, "allergies": 1, "emergency_contact": 1})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    patient["_id"] = str(patient["_id"])
    return patient
