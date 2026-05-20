from fastapi import APIRouter, HTTPException, UploadFile, File
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


@router.post("/insurance")
async def upload_insurance(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    content = await file.read()
    with open("/tmp/insurance_upload.pdf", "wb") as f:
        f.write(content)
    return {"uploaded": True}
