import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DOCTORS = [
    {
        "name": "Dr. Priya Sharma",
        "specialty": "Chiropractor",
        "sub_specialties": ["Back pain", "Spine rehabilitation", "Posture correction"],
        "keywords": ["back pain", "spine", "posture", "neck pain", "joint", "chiropractic", "lower back"],
        "experience_years": 9,
        "rating": 4.8,
        "reviews_count": 134,
        "languages": ["English", "Hindi"],
        "location": "Bangalore, India",
        "availability": ["Monday", "Wednesday", "Friday"],
        "consultation_fee": 800,
        "about": "Specialist in spinal alignment and chronic back pain. Uses evidence-based chiropractic techniques for lasting relief.",
        "profile_image_placeholder": "PS",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Arjun Mehta",
        "specialty": "Therapist / Psychologist",
        "sub_specialties": ["Anxiety", "Stress management", "Depression", "CBT"],
        "keywords": ["anxiety", "stress", "mental health", "depression", "panic", "worry", "therapy", "counseling", "mood"],
        "experience_years": 7,
        "rating": 4.9,
        "reviews_count": 210,
        "languages": ["English", "Hindi", "Kannada"],
        "location": "Bangalore, India",
        "availability": ["Tuesday", "Thursday", "Saturday"],
        "consultation_fee": 1200,
        "about": "Licensed clinical psychologist specializing in anxiety and stress disorders using CBT and mindfulness approaches.",
        "profile_image_placeholder": "AM",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Kavya Nair",
        "specialty": "General Physician",
        "sub_specialties": ["Fever", "Cold", "General wellness", "Preventive care"],
        "keywords": ["fever", "cold", "flu", "cough", "general", "wellness", "checkup", "fatigue", "headache", "body ache"],
        "experience_years": 12,
        "rating": 4.7,
        "reviews_count": 380,
        "languages": ["English", "Hindi", "Malayalam"],
        "location": "Bangalore, India",
        "availability": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "consultation_fee": 500,
        "about": "Experienced general physician focused on preventive healthcare and managing common illnesses with a holistic approach.",
        "profile_image_placeholder": "KN",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Rohan Gupta",
        "specialty": "Nutritionist / Dietitian",
        "sub_specialties": ["Diet planning", "Weight management", "Gut health", "Sports nutrition"],
        "keywords": ["diet", "weight", "nutrition", "gut", "digestion", "eating", "obesity", "metabolism", "food", "calories"],
        "experience_years": 6,
        "rating": 4.6,
        "reviews_count": 95,
        "languages": ["English", "Hindi"],
        "location": "Bangalore, India",
        "availability": ["Monday", "Wednesday", "Friday", "Saturday"],
        "consultation_fee": 700,
        "about": "Certified clinical nutritionist helping patients achieve health goals through personalized diet plans and lifestyle changes.",
        "profile_image_placeholder": "RG",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Sneha Reddy",
        "specialty": "Physiotherapist",
        "sub_specialties": ["Injury recovery", "Joint pain", "Mobility", "Sports rehab"],
        "keywords": ["physiotherapy", "injury", "mobility", "joint pain", "rehabilitation", "muscle", "stiffness", "knee", "shoulder", "exercise"],
        "experience_years": 8,
        "rating": 4.7,
        "reviews_count": 167,
        "languages": ["English", "Telugu", "Kannada"],
        "location": "Bangalore, India",
        "availability": ["Tuesday", "Thursday", "Saturday"],
        "consultation_fee": 900,
        "about": "Sports and orthopedic physiotherapist with expertise in post-surgical rehabilitation and chronic pain management.",
        "profile_image_placeholder": "SR",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Vikram Iyer",
        "specialty": "Cardiologist",
        "sub_specialties": ["Heart health", "Blood pressure", "Cholesterol", "Cardiac rehab"],
        "keywords": ["heart", "cardiac", "blood pressure", "cholesterol", "hypertension", "chest pain", "palpitations", "cardiovascular"],
        "experience_years": 15,
        "rating": 4.9,
        "reviews_count": 420,
        "languages": ["English", "Hindi", "Tamil"],
        "location": "Bangalore, India",
        "availability": ["Monday", "Wednesday", "Friday"],
        "consultation_fee": 1500,
        "about": "Senior interventional cardiologist with 15 years of experience in heart disease prevention and treatment.",
        "profile_image_placeholder": "VI",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Pooja Desai",
        "specialty": "Dermatologist",
        "sub_specialties": ["Acne", "Hair loss", "Skin allergies", "Cosmetic dermatology"],
        "keywords": ["skin", "acne", "rash", "hair loss", "dermatology", "eczema", "psoriasis", "allergy", "itching", "pigmentation"],
        "experience_years": 10,
        "rating": 4.8,
        "reviews_count": 289,
        "languages": ["English", "Hindi", "Gujarati"],
        "location": "Bangalore, India",
        "availability": ["Tuesday", "Thursday", "Saturday"],
        "consultation_fee": 1000,
        "about": "Board-certified dermatologist specializing in medical and cosmetic skin conditions with a patient-first approach.",
        "profile_image_placeholder": "PD",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Anand Krishnan",
        "specialty": "Sleep Specialist",
        "sub_specialties": ["Insomnia", "Sleep apnea", "Fatigue", "Sleep hygiene"],
        "keywords": ["sleep", "insomnia", "fatigue", "tired", "sleep apnea", "snoring", "restless", "night", "waking up", "exhaustion"],
        "experience_years": 11,
        "rating": 4.7,
        "reviews_count": 143,
        "languages": ["English", "Tamil", "Kannada"],
        "location": "Bangalore, India",
        "availability": ["Monday", "Wednesday", "Saturday"],
        "consultation_fee": 1100,
        "about": "Sleep medicine specialist helping patients overcome sleep disorders with cognitive behavioral therapy and medical interventions.",
        "profile_image_placeholder": "AK",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Meera Joshi",
        "specialty": "Dentist",
        "sub_specialties": ["Dental pain", "Teeth cleaning", "Root canal", "Oral health"],
        "keywords": ["dental", "teeth", "tooth pain", "cavity", "gum", "oral", "mouth", "toothache", "braces", "cleaning"],
        "experience_years": 8,
        "rating": 4.6,
        "reviews_count": 198,
        "languages": ["English", "Hindi", "Marathi"],
        "location": "Bangalore, India",
        "availability": ["Monday", "Tuesday", "Thursday", "Friday"],
        "consultation_fee": 600,
        "about": "General and cosmetic dentist offering comprehensive oral care with a gentle, patient-friendly approach.",
        "profile_image_placeholder": "MJ",
        "created_at": datetime.utcnow(),
    },
    {
        "name": "Dr. Siddharth Rao",
        "specialty": "Health Coach",
        "sub_specialties": ["Lifestyle", "Fitness", "Preventive wellness", "Habit formation"],
        "keywords": ["lifestyle", "fitness", "wellness", "exercise", "habit", "preventive", "healthy", "energy", "motivation", "stress"],
        "experience_years": 5,
        "rating": 4.5,
        "reviews_count": 72,
        "languages": ["English", "Kannada", "Telugu"],
        "location": "Bangalore, India",
        "availability": ["Tuesday", "Thursday", "Saturday", "Sunday"],
        "consultation_fee": 600,
        "about": "Certified health coach focused on sustainable lifestyle transformations through personalized fitness and wellness programs.",
        "profile_image_placeholder": "SR2",
        "created_at": datetime.utcnow(),
    },
]


def seed():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/redapple")
    client = MongoClient(uri)
    db = client.get_default_database() if "/" in uri.split("//")[-1] else client["redapple"]

    db["doctors"].delete_many({})
    result = db["doctors"].insert_many(DOCTORS)
    print(f"✓ Seeded {len(result.inserted_ids)} doctors")
    client.close()


if __name__ == "__main__":
    seed()
