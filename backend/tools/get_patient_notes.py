from bson import ObjectId
from database.connection import get_db

GET_PATIENT_NOTES_TOOL = {
    "name": "get_patient_notes",
    "description": (
        "Retrieve the patient's saved consultation notes from previous doctor visits. "
        "Call this when the patient asks about medications prescribed, exercises given, "
        "diet advice, follow-up instructions, symptoms discussed, or anything else from a past consultation. "
        "Optionally filter by doctor name to find notes from a specific visit."
    ),
    "parameters": {
        "doctor_name": "partial or full name of the doctor to filter by, or empty string to get all recent notes",
    },
}


async def execute_get_patient_notes(params: dict, patient_id: str) -> dict:
    doctor_name = params.get("doctor_name", "").strip()
    db = get_db()

    query = {"patient_id": ObjectId(patient_id)}
    if doctor_name:
        query["doctor_name"] = {"$regex": doctor_name, "$options": "i"}

    cursor = db["patient_notes"].find(query).sort("created_at", -1).limit(5)
    notes = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["patient_id"] = str(doc["patient_id"])
        if doc.get("doctor_id"):
            doc["doctor_id"] = str(doc["doctor_id"])
        if doc.get("appointment_id"):
            doc["appointment_id"] = str(doc["appointment_id"])
        notes.append(doc)

    if not notes:
        msg = (
            f"No consultation notes found for Dr. {doctor_name}."
            if doctor_name
            else "No consultation notes found yet."
        )
        return {"found": False, "notes": [], "message": msg}

    return {
        "found": True,
        "count": len(notes),
        "notes": notes,
        "message": f"Found {len(notes)} consultation note(s).",
    }
