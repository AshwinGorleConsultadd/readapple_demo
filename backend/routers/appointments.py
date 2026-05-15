from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database.connection import get_db
from database.models import AppointmentCreate

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    if "patient_id" in doc:
        doc["patient_id"] = str(doc["patient_id"])
    if "doctor_id" in doc and doc["doctor_id"]:
        doc["doctor_id"] = str(doc["doctor_id"])
    return doc


@router.get("")
async def list_appointments():
    db = get_db()
    patient = await db["patients"].find_one({})
    if not patient:
        return []
    cursor = db["appointments"].find(
        {"patient_id": patient["_id"]}
    ).sort("date", -1)
    results = []
    async for doc in cursor:
        results.append(_serialize(doc))
    return results


@router.get("/{appointment_id}")
async def get_appointment(appointment_id: str):
    db = get_db()
    doc = await db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return _serialize(doc)


@router.post("")
async def create_appointment(body: AppointmentCreate):
    from datetime import datetime
    db = get_db()
    patient = await db["patients"].find_one({})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = await db["doctors"].find_one({"name": {"$regex": body.doctor_name, "$options": "i"}})
    specialty = doctor.get("specialty", "") if doctor else ""
    doctor_id = doctor["_id"] if doctor else None

    from services.calendar_service import create_calendar_event
    cal = await create_calendar_event(
        title=f"Appointment with {body.doctor_name}",
        date=body.date, time=body.time,
        duration_minutes=body.duration_minutes,
        description=f"Patient: Ashwin | Reason: {body.reason}",
    )

    doc = {
        "patient_id": patient["_id"],
        "doctor_id": doctor_id,
        "doctor_name": body.doctor_name,
        "doctor_specialty": specialty,
        "date": body.date,
        "time": body.time,
        "duration_minutes": body.duration_minutes,
        "reason": body.reason,
        "status": "confirmed",
        "google_calendar_event_id": cal.get("event_id"),
        "google_meet_link": cal.get("meet_link"),
        "created_at": datetime.utcnow(),
    }
    result = await db["appointments"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["patient_id"] = str(doc["patient_id"])
    if doc["doctor_id"]:
        doc["doctor_id"] = str(doc["doctor_id"])
    return doc


@router.patch("/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str):
    from datetime import datetime as dt
    db = get_db()
    appointment = await db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.get("status") == "cancelled":
        raise HTTPException(status_code=400, detail="Appointment is already cancelled")

    await db["appointments"].update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "cancelled", "cancelled_at": dt.utcnow()}},
    )

    event_id = appointment.get("google_calendar_event_id")
    if event_id:
        try:
            from services.calendar_service import get_calendar_service
            service = get_calendar_service()
            service.events().delete(calendarId="primary", eventId=event_id).execute()
        except Exception:
            pass

    return {"cancelled": True, "appointment_id": appointment_id}


@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: str):
    db = get_db()
    appointment = await db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Delete from Google Calendar if event exists
    event_id = appointment.get("google_calendar_event_id")
    if event_id:
        try:
            from services.calendar_service import get_calendar_service
            service = get_calendar_service()
            service.events().delete(calendarId="primary", eventId=event_id).execute()
        except Exception:
            pass

    # Delete from database
    await db["appointments"].delete_one({"_id": ObjectId(appointment_id)})
    return {"deleted": True, "appointment_id": appointment_id}
