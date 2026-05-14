import logging
from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from services.calendar_service import get_auth_url, exchange_code, get_calendar_status, create_calendar_event
from datetime import date

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.get("/google")
async def google_auth():
    url = get_auth_url()
    return RedirectResponse(url=url)


@router.get("/google/callback")
async def google_callback(code: str):
    exchange_code(code)
    return {"message": "Google Calendar authenticated successfully. You can close this tab."}


@router.get("/calendar/status")
async def calendar_status():
    """Check Google Calendar auth state — open in browser to diagnose issues."""
    return get_calendar_status()


@router.get("/calendar/test")
async def calendar_test():
    """Create a test event right now — proves end-to-end calendar write works."""
    logger.info("[CalendarTest] Creating test event...")
    result = await create_calendar_event(
        title="Redapple Test Event",
        date=date.today().isoformat(),
        time="3:00 PM",
        duration_minutes=30,
        description="Test event created by Redapple to verify calendar integration.",
    )
    logger.info(f"[CalendarTest] Result: {result}")
    return result
