from datetime import datetime
from bson import ObjectId
from database.connection import get_db
from services.calendar_service import create_calendar_event


BOOK_APPOINTMENT_TOOL = {
    "name": "book_appointment",
    "description": "Book a medical appointment with a doctor. Call this only after confirming doctor name, date, and time with the patient.",
    "parameters": {
        "doctor_name": "full name of the doctor",
        "date": "appointment date in YYYY-MM-DD format",
        "time": "appointment time e.g. 3:00 PM",
        "reason": "brief reason for the appointment",
    },
}


async def execute_book_appointment(params: dict, patient_id: str) -> dict:
    doctor_name = params.get("doctor_name", "")
    date_str = params.get("date", "")
    time_str = params.get("time", "")
    reason = params.get("reason", "Medical consultation")

    db = get_db()
    doctor = await db["doctors"].find_one(
        {"name": {"$regex": doctor_name, "$options": "i"}}
    )

    doctor_id = None
    doctor_specialty = ""
    if doctor:
        doctor_id = str(doctor["_id"])
        doctor_specialty = doctor.get("specialty", "")

    calendar_result = await create_calendar_event(
        title=f"Appointment with {doctor_name}",
        date=date_str,
        time=time_str,
        duration_minutes=30,
        description=f"Patient: Ashwin | Reason: {reason}",
    )

    appointment = {
        "patient_id": ObjectId(patient_id),
        "doctor_id": ObjectId(doctor_id) if doctor_id else None,
        "doctor_name": doctor_name,
        "doctor_specialty": doctor_specialty,
        "date": date_str,
        "time": time_str,
        "duration_minutes": 30,
        "reason": reason,
        "status": "confirmed",
        "google_calendar_event_id": calendar_result.get("event_id"),
        "google_meet_link": calendar_result.get("meet_link"),
        "created_at": datetime.utcnow(),
    }
    result = await db["appointments"].insert_one(appointment)

    return {
        "booked": True,
        "appointment_id": str(result.inserted_id),
        "doctor_name": doctor_name,
        "date": date_str,
        "time": time_str,
        "meet_link": calendar_result.get("meet_link"),
        "message": f"Appointment booked with {doctor_name} on {date_str} at {time_str}.",
    }
