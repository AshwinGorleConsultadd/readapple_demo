from fastapi import APIRouter

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "API is running"
    }
