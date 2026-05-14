from datetime import datetime
from bson import ObjectId
from database.connection import get_db

CANCEL_APPOINTMENT_TOOL = {
    "name": "cancel_appointment",
    "description": (
        "Cancel an existing appointment for the patient. "
        "IMPORTANT: Before calling this tool you MUST confirm the exact appointment with the patient — "
        "tell them the doctor name, date, and time, and ask them to confirm. "
        "If the patient has not specified a doctor or date, ask them which appointment they want to cancel. "
        "Only call this tool once the patient has clearly confirmed."
    ),
    "parameters": {
        "doctor_name": "full or partial name of the doctor whose appointment to cancel",
        "date": "appointment date in YYYY-MM-DD format, or empty string if not specified",
    },
}


async def execute_cancel_appointment(params: dict, patient_id: str) -> dict:
    doctor_name = params.get("doctor_name", "")
    date_str = params.get("date", "")

    db = get_db()

    query = {
        "patient_id": ObjectId(patient_id),
        "status": {"$ne": "cancelled"},
    }
    if doctor_name:
        query["doctor_name"] = {"$regex": doctor_name, "$options": "i"}
    if date_str:
        query["date"] = date_str

    appointment = await db["appointments"].find_one(query, sort=[("date", 1)])

    if not appointment:
        return {
            "cancelled": False,
            "message": f"No upcoming appointment found for {doctor_name or 'that doctor'}.",
        }

    await db["appointments"].update_one(
        {"_id": appointment["_id"]},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.utcnow()}},
    )

    # Also cancel Google Calendar event if it exists
    event_id = appointment.get("google_calendar_event_id")
    if event_id:
        try:
            from services.calendar_service import get_calendar_service
            service = get_calendar_service()
            service.events().delete(calendarId="primary", eventId=event_id).execute()
        except Exception:
            pass  # Calendar cancel is best-effort

    return {
        "cancelled": True,
        "appointment_id": str(appointment["_id"]),
        "doctor_name": appointment.get("doctor_name", ""),
        "date": appointment.get("date", ""),
        "time": appointment.get("time", ""),
        "message": (
            f"Appointment with {appointment.get('doctor_name', 'the doctor')} "
            f"on {appointment.get('date', '')} at {appointment.get('time', '')} has been cancelled."
        ),
    }
