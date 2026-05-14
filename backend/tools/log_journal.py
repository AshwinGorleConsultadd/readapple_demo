from datetime import datetime, date
from bson import ObjectId
from database.connection import get_db
from services.gemini_service import parse_journal_entry


LOG_JOURNAL_TOOL = {
    "name": "log_journal",
    "description": "Save a health journal entry for the patient. Call this when patient wants to log their health update, symptoms, or daily status.",
    "parameters": {
        "raw_input": "exactly what the patient said about their health today",
    },
}


async def execute_log_journal(params: dict, patient_id: str) -> dict:
    raw_input = params.get("raw_input", "")
    try:
        parsed = await parse_journal_entry(raw_input)
    except Exception as e:
        parsed = {
            "summary": raw_input[:100],
            "pain_level": None,
            "pain_location": None,
            "sleep_hours": None,
            "mood": None,
            "energy_level": None,
            "symptoms": [],
            "notes": None,
        }

    db = get_db()
    entry = {
        "patient_id": ObjectId(patient_id),
        "date": date.today().isoformat(),
        "raw_input": raw_input,
        "parsed_entry": parsed,
        "source": "voice",
        "created_at": datetime.utcnow(),
    }
    result = await db["journal"].insert_one(entry)

    return {
        "saved": True,
        "journal_id": str(result.inserted_id),
        "summary": parsed.get("summary", ""),
        "message": f"Journal saved. {parsed.get('summary', '')}",
    }
