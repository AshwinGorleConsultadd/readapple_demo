import os
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
_BASE_URL = "https://api.elevenlabs.io/v1"
_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice


async def speech_to_text(audio_bytes: bytes) -> str:
    if not _API_KEY:
        return "[ElevenLabs API key not configured]"
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{_BASE_URL}/speech-to-text",
            headers={"xi-api-key": _API_KEY},
            files={"file": ("audio.webm", audio_bytes, "audio/webm")},
            data={"model_id": "scribe_v1"},
        )
        response.raise_for_status()
        data = response.json()
        return data.get("text", "")


async def text_to_speech(text: str) -> bytes:
    if not _API_KEY:
        return b""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{_BASE_URL}/text-to-speech/{_VOICE_ID}",
            headers={
                "xi-api-key": _API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                },
            },
        )
        response.raise_for_status()
        return response.content
