from datetime import datetime
from bson import ObjectId
from database.connection import get_db


def _to_oid(val):
    try:
        return ObjectId(val) if val else None
    except Exception:
        return None


async def execute_save_doctor_notes(notes: dict, appointment: dict, transcript: str) -> dict:
    db = get_db()
    doc = {
        "appointment_id": _to_oid(appointment.get("_id")),
        "patient_id": _to_oid(appointment.get("patient_id")),
        "doctor_id": _to_oid(appointment.get("doctor_id")),
        "patient_name": appointment.get("patient_name", ""),
        "appointment_date": appointment.get("date", ""),
        "appointment_reason": appointment.get("reason", ""),
        "conversation_transcript": transcript,
        "notes": notes,
        "created_at": datetime.utcnow(),
    }
    result = await db["doctor_notes"].insert_one(doc)
    return str(result.inserted_id)
