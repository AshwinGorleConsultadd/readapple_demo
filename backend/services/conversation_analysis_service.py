import json
import logging
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv

from tools.save_patient_notes import execute_save_patient_notes
from tools.save_doctor_notes import execute_save_doctor_notes

load_dotenv(Path(__file__).parent.parent / ".env")
logger = logging.getLogger(__name__)

_ANALYSIS_PROMPT = """\
You are a medical conversation analyst for Redapple Health Platform.

You have been given a full transcript of a consultation between a patient and a doctor.
Read the entire conversation carefully and extract ALL medically relevant information.

Appointment context:
- Patient: {patient_name}, Age: {patient_age}, Gender: {patient_gender}
- Doctor: {doctor_name}, Specialty: {doctor_specialty}
- Date: {appointment_date}
- Reason: {appointment_reason}

Patient health background:
{patient_health_conditions}

Instructions:
- Extract EVERY piece of relevant information from the transcript
- Do NOT invent or assume anything not present in the transcript
- For fields with no relevant information, use null or empty array []
- Patient notes: write in simple, friendly language the patient can understand at home
- Doctor notes: write in professional clinical language

Return ONLY a valid JSON object with this exact structure (no markdown, no code block):
{{
  "patient_notes": {{
    "summary": "2-3 sentence overview written for the patient",
    "symptoms_discussed": ["list of symptoms mentioned"],
    "diagnosis_or_concern": "what the doctor said about the condition",
    "medications": [
      {{"name": "", "dosage": "", "frequency": "", "duration": "", "notes": ""}}
    ],
    "diet_advice": ["list of diet instructions"],
    "exercises": [
      {{"name": "", "instructions": "", "frequency": ""}}
    ],
    "tasks_assigned": ["list of tasks for the patient"],
    "follow_up": "follow-up plan in plain language",
    "things_to_avoid": ["list of things to avoid"],
    "doctor_will_provide": ["things the doctor said they will send or provide"],
    "additional_notes": "any other important points"
  }},
  "doctor_notes": {{
    "summary": "clinical summary of the session",
    "chief_complaint": "primary reason patient came",
    "symptoms_reported": [
      {{"symptom": "", "severity": "", "duration": "", "notes": ""}}
    ],
    "patient_history_mentioned": ["anything patient mentioned about past conditions"],
    "clinical_observations": "what the doctor observed or noted",
    "advice_given": ["list of advice given to patient"],
    "prescriptions": [
      {{"medicine": "", "dosage": "", "frequency": "", "duration": "", "reason": ""}}
    ],
    "exercises_prescribed": ["list of exercises"],
    "diet_instructions": ["list of diet instructions"],
    "tasks_for_patient": ["tasks assigned to patient"],
    "pending_actions": ["things doctor still needs to do, e.g. send referral"],
    "follow_up_plan": "clinical follow-up plan",
    "red_flags_to_watch": ["symptoms that should trigger an immediate return visit"],
    "additional_clinical_notes": "any other clinical observations"
  }}
}}

Transcript:
{transcript}
"""


async def analyse_conversation(
    transcript: str,
    appointment: dict,
    patient: dict,
    doctor: dict,
) -> dict:
    from services.gemini_service import _ensure_genai
    _ensure_genai()

    health_conditions = ", ".join(patient.get("health_conditions", [])) or "None reported"
    prompt = _ANALYSIS_PROMPT.format(
        patient_name=patient.get("name", ""),
        patient_age=patient.get("age", ""),
        patient_gender=patient.get("gender", ""),
        doctor_name=doctor.get("name", appointment.get("doctor_name", "")),
        doctor_specialty=doctor.get("specialty", appointment.get("doctor_specialty", "")),
        appointment_date=appointment.get("date", ""),
        appointment_reason=appointment.get("reason", ""),
        patient_health_conditions=health_conditions,
        transcript=transcript,
    )

    model = genai.GenerativeModel(model_name="gemini-2.5-pro")
    logger.info("[Analysis] Sending transcript (%d chars) to Gemini", len(transcript))
    response = await model.generate_content_async(prompt)

    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    if raw.endswith("```"):
        raw = raw[:-3].strip()

    data = json.loads(raw)
    logger.info("[Analysis] Gemini returned structured notes — saving to DB")

    # Enrich appointment with patient_name for doctor_notes
    enriched = dict(appointment)
    enriched["patient_name"] = patient.get("name", "")

    patient_notes_id = await execute_save_patient_notes(
        data["patient_notes"], appointment, transcript
    )
    doctor_notes_id = await execute_save_doctor_notes(
        data["doctor_notes"], enriched, transcript
    )

    logger.info("[Analysis] Saved patient_notes=%s doctor_notes=%s", patient_notes_id, doctor_notes_id)
    return {"patient_notes_id": patient_notes_id, "doctor_notes_id": doctor_notes_id}
