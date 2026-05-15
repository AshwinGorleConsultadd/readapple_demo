from fastapi import APIRouter, Query, HTTPException
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


@router.get("/{dockter_id}")
async def get_dockter(dockter_id: str):
    db = get_db()
    try:
        doc = await db["doctors"].find_one({"_id": ObjectId(dockter_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return _serialize(doc)


@router.delete("/{dockter_id}")
async def delete_dockter(dockter_id: str):
    db = get_db()
    try:
        result = await db["doctors"].delete_one({"_id": ObjectId(dockter_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"deleted": True, "dockter_id": dockter_id}
    except Exception as e:
        if "404" in str(e):
            raise
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
