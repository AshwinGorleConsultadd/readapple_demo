import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from database.connection import get_db
from services.conversation_analysis_service import analyse_conversation
from services.elevenlabs_service import speech_to_text

router = APIRouter(prefix="/conversation-analysis", tags=["conversation-analysis"])
logger = logging.getLogger(__name__)


def _ser(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    for key in ("appointment_id", "patient_id", "doctor_id"):
        if doc.get(key):
            doc[key] = str(doc[key])
    return doc


async def _load_context(db, appointment_id: str):
    try:
        appt = await db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID")
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt["_id"] = str(appt["_id"])
    if appt.get("patient_id"):
        appt["patient_id"] = str(appt["patient_id"])
    if appt.get("doctor_id"):
        appt["doctor_id"] = str(appt["doctor_id"])

    patient = await db["patients"].find_one({})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    patient["_id"] = str(patient["_id"])

    doctor = {}
    if appt.get("doctor_id"):
        try:
            doc = await db["doctors"].find_one({"_id": ObjectId(appt["doctor_id"])})
            if doc:
                doc["_id"] = str(doc["_id"])
                doctor = doc
        except Exception:
            pass
    if not doctor:
        # fallback: search by name
        doc = await db["doctors"].find_one(
            {"name": {"$regex": appt.get("doctor_name", ""), "$options": "i"}}
        )
        if doc:
            doc["_id"] = str(doc["_id"])
            doctor = doc

    return appt, patient, doctor


# ── endpoints ──────────────────────────────────────────────────────────────────

@router.post("/transcribe-and-analyse")
async def transcribe_and_analyse(
    appointment_id: str = Form(...),
    audio_file: UploadFile = File(...),
):
    audio_bytes = await audio_file.read()
    try:
        transcript = await speech_to_text(audio_bytes, audio_file.filename or "recording.webm")
    except Exception as e:
        logger.warning("[Analysis] STT failed: %s", e)
        raise HTTPException(status_code=422, detail=f"Speech-to-text failed: {str(e)}. Use /analyse-transcript with a manual transcript.")

    if not transcript or transcript.startswith("["):
        raise HTTPException(status_code=422, detail="Could not transcribe audio. Use /analyse-transcript instead.")

    db = get_db()
    appt, patient, doctor = await _load_context(db, appointment_id)
    result = await analyse_conversation(transcript, appt, patient, doctor)
    return {"transcript": transcript, **result, "status": "success"}


class TranscriptRequest(BaseModel):
    transcript: str
    appointment_id: str


@router.post("/analyse-transcript")
async def analyse_transcript(body: TranscriptRequest):
    if not body.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
    db = get_db()
    appt, patient, doctor = await _load_context(db, body.appointment_id)
    result = await analyse_conversation(body.transcript, appt, patient, doctor)
    return {**result, "status": "success"}


@router.get("/patient-notes/{patient_id}")
async def get_patient_notes(patient_id: str):
    db = get_db()
    try:
        oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")
    cursor = db["patient_notes"].find({"patient_id": oid}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(_ser(doc))
    return results


@router.get("/patient-notes/detail/{note_id}")
async def get_patient_note_detail(note_id: str):
    db = get_db()
    try:
        doc = await db["patient_notes"].find_one({"_id": ObjectId(note_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid note ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Note not found")
    return _ser(doc)


@router.delete("/patient-notes/detail/{note_id}")
async def delete_patient_note(note_id: str):
    db = get_db()
    try:
        result = await db["patient_notes"].delete_one({"_id": ObjectId(note_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid note ID")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"deleted": True, "note_id": note_id}


@router.get("/doctor-notes/{doctor_id}")
async def get_doctor_notes(doctor_id: str):
    db = get_db()
    try:
        oid = ObjectId(doctor_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
    cursor = db["doctor_notes"].find({"doctor_id": oid}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(_ser(doc))
    return results


@router.get("/doctor-notes/detail/{note_id}")
async def get_doctor_note_detail(note_id: str):
    db = get_db()
    try:
        doc = await db["doctor_notes"].find_one({"_id": ObjectId(note_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid note ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Note not found")
    return _ser(doc)


@router.delete("/doctor-notes/detail/{note_id}")
async def delete_doctor_note(note_id: str):
    db = get_db()
    try:
        result = await db["doctor_notes"].delete_one({"_id": ObjectId(note_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid note ID")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"deleted": True, "note_id": note_id}
