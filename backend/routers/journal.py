from fastapi import APIRouter, HTTPException
from datetime import datetime, date
from bson import ObjectId
from database.connection import get_db
from database.models import JournalEntryCreate
from services.gemini_service import parse_journal_entry, send_message

router = APIRouter(prefix="/journal", tags=["journal"])


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    if "patient_id" in doc:
        doc["patient_id"] = str(doc["patient_id"])
    return doc


@router.get("")
async def list_journal():
    db = get_db()
    patient = await db["patients"].find_one({})
    if not patient:
        return []
    cursor = db["journal"].find({"patient_id": patient["_id"]}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(_serialize(doc))
    return results


@router.post("")
async def create_journal_entry(body: JournalEntryCreate):
    db = get_db()
    patient = await db["patients"].find_one({})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        parsed = await parse_journal_entry(body.raw_input)
    except Exception:
        parsed = {
            "summary": body.raw_input[:100],
            "pain_level": None,
            "pain_location": None,
            "sleep_hours": None,
            "mood": None,
            "energy_level": None,
            "symptoms": [],
            "notes": None,
        }

    doc = {
        "patient_id": patient["_id"],
        "date": date.today().isoformat(),
        "raw_input": body.raw_input,
        "parsed_entry": parsed,
        "source": body.source,
        "created_at": datetime.utcnow(),
    }
    result = await db["journal"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["patient_id"] = str(doc["patient_id"])
    return doc


@router.get("/summary")
async def journal_summary():
    db = get_db()
    patient = await db["patients"].find_one({})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    from datetime import timedelta
    since = datetime.utcnow() - timedelta(days=30)
    cursor = db["journal"].find(
        {"patient_id": patient["_id"], "created_at": {"$gte": since}}
    ).sort("created_at", -1)
    entries = [_serialize(doc) async for doc in cursor]

    if not entries:
        return {"summary": "No journal entries in the last 30 days."}

    summaries = "\n".join(
        f"- {e['date']}: {e['parsed_entry'].get('summary', '')}" for e in entries
    )
    model_response = await send_message(
        user_message=f"Summarize these 30-day health journal entries in 3-4 sentences:\n{summaries}",
        conversation_history=[],
        patient_context={"name": patient.get("name", "Ashwin")},
        recent_journal=[],
        available_tools=[],
    )
    return {"summary": model_response["reply_text"], "entry_count": len(entries)}
