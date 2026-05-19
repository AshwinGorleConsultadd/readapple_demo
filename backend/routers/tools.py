import base64
from fastapi import APIRouter, HTTPException
from database.connection import get_db
from tools.search_doctors import execute_search_doctors
from tools.book_appointment import execute_book_appointment
from tools.log_journal import execute_log_journal
from tools.cancel_appointment import execute_cancel_appointment

router = APIRouter(prefix="/tools", tags=["tools"])


async def _get_patient_id() -> str:
    db = get_db()
    patient = await db["patients"].find_one({})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return str(patient["_id"])


@router.post("/search-doctors")
async def search_doctors_tool(body: dict):
    return await execute_search_doctors(body)


@router.post("/book-appointment")
async def book_appointment_tool(body: dict):
    patient_id = await _get_patient_id()
    return await execute_book_appointment(body, patient_id)


@router.post("/log-journal")
async def log_journal_tool(body: dict):
    patient_id = await _get_patient_id()
    return await execute_log_journal(body, patient_id)


@router.post("/cancel-appointment")
async def cancel_appointment_tool(body: dict):
    patient_id = await _get_patient_id()
    return await execute_cancel_appointment(body, patient_id)


@router.post("/tts")
async def text_to_speech_tool(body: dict):
    text = body.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    try:
        from services.elevenlabs_service import text_to_speech
        audio_bytes = await text_to_speech(text)
        audio_b64 = base64.b64encode(audio_bytes).decode() if audio_bytes else None
        return {"audio_base64": audio_b64}
    except Exception:
        return {"audio_base64": None}
