import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from database.connection import get_db
from database.models import ConversationMessageRequest, ConversationResponse
from services.gemini_service import send_message
from services.elevenlabs_service import speech_to_text, text_to_speech
from tools.search_doctors import SEARCH_DOCTORS_TOOL, execute_search_doctors
from tools.log_journal import LOG_JOURNAL_TOOL, execute_log_journal
from tools.book_appointment import BOOK_APPOINTMENT_TOOL, execute_book_appointment
from tools.cancel_appointment import CANCEL_APPOINTMENT_TOOL, execute_cancel_appointment

router = APIRouter(prefix="/conversation", tags=["conversation"])

ALL_TOOLS = [SEARCH_DOCTORS_TOOL, LOG_JOURNAL_TOOL, BOOK_APPOINTMENT_TOOL, CANCEL_APPOINTMENT_TOOL]


async def _load_context(db):
    patient = await db["patients"].find_one({})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found. Run seed scripts first.")
    patient["_id"] = str(patient["_id"])

    cursor = db["journal"].find({"patient_id": patient["_id"]}).sort("created_at", -1).limit(5)
    journal_entries = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["patient_id"] = str(doc["patient_id"])
        journal_entries.append(doc)

    return patient, journal_entries


async def _load_conversation(db, patient_id: str):
    conv = await db["conversations"].find_one({"patient_id": patient_id})
    if conv:
        return conv.get("messages", []), str(conv["_id"])
    return [], None


async def _save_conversation(db, patient_id: str, messages: list, conv_id):
    from bson import ObjectId
    now = datetime.utcnow()
    if conv_id:
        await db["conversations"].update_one(
            {"_id": ObjectId(conv_id)},
            {"$set": {"messages": messages, "last_updated": now}},
        )
        return conv_id
    result = await db["conversations"].insert_one(
        {"patient_id": patient_id, "messages": messages, "last_updated": now}
    )
    return str(result.inserted_id)


async def _process_message(user_text: str, db) -> ConversationResponse:
    patient, journal_entries = await _load_context(db)
    patient_id = patient["_id"]
    history, conv_id = await _load_conversation(db, patient_id)

    async def tool_executor(tool_name: str, args: dict) -> dict:
        if tool_name == "search_doctors":
            return await execute_search_doctors(args)
        if tool_name == "log_journal":
            return await execute_log_journal(args, patient_id)
        if tool_name == "book_appointment":
            return await execute_book_appointment(args, patient_id)
        if tool_name == "cancel_appointment":
            return await execute_cancel_appointment(args, patient_id)
        return {"error": f"Unknown tool: {tool_name}"}

    ai_response = await send_message(
        user_message=user_text,
        conversation_history=history,
        patient_context=patient,
        recent_journal=journal_entries,
        available_tools=ALL_TOOLS,
        tool_executor=tool_executor,
    )

    reply_text = ai_response["reply_text"]
    tool_used = ai_response.get("tool_used")
    tool_result = ai_response.get("tool_result")
    tool_calls = ai_response.get("tool_calls", [])

    new_messages = list(history) + [
        {"role": "user", "content": user_text, "timestamp": datetime.utcnow().isoformat()},
        {"role": "assistant", "content": reply_text, "timestamp": datetime.utcnow().isoformat()},
    ]
    conv_id = await _save_conversation(db, patient_id, new_messages, conv_id)

    try:
        audio_bytes = await text_to_speech(reply_text) if reply_text else b""
        audio_b64 = base64.b64encode(audio_bytes).decode() if audio_bytes else None
    except Exception:
        audio_b64 = None

    return ConversationResponse(
        reply_text=reply_text,
        reply_audio_base64=audio_b64,
        tool_used=tool_used,
        tool_result=tool_result,
        tool_calls=tool_calls,
        updated_conversation_id=conv_id,
    )


@router.post("/message", response_model=ConversationResponse)
async def send_text_message(body: ConversationMessageRequest):
    db = get_db()
    return await _process_message(body.user_message, db)


@router.post("/audio-message", response_model=ConversationResponse)
async def send_audio_message(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    try:
        user_text = await speech_to_text(audio_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech-to-text failed: {str(e)}")
    if not user_text or user_text.startswith("["):
        raise HTTPException(status_code=500, detail="Could not transcribe audio.")
    db = get_db()
    return await _process_message(user_text, db)


@router.get("/greeting")
async def get_greeting():
    db = get_db()
    patient, journal_entries = await _load_context(db)

    recent_pain = next(
        (e["parsed_entry"].get("pain_level") for e in journal_entries[:3]
         if e.get("parsed_entry", {}).get("pain_level")),
        None,
    )

    greeting_prompt = (
        f"Greet {patient['name']} warmly. It's a new session. "
        f"Reference their recent health — they've had back pain recently"
        + (f" at level {recent_pain}/10" if recent_pain else "")
        + ". Keep it to 2 sentences max."
    )

    ai_response = await send_message(
        user_message=greeting_prompt,
        conversation_history=[],
        patient_context=patient,
        recent_journal=journal_entries,
        available_tools=[],
    )
    reply_text = ai_response["reply_text"]

    try:
        audio_bytes = await text_to_speech(reply_text)
        audio_b64 = base64.b64encode(audio_bytes).decode() if audio_bytes else None
    except Exception:
        audio_b64 = None

    return {"reply_text": reply_text, "reply_audio_base64": audio_b64}
