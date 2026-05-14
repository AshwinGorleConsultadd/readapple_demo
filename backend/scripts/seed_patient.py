import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pymongo import MongoClient
from datetime import datetime, timedelta, date
from dotenv import load_dotenv

load_dotenv()

PATIENT = {
    "name": "Ashwin",
    "age": 28,
    "gender": "Male",
    "blood_group": "B+",
    "phone": "+91 98765 43210",
    "email": "ashwin@example.com",
    "location": "Bangalore, India",
    "health_conditions": ["Mild back pain", "Occasional anxiety"],
    "current_medications": ["Vitamin D3"],
    "allergies": ["Penicillin"],
    "emergency_contact": {"name": "Ravi (Brother)", "phone": "+91 91234 56789"},
    "created_at": datetime.utcnow(),
}

TODAY = date.today()

JOURNAL_ENTRIES_RAW = [
    {
        "date": (TODAY - timedelta(days=6)).isoformat(),
        "raw_input": "Woke up with terrible back pain today, around 7 out of 10. Couldn't sleep well, maybe 4 hours. Feeling quite anxious about work.",
        "parsed_entry": {
            "summary": "Severe back pain at 7/10 with poor sleep of 4 hours and work-related anxiety.",
            "pain_level": 7,
            "pain_location": "lower back",
            "sleep_hours": 4.0,
            "mood": "anxious",
            "energy_level": "low",
            "symptoms": ["back pain", "insomnia", "anxiety"],
            "notes": "Work stress contributing to anxiety",
        },
        "source": "voice",
    },
    {
        "date": (TODAY - timedelta(days=3)).isoformat(),
        "raw_input": "Feeling slightly better today. Back pain is around 5 out of 10. Slept about 6 hours. Mood is okay.",
        "parsed_entry": {
            "summary": "Moderate improvement with back pain at 5/10 and better sleep of 6 hours.",
            "pain_level": 5,
            "pain_location": "lower back",
            "sleep_hours": 6.0,
            "mood": "neutral",
            "energy_level": "medium",
            "symptoms": ["back pain"],
            "notes": "Gradual improvement from previous days",
        },
        "source": "voice",
    },
    {
        "date": (TODAY - timedelta(days=1)).isoformat(),
        "raw_input": "Really tired today, skipped my morning walk. Back pain is back at 6 out of 10. Didn't sleep enough.",
        "parsed_entry": {
            "summary": "Fatigue and back pain at 6/10 after skipping exercise and insufficient sleep.",
            "pain_level": 6,
            "pain_location": "lower back",
            "sleep_hours": 5.0,
            "mood": "tired",
            "energy_level": "low",
            "symptoms": ["back pain", "fatigue"],
            "notes": "Skipped morning exercise",
        },
        "source": "voice",
    },
]


def seed():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/redapple")
    client = MongoClient(uri)
    db = client.get_default_database() if "/" in uri.split("//")[-1] else client["redapple"]

    db["patients"].delete_many({})
    patient_result = db["patients"].insert_one(PATIENT)
    patient_id = patient_result.inserted_id
    print(f"✓ Seeded patient: Ashwin (ID: {patient_id})")

    db["journal"].delete_many({"patient_id": patient_id})
    entries = []
    for e in JOURNAL_ENTRIES_RAW:
        entries.append({
            "patient_id": patient_id,
            "date": e["date"],
            "raw_input": e["raw_input"],
            "parsed_entry": e["parsed_entry"],
            "source": e["source"],
            "created_at": datetime.utcnow() - timedelta(
                days=(TODAY - date.fromisoformat(e["date"])).days
            ),
        })
    db["journal"].insert_many(entries)
    print(f"✓ Seeded {len(entries)} journal entries")
    client.close()


if __name__ == "__main__":
    seed()
