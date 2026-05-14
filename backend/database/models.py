from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class EmergencyContact(BaseModel):
    name: str
    phone: str


class Patient(BaseModel):
    name: str
    age: int
    gender: str
    blood_group: str
    phone: str
    email: str
    location: str
    health_conditions: List[str] = []
    current_medications: List[str] = []
    allergies: List[str] = []
    emergency_contact: EmergencyContact
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Doctor(BaseModel):
    name: str
    specialty: str
    sub_specialties: List[str] = []
    keywords: List[str] = []
    experience_years: int
    rating: float
    reviews_count: int
    languages: List[str] = []
    location: str
    availability: List[str] = []
    consultation_fee: int
    about: str
    profile_image_placeholder: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ParsedJournalEntry(BaseModel):
    summary: str
    pain_level: Optional[int] = None
    pain_location: Optional[str] = None
    sleep_hours: Optional[float] = None
    mood: Optional[str] = None
    energy_level: Optional[str] = None
    symptoms: List[str] = []
    notes: Optional[str] = None


class JournalEntryCreate(BaseModel):
    raw_input: str
    source: str = "manual"


class JournalEntry(BaseModel):
    patient_id: str
    date: str
    raw_input: str
    parsed_entry: ParsedJournalEntry
    source: str = "manual"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AppointmentCreate(BaseModel):
    doctor_name: str
    date: str
    time: str
    reason: str
    duration_minutes: int = 30


class Appointment(BaseModel):
    patient_id: str
    doctor_id: Optional[str] = None
    doctor_name: str
    doctor_specialty: str = ""
    date: str
    time: str
    duration_minutes: int = 30
    reason: str
    status: str = "confirmed"
    google_calendar_event_id: Optional[str] = None
    google_meet_link: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ConversationMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ConversationMessageRequest(BaseModel):
    user_message: str
    audio_input: bool = False


class ConversationResponse(BaseModel):
    reply_text: str
    reply_audio_base64: Optional[str] = None
    tool_used: Optional[str] = None        # first tool (backward compat)
    tool_result: Optional[dict] = None     # first result (backward compat)
    tool_calls: Optional[List[dict]] = []  # all tool calls [{tool_used, tool_result}]
    updated_conversation_id: Optional[str] = None
