from fastapi import APIRouter, Query
from bson import ObjectId
from database.connection import get_db

router = APIRouter(prefix="/api/dockters", tags=["dockters"])


def _serialize(doc: dict) -> dict:
    if not doc:
        return doc
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def list_dockters(q: str | None = Query(None, description="Search query for name or specialty")):
    db = get_db()
    query = {}
    if q:
        regex = {"$regex": q, "$options": "i"}
        query = {"$or": [{"name": regex}, {"specialty": regex}, {"keywords": regex}]}

    cursor = db["doctors"].find(query).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(_serialize(doc))

    return results
