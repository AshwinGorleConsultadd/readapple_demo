from services.doctor_service import search_doctors_by_problem

SEARCH_DOCTORS_TOOL = {
    "name": "search_doctors",
    "description": "Search for relevant doctors based on the patient's health problem or symptoms.",
    "parameters": {
        "problem": "the health problem or symptoms described by patient",
    },
}


async def execute_search_doctors(params: dict) -> dict:
    problem = params.get("problem", "")
    doctors = await search_doctors_by_problem(problem, limit=3)
    return {
        "doctors": doctors,
        "count": len(doctors),
        "message": f"Found {len(doctors)} doctors matching your concern.",
    }
