from bson import ObjectId
from database.connection import get_db

GET_APPOINTMENTS_TOOL = {
    "name": "get_appointments",
    "description": (
        "Retrieve the patient's booked appointments. "
        "Call this when the patient asks to see, list, or check their appointments — upcoming, past, or all. "
        "Optionally filter by status: 'upcoming', 'past', 'cancelled', or leave empty for all."
    ),
    "parameters": {
        "status_filter": "filter by appointment status: 'upcoming', 'past', 'cancelled', or empty string for all",
    },
}


async def execute_get_appointments(params: dict, patient_id: str) -> dict:
    from datetime import date
    status_filter = params.get("status_filter", "").strip().lower()
    db = get_db()

    query = {"patient_id": ObjectId(patient_id)}
    if status_filter == "cancelled":
        query["status"] = "cancelled"
    elif status_filter == "upcoming":
        query["status"] = {"$ne": "cancelled"}
        query["date"] = {"$gte": date.today().isoformat()}
    elif status_filter == "past":
        query["status"] = {"$ne": "cancelled"}
        query["date"] = {"$lt": date.today().isoformat()}

    cursor = db["appointments"].find(query).sort("date", 1)
    appointments = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["patient_id"] = str(doc["patient_id"])
        if doc.get("doctor_id"):
            doc["doctor_id"] = str(doc["doctor_id"])
        appointments.append(doc)

    if not appointments:
        label = f"{status_filter} " if status_filter else ""
        return {"found": False, "appointments": [], "message": f"No {label}appointments found."}

    return {
        "found": True,
        "count": len(appointments),
        "appointments": appointments,
        "message": f"Found {len(appointments)} appointment(s).",
    }
