import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DATABASE_NAME", "redapple")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Get the patient by ID
patient = db["patients"].find_one({"_id": ObjectId("6a04d627ed8b0db209d44778")})
if not patient:
    print("ERROR: Patient with given ID not found.")
    sys.exit(1)

# Look up doctor by ID
doctor = db["doctors"].find_one({"_id": ObjectId("6a04d69365173ba221cd07e8")})
if not doctor:
    print("ERROR: Doctor with given ID not found.")
    sys.exit(1)

doctor_id = doctor["_id"]
specialty  = doctor.get("specialty", "")
doctor_name = doctor.get("name", "Dr. Priya Sharma")

appointment = {
    "patient_id":    patient["_id"],
    "doctor_id":     doctor_id,
    "doctor_name":   doctor_name,
    "doctor_specialty": specialty,
    "date":          "2026-05-22",
    "time":          "3:00 PM",
    "duration_minutes": 30,
    "reason":        "follow up on back pain.",
    "status":        "confirmed",
    "google_calendar_event_id": None,
    "google_meet_link": None,
    "created_at":    datetime.utcnow(),
}

result = db["appointments"].insert_one(appointment)
print(f"Appointment inserted — _id: {result.inserted_id}")
print(f"  Doctor : {doctor_name}  ({specialty})")
print(f"  Date   : 2026-05-22  3:00 PM")
print(f"  Reason : follow up on back pain.")
client.close()
