import os
import json
import logging
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).parent.parent / ".env")

_genai_configured = False


def _ensure_genai():
    global _genai_configured
    if not _genai_configured:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set in backend/.env")
        genai.configure(api_key=api_key)
        _genai_configured = True


_SYSTEM_TEMPLATE = """You are Redapple AI — a warm, intelligent voice health assistant for a patient named {patient_name}.

Your personality: friendly, empathetic, concise. You speak like a helpful health companion, not a robot.

Patient context:
{patient_profile}

Recent health journal:
{recent_journal_summary}

Your capabilities:
1. Answer health questions intelligently using patient's history
2. Suggest relevant doctors when patient describes a health problem (use search_doctors tool)
3. Book appointments when patient confirms they want one (use book_appointment tool)
4. Cancel appointments when patient requests (use cancel_appointment tool)
5. Log journal entries when patient wants to record their health update (use log_journal tool)
6. Retrieve and discuss past consultation notes — medications, exercises, diet advice, follow-ups (use get_patient_notes tool)
7. List or check the patient's appointments — upcoming, past, or all (use get_appointments tool)

Rules:
- Keep responses SHORT — max 2-3 sentences. This is voice output so brevity is critical.
- Always be proactive. If journal shows recurring back pain, ask about it.
- If user's intent is unclear, ask a clarifying question before taking action.
- When showing doctors, call search_doctors tool. The frontend will render the list.
- For compound requests like "cancel X and book Y": call BOTH tools in a single response turn without asking for intermediate confirmation. Execute all requested actions back-to-back.
- Only ask for clarification if critical information (doctor name, date, time) is genuinely missing from the user's message.
- Never make up information. If unsure, ask.
- Respond only in plain text — no markdown, no bullet points. This is spoken aloud."""


def _build_system_prompt(patient_context: dict, recent_journal: list) -> str:
    patient_name = patient_context.get("name", "the patient")
    profile_lines = [
        f"Name: {patient_context.get('name', '')}",
        f"Age: {patient_context.get('age', '')}",
        f"Health conditions: {', '.join(patient_context.get('health_conditions', []))}",
        f"Medications: {', '.join(patient_context.get('current_medications', []))}",
        f"Allergies: {', '.join(patient_context.get('allergies', []))}",
    ]
    journal_lines = []
    for e in recent_journal[:5]:
        parsed = e.get("parsed_entry", {})
        journal_lines.append(
            f"- {e.get('date', '')}: {parsed.get('summary', '')} "
            f"(pain {parsed.get('pain_level', '?')}/10, mood: {parsed.get('mood', '?')})"
        )
    return _SYSTEM_TEMPLATE.format(
        patient_name=patient_name,
        patient_profile="\n".join(profile_lines),
        recent_journal_summary="\n".join(journal_lines) if journal_lines else "No recent entries.",
    )


def _build_gemini_tools(available_tools: list):
    if not available_tools:
        return None
    declarations = []
    for t in available_tools:
        props = {}
        required = []
        for param_name, param_desc in t.get("parameters", {}).items():
            props[param_name] = genai.protos.Schema(
                type=genai.protos.Type.STRING,
                description=param_desc,
            )
            required.append(param_name)
        declarations.append(
            genai.protos.FunctionDeclaration(
                name=t["name"],
                description=t["description"],
                parameters=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties=props,
                    required=required,
                ),
            )
        )
    return [genai.protos.Tool(function_declarations=declarations)]


def _extract_text(response) -> str:
    text = ""
    for part in response.candidates[0].content.parts:
        if hasattr(part, "text") and part.text:
            text += part.text
    return text


def _extract_all_tool_calls(response) -> list:
    """Return ALL function calls present in one response turn as [(name, args), ...]."""
    calls = []
    for part in response.candidates[0].content.parts:
        if hasattr(part, "function_call") and part.function_call.name:
            calls.append((part.function_call.name, dict(part.function_call.args)))
    return calls


async def send_message(
    user_message: str,
    conversation_history: list,
    patient_context: dict,
    recent_journal: list,
    available_tools: list,
    tool_executor=None,
) -> dict:
    """
    Send a message to Gemini and handle any number of tool calls — including
    multiple calls in a single response turn and sequential calls across turns.

    Returns: { reply_text, tool_used, tool_result, tool_calls: [{tool_used, tool_result}] }
    """
    _ensure_genai()
    system_prompt = _build_system_prompt(patient_context, recent_journal)
    gemini_tools = _build_gemini_tools(available_tools)

    model = genai.GenerativeModel(
        model_name="gemini-2.5-pro",
        system_instruction=system_prompt,
        tools=gemini_tools,
    )

    history = []
    for msg in conversation_history:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})

    chat = model.start_chat(history=history)
    response = await chat.send_message_async(user_message)

    all_tool_results = []  # accumulates every tool call across all turns
    max_turns = 6          # guard against infinite loops

    for turn in range(max_turns):
        calls_this_turn = _extract_all_tool_calls(response)
        text_this_turn = _extract_text(response)
        logger.info(
            "[Gemini] turn=%d tool_calls=%s text_preview=%r",
            turn + 1,
            [c[0] for c in calls_this_turn],
            text_this_turn[:120] if text_this_turn else "",
        )
        if not calls_this_turn or not tool_executor:
            break

        # Execute every tool call in this turn (may be >1 if Gemini batches them)
        response_parts = []
        for tool_name, tool_args in calls_this_turn:
            tool_result = await tool_executor(tool_name, tool_args)
            logger.info("[Gemini] tool=%s args=%s result=%s", tool_name, tool_args, tool_result)
            all_tool_results.append({"tool_used": tool_name, "tool_result": tool_result})
            response_parts.append(
                genai.protos.Part(
                    function_response=genai.protos.FunctionResponse(
                        name=tool_name,
                        response={"result": json.dumps(tool_result, default=str)},
                    )
                )
            )

        # Feed all results back in a single user turn, then continue the loop
        response = await chat.send_message_async(
            genai.protos.Content(role="user", parts=response_parts)
        )

    reply_text = _extract_text(response)
    logger.info("[Gemini] final reply (total tools=%d): %r", len(all_tool_results), reply_text[:200])

    if all_tool_results:
        return {
            "reply_text": reply_text,
            # keep singular fields for backward compat with simple single-tool paths
            "tool_used": all_tool_results[0]["tool_used"],
            "tool_result": all_tool_results[0]["tool_result"],
            "tool_calls": all_tool_results,
        }

    return {"reply_text": reply_text, "tool_used": None, "tool_result": None, "tool_calls": []}


async def parse_journal_entry(raw_input: str) -> dict:
    _ensure_genai()
    model = genai.GenerativeModel(model_name="gemini-2.5-pro")
    prompt = f"""Parse this health journal entry into structured JSON.

Input: "{raw_input}"

Return ONLY valid JSON with these fields:
{{
  "summary": "1-2 sentence AI summary",
  "pain_level": 0-10 or null,
  "pain_location": "string or null",
  "sleep_hours": number or null,
  "mood": "string or null",
  "energy_level": "high/medium/low or null",
  "symptoms": ["list of symptoms"],
  "notes": "any additional notes or null"
}}"""
    response = await model.generate_content_async(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


async def extract_keywords(problem_description: str) -> list:
    _ensure_genai()
    model = genai.GenerativeModel(model_name="gemini-2.5-pro")
    prompt = f"""Extract 3-5 medical keywords from this problem description for searching doctors.
Problem: "{problem_description}"
Return ONLY a JSON array of lowercase keywords. Example: ["back pain", "spine", "posture"]"""
    response = await model.generate_content_async(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
