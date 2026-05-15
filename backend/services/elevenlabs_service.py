import os
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
_BASE_URL = "https://api.elevenlabs.io/v1"
_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # Rachel voice


async def speech_to_text(audio_bytes: bytes, filename: str = "recording.webm") -> str:
    if not _API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not configured")
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{_BASE_URL}/speech-to-text",
            headers={"xi-api-key": _API_KEY},
            files={"file": (filename, audio_bytes, "audio/webm")},
            data={"model_id": "scribe_v1"},
        )
        response.raise_for_status()
        return response.json().get("text", "")


async def text_to_speech(text: str) -> bytes:
    print("text to speach call with api", _API_KEY)
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
