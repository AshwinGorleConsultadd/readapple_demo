from database.connection import get_db
from services.gemini_service import extract_keywords


async def search_doctors_by_problem(problem_description: str, limit: int = 3) -> list:
    try:
        keywords = await extract_keywords(problem_description)
    except Exception:
        keywords = problem_description.lower().split()

    db = get_db()
    regex_filters = [{"keywords": {"$regex": kw, "$options": "i"}} for kw in keywords]

    cursor = db["doctors"].find(
        {"$or": regex_filters} if regex_filters else {},
        {"_id": 1, "name": 1, "specialty": 1, "sub_specialties": 1, "experience_years": 1,
         "rating": 1, "reviews_count": 1, "languages": 1, "location": 1,
         "availability": 1, "consultation_fee": 1, "about": 1, "profile_image_placeholder": 1},
    ).sort("rating", -1).limit(limit)

    doctors = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doctors.append(doc)

    return doctors
