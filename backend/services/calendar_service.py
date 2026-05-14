import os
import logging
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv(Path(__file__).parent.parent / ".env")

logger = logging.getLogger(__name__)

_SCOPES = ["https://www.googleapis.com/auth/calendar"]

# Always resolve token.json relative to the backend root, not cwd
_BACKEND_ROOT = Path(__file__).parent.parent
_TOKEN_FILE = _BACKEND_ROOT / os.getenv("GOOGLE_CALENDAR_TOKEN_FILE", "token.json")
_CLIENT_ID = os.getenv("GOOGLE_CALENDAR_CLIENT_ID", "")
_CLIENT_SECRET = os.getenv("GOOGLE_CALENDAR_CLIENT_SECRET", "")
_REDIRECT_URI = os.getenv("GOOGLE_CALENDAR_REDIRECT_URI", "http://localhost:8000/auth/google/callback")


def _get_client_config():
    return {
        "web": {
            "client_id": _CLIENT_ID,
            "client_secret": _CLIENT_SECRET,
            "redirect_uris": [_REDIRECT_URI],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }


def get_auth_url() -> str:
    flow = Flow.from_client_config(_get_client_config(), scopes=_SCOPES)
    flow.redirect_uri = _REDIRECT_URI
    auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline")
    return auth_url


def exchange_code(code: str) -> None:
    flow = Flow.from_client_config(_get_client_config(), scopes=_SCOPES)
    flow.redirect_uri = _REDIRECT_URI
    flow.fetch_token(code=code)
    creds = flow.credentials
    with open(_TOKEN_FILE, "w") as f:
        f.write(creds.to_json())
    logger.info(f"Token saved to {_TOKEN_FILE}")


def get_calendar_service():
    """Load credentials, auto-refresh if expired, return Calendar service."""
    if not _TOKEN_FILE.exists():
        raise RuntimeError(
            f"token.json not found at {_TOKEN_FILE}. "
            "Visit http://localhost:8000/auth/google to authenticate first."
        )

    creds = Credentials.from_authorized_user_file(str(_TOKEN_FILE), _SCOPES)

    logger.info(f"Credentials loaded — valid: {creds.valid}, expired: {creds.expired}, "
                f"has_refresh_token: {bool(creds.refresh_token)}")

    if not creds.valid:
        if creds.expired and creds.refresh_token:
            logger.info("Token expired — refreshing...")
            creds.refresh(Request())
            # Persist refreshed token
            with open(_TOKEN_FILE, "w") as f:
                f.write(creds.to_json())
            logger.info("Token refreshed and saved.")
        else:
            raise RuntimeError(
                "Credentials are invalid and cannot be refreshed. "
                "Re-authenticate at http://localhost:8000/auth/google"
            )

    return build("calendar", "v3", credentials=creds)


def get_calendar_status() -> dict:
    """Return diagnostic info about the calendar auth state."""
    if not _TOKEN_FILE.exists():
        return {"authenticated": False, "reason": f"token.json missing at {_TOKEN_FILE}"}
    try:
        creds = Credentials.from_authorized_user_file(str(_TOKEN_FILE), _SCOPES)
        return {
            "authenticated": True,
            "token_file": str(_TOKEN_FILE),
            "valid": creds.valid,
            "expired": creds.expired,
            "has_refresh_token": bool(creds.refresh_token),
            "scopes": list(creds.scopes or []),
        }
    except Exception as e:
        return {"authenticated": False, "reason": str(e)}


def _parse_datetime(date: str, time: str) -> datetime:
    """Parse date + time string into a datetime object."""
    dt_str = f"{date} {time}"
    formats = [
        "%Y-%m-%d %I:%M %p",   # 2025-04-28 3:00 PM
        "%Y-%m-%d %I:%M%p",    # 2025-04-28 3:00PM
        "%Y-%m-%d %H:%M",      # 2025-04-28 15:00
        "%Y-%m-%d %I %p",      # 2025-04-28 3 PM
    ]
    for fmt in formats:
        try:
            return datetime.strptime(dt_str, fmt)
        except ValueError:
            continue
    logger.warning(f"Could not parse '{dt_str}' with known formats, falling back to date only")
    return datetime.strptime(date, "%Y-%m-%d")


async def create_calendar_event(
    title: str,
    date: str,
    time: str,
    duration_minutes: int,
    description: str,
) -> dict:
    logger.info(f"[Calendar] Creating event: '{title}' on {date} at {time}")

    try:
        service = get_calendar_service()
    except RuntimeError as e:
        logger.error(f"[Calendar] Auth error: {e}")
        return {"event_id": None, "meet_link": None, "html_link": None, "error": str(e)}

    try:
        start_dt = _parse_datetime(date, time)
        end_dt = start_dt + timedelta(minutes=duration_minutes)

        logger.info(f"[Calendar] Event window: {start_dt.isoformat()} → {end_dt.isoformat()}")

        event = {
            "summary": title,
            "description": description,
            "start": {"dateTime": start_dt.isoformat(), "timeZone": "Asia/Kolkata"},
            "end":   {"dateTime": end_dt.isoformat(),   "timeZone": "Asia/Kolkata"},
            "conferenceData": {
                "createRequest": {
                    "requestId": f"redapple-{date}-{time}".replace(" ", "-"),
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            },
        }

        result = service.events().insert(
            calendarId="primary",
            body=event,
            conferenceDataVersion=1,
        ).execute()

        logger.info(f"[Calendar] Event created successfully. ID: {result.get('id')}")
        logger.info(f"[Calendar] Full API response: {result}")

        meet_link = None
        if "conferenceData" in result:
            for ep in result["conferenceData"].get("entryPoints", []):
                if ep.get("entryPointType") == "video":
                    meet_link = ep.get("uri")
                    break

        return {
            "event_id": result.get("id"),
            "meet_link": meet_link,
            "html_link": result.get("htmlLink"),
            "error": None,
        }

    except HttpError as e:
        logger.error(f"[Calendar] Google API HttpError {e.status_code}: {e.error_details}")
        logger.error(f"[Calendar] Full HttpError response: {e.content}")
        return {"event_id": None, "meet_link": None, "html_link": None,
                "error": f"Google API {e.status_code}: {e.error_details}"}

    except Exception as e:
        logger.exception(f"[Calendar] Unexpected error creating event: {e}")
        return {"event_id": None, "meet_link": None, "html_link": None, "error": str(e)}
