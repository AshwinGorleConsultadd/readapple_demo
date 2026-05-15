# Redapple — Voice-Activated Health Demo
## Claude Code Implementation Prompt

---

## 1. Project Overview

Build a **mobile-first, voice-activated health platform demo** called **Redapple**. This is a client-facing demo — not a production system. The goal is to showcase three AI-powered voice features to impress a potential client during a live meeting. Everything revolves around one patient: **Ashwin**.

The project already has two scaffolded folders:
- `frontend/` — React app (no features yet)
- `backend/` — FastAPI app with MongoDB connection (no features yet)

Do not modify the existing scaffold setup. Add all new code on top of what is already there.

---

## 2. Environment Variables

Create a `.env` file in `backend/` with the following keys. Do not hardcode any secrets in code:

```
MONGODB_URI=mongodb://localhost:27017/redapple
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:8000/auth/google/callback
GOOGLE_CALENDAR_TOKEN_FILE=token.json
```

Create a `.env` file in `frontend/` with:

```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Mobile-first, ~390px |
| Backend | FastAPI (Python) | Modular routers |
| Database | MongoDB | Via pymongo / motor |
| LLM | Google Gemini `gemini-2.5-pro` | For all AI logic |
| STT | ElevenLabs Speech-to-Text API | Convert mic audio to text |
| TTS | ElevenLabs Text-to-Speech API | AI voice replies |
| Calendar | Google Calendar API (OAuth2) | Book on owner account only |

---

## 4. Core Rules

1. **No login or signup** — app always opens directly as patient Ashwin
2. **One patient only** — Ashwin. No multi-user logic needed
3. **Mobile-first** — design for 390px width. No desktop layout needed
4. **Modular code** — one responsibility per file. No large monolithic files
5. **Brand color** — Red `#E24B4A` is the primary brand color throughout the UI
6. **Clean UI** — use Tailwind CSS. Keep it minimal, white surfaces, clean typography
7. **Demo mindset** — prioritise impressive UX over exhaustive error handling

---

## 5. Project File Structure

Implement exactly this structure:

```
backend/
  main.py                          ← FastAPI app entry point, mounts all routers
  .env
  requirements.txt
  token.json                       ← Google OAuth token (auto-generated after auth)

  database/
    connection.py                  ← MongoDB client and db instance
    models.py                      ← Pydantic models for all entities

  routers/
    conversation.py                ← POST /conversation/message (main AI endpoint)
    appointments.py                ← GET /appointments, POST /appointments
    journal.py                     ← GET /journal, POST /journal
    profile.py                     ← GET /profile (Ashwin's data)
    auth.py                        ← GET /auth/google, /auth/google/callback

  services/
    gemini_service.py              ← Gemini API client, send_message(), tool call handling
    elevenlabs_service.py          ← STT (audio → text) and TTS (text → audio)
    calendar_service.py            ← Google Calendar OAuth + create_event()
    doctor_service.py              ← Search doctors from MongoDB by specialty/problem

  tools/
    book_appointment.py            ← Tool definition + handler: saves to MongoDB + Google Calendar
    log_journal.py                 ← Tool definition + handler: parses + saves journal entry
    search_doctors.py              ← Tool definition + handler: finds relevant doctors from DB

  scripts/
    seed_doctors.py                ← Seeds 10 mock doctors into MongoDB
    seed_patient.py                ← Seeds Ashwin's patient profile into MongoDB

frontend/
  src/
    .env

    pages/
      Home.jsx                     ← Voice chat (main page / central AI hub)
      Appointments.jsx             ← List of booked appointments
      Journal.jsx                  ← Journal entries + manual add entry
      Profile.jsx                  ← Ashwin's profile page

    components/
      layout/
        BottomNav.jsx              ← Mobile bottom navigation bar (4 tabs)
        PageHeader.jsx             ← Top header with page title and logo

      voice/
        VoiceButton.jsx            ← Microphone button with recording state + waveform
        WaveformAnimation.jsx      ← Animated sound wave shown while listening/speaking

      chat/
        ChatBubble.jsx             ← Single message bubble (user or AI)
        ChatThread.jsx             ← Scrollable list of ChatBubbles
        DoctorSuggestionCard.jsx   ← Doctor card rendered inside chat thread
        TypingIndicator.jsx        ← Animated dots while AI is thinking

      appointments/
        AppointmentCard.jsx        ← Single appointment display card

      journal/
        JournalEntryCard.jsx       ← Single journal entry display
        AddJournalModal.jsx        ← Modal for manual journal entry typing

      profile/
        ProfileCard.jsx            ← Ashwin's profile info display

    hooks/
      useVoice.js                  ← Custom hook: mic recording, STT, TTS playback
      useConversation.js           ← Custom hook: manages chat history state + API calls
      useAppointments.js           ← Custom hook: fetch/create appointments
      useJournal.js                ← Custom hook: fetch/create journal entries

    api/
      client.js                    ← Axios instance with base URL from env
      conversation.js              ← API calls for /conversation
      appointments.js              ← API calls for /appointments
      journal.js                   ← API calls for /journal
      profile.js                   ← API calls for /profile

    App.jsx                        ← Router setup with 4 routes
    main.jsx                       ← Entry point
    index.css                      ← Tailwind directives
```

---

## 6. Database Schema

### Collection: `patients`
```json
{
  "_id": "ObjectId",
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
  "emergency_contact": { "name": "Ravi (Brother)", "phone": "+91 91234 56789" },
  "created_at": "ISODate"
}
```

### Collection: `doctors`
```json
{
  "_id": "ObjectId",
  "name": "Dr. Priya Sharma",
  "specialty": "Chiropractor",
  "sub_specialties": ["Back pain", "Spine rehabilitation", "Posture correction"],
  "keywords": ["back pain", "spine", "posture", "neck pain", "joint"],
  "experience_years": 9,
  "rating": 4.8,
  "reviews_count": 134,
  "languages": ["English", "Hindi"],
  "location": "Bangalore, India",
  "availability": ["Monday", "Wednesday", "Friday"],
  "consultation_fee": 800,
  "about": "Short 2-line bio",
  "profile_image_placeholder": "initials e.g. PS",
  "created_at": "ISODate"
}
```

### Collection: `appointments`
```json
{
  "_id": "ObjectId",
  "patient_id": "ObjectId ref patients",
  "doctor_id": "ObjectId ref doctors",
  "doctor_name": "Dr. Priya Sharma",
  "doctor_specialty": "Chiropractor",
  "date": "2025-04-28",
  "time": "3:00 PM",
  "duration_minutes": 30,
  "reason": "Back pain consultation",
  "status": "confirmed",
  "google_calendar_event_id": "string",
  "google_meet_link": "string or null",
  "created_at": "ISODate"
}
```

### Collection: `journal`
```json
{
  "_id": "ObjectId",
  "patient_id": "ObjectId ref patients",
  "date": "2025-04-24",
  "raw_input": "original unedited text from user",
  "parsed_entry": {
    "summary": "AI-cleaned summary in 1-2 sentences",
    "pain_level": 6,
    "pain_location": "lower back",
    "sleep_hours": 5,
    "mood": "anxious",
    "energy_level": "low",
    "symptoms": ["back pain", "fatigue"],
    "notes": "any additional relevant detail"
  },
  "source": "voice | manual",
  "created_at": "ISODate"
}
```

### Collection: `conversations`
```json
{
  "_id": "ObjectId",
  "patient_id": "ObjectId ref patients",
  "messages": [
    {
      "role": "user | assistant",
      "content": "message text",
      "timestamp": "ISODate"
    }
  ],
  "last_updated": "ISODate"
}
```

---

## 7. Seed Scripts

### `scripts/seed_doctors.py`

Seed exactly **10 doctors** with diverse specialties. Required mix:
1. **Chiropractor** — back pain, spine, posture
2. **Therapist / Psychologist** — anxiety, stress, mental health
3. **General Physician** — fever, colds, general wellness
4. **Nutritionist / Dietitian** — diet, weight, gut health
5. **Physiotherapist** — injury recovery, mobility, joint pain
6. **Cardiologist** — heart health, blood pressure, cholesterol
7. **Dermatologist** — skin issues, acne, hair loss
8. **Sleep Specialist** — insomnia, sleep apnea, fatigue
9. **Dentist** — dental pain, teeth cleaning, oral health
10. **Health Coach** — lifestyle, fitness, preventive wellness

Each doctor must have the `keywords` array filled with common symptom words a patient might naturally say so the search tool can match them accurately.

### `scripts/seed_patient.py`

Seed Ashwin's profile as shown in Section 6. Also seed 3 recent journal entries (from last 7 days) showing:
- Entry 1: Back pain 7/10, poor sleep, mild anxiety
- Entry 2: Feeling slightly better, back pain 5/10
- Entry 3: Tired, skipped exercise, back pain 6/10

These pre-seeded journal entries are important — they power the AI greeting on first open.

---

## 8. Backend Implementation

### `database/connection.py`
- Create MongoDB async client using `motor`
- Export `db` instance for use across services
- Load `MONGODB_URI` from `.env`

### `database/models.py`
- Pydantic models for: `Patient`, `Doctor`, `Appointment`, `JournalEntry`, `ConversationMessage`, `Conversation`
- Include both request models (for input) and response models (for output)

---

### `services/gemini_service.py`

This is the core AI brain. Implement:

```python
async def send_message(
    user_message: str,
    conversation_history: list,
    patient_context: dict,        # Ashwin's profile
    recent_journal: list,         # Last 5 journal entries
    available_tools: list         # Tool definitions
) -> dict:
    # Returns: { "reply_text": str, "tool_calls": list | None }
```

**System prompt to use for Gemini:**

```
You are Redapple AI — a warm, intelligent voice health assistant for a patient named {patient_name}.

Your personality: friendly, empathetic, concise. You speak like a helpful health companion, not a robot.

Patient context:
{patient_profile}

Recent health journal:
{recent_journal_summary}

Your capabilities:
1. Answer health questions intelligently using patient's history
2. Suggest relevant doctors when patient describes a health problem (use search_doctors tool)
3. Book appointments when patient confirms they want one (use book_appointment tool)
4. Log journal entries when patient wants to record their health update (use log_journal tool)

Rules:
- Keep responses SHORT — max 2-3 sentences. This is voice output so brevity is critical.
- Always be proactive. If journal shows recurring back pain, ask about it.
- If user's intent is unclear, ask a clarifying question before taking action.
- When showing doctors, call search_doctors tool. The frontend will render the list.
- When booking, always confirm doctor name, date and time before calling book_appointment tool.
- Never make up information. If unsure, ask.
- Respond only in plain text — no markdown, no bullet points. This is spoken aloud.
```

**Tool calling:**
- Use Gemini's native function calling feature
- After each tool call, feed the tool result back to Gemini and get the final spoken reply
- Handle multi-turn tool calling if needed (e.g. search → confirm → book)

---

### `services/elevenlabs_service.py`

Implement two functions:

```python
async def speech_to_text(audio_bytes: bytes) -> str:
    # Call ElevenLabs STT API
    # Returns transcribed text string

async def text_to_speech(text: str) -> bytes:
    # Call ElevenLabs TTS API
    # Use a warm, natural voice (recommend: "Rachel" or "Aria" voice)
    # Returns audio bytes (mp3)
```

---

### `services/calendar_service.py`

Implement Google Calendar OAuth2 flow:

```python
def get_calendar_service():
    # Load credentials from token.json if exists
    # If not, raise error with instructions to run auth flow first
    # Return google calendar service object

async def create_calendar_event(
    title: str,
    date: str,           # "2025-04-28"
    time: str,           # "3:00 PM"
    duration_minutes: int,
    description: str
) -> dict:
    # Creates event on owner's Google Calendar
    # Returns { "event_id": str, "meet_link": str | None, "html_link": str }
```

Also create `GET /auth/google` and `GET /auth/google/callback` routes in `routers/auth.py` so the owner can authenticate once before the demo and the token gets saved to `token.json`.

---

### `services/doctor_service.py`

```python
async def search_doctors_by_problem(problem_description: str, limit: int = 3) -> list:
    # Use Gemini to extract keywords from problem_description
    # Search doctors collection using those keywords against the 'keywords' array field
    # Return top matching doctors sorted by rating
```

---

### `tools/book_appointment.py`

Tool definition for Gemini function calling:

```python
BOOK_APPOINTMENT_TOOL = {
    "name": "book_appointment",
    "description": "Book a medical appointment with a doctor. Call this only after confirming doctor name, date, and time with the patient.",
    "parameters": {
        "doctor_name": "string — full name of the doctor",
        "date": "string — appointment date in YYYY-MM-DD format",
        "time": "string — appointment time e.g. '3:00 PM'",
        "reason": "string — brief reason for the appointment"
    }
}

async def execute_book_appointment(params: dict) -> dict:
    # 1. Find doctor in MongoDB by name
    # 2. Create event via calendar_service.create_calendar_event()
    # 3. Save appointment to MongoDB appointments collection
    # 4. Return confirmation message with details
```

---

### `tools/log_journal.py`

```python
LOG_JOURNAL_TOOL = {
    "name": "log_journal",
    "description": "Save a health journal entry for the patient. Call this when patient wants to log their health update, symptoms, or daily status.",
    "parameters": {
        "raw_input": "string — exactly what the patient said",
    }
}

async def execute_log_journal(params: dict) -> dict:
    # 1. Send raw_input to Gemini to parse into structured journal format
    # 2. Extract: pain_level, pain_location, sleep_hours, mood, energy_level, symptoms, summary
    # 3. Save to MongoDB journal collection with both raw_input and parsed_entry
    # 4. Return confirmation with summary of what was logged
```

---

### `tools/search_doctors.py`

```python
SEARCH_DOCTORS_TOOL = {
    "name": "search_doctors",
    "description": "Search for relevant doctors based on the patient's health problem or symptoms.",
    "parameters": {
        "problem": "string — the health problem or symptoms described by patient"
    }
}

async def execute_search_doctors(params: dict) -> dict:
    # 1. Call doctor_service.search_doctors_by_problem()
    # 2. Return list of top 3 matching doctors with key fields
    # 3. This result gets shown as DoctorSuggestionCards in the chat UI
```

---

### `routers/conversation.py`

```
POST /conversation/message
Body: { "user_message": str, "audio_input": bool }
Response: { 
  "reply_text": str, 
  "reply_audio_base64": str,    ← TTS audio as base64
  "tool_used": str | null,       ← "book_appointment" | "log_journal" | "search_doctors" | null
  "tool_result": dict | null,    ← structured data for frontend to render (e.g. doctor list)
  "updated_conversation_id": str 
}
```

Flow inside this endpoint:
1. Load Ashwin's profile from DB
2. Load last 5 journal entries from DB
3. Load existing conversation history from DB
4. Send everything to `gemini_service.send_message()` with all 3 tool definitions
5. If Gemini calls a tool → execute the tool → send result back to Gemini → get final reply
6. Convert final reply text to audio via `elevenlabs_service.text_to_speech()`
7. Save updated conversation to DB
8. Return full response object

```
POST /conversation/audio-message
Body: multipart/form-data with audio file
Response: same as above
```

This endpoint first calls `elevenlabs_service.speech_to_text()` on the audio, then proceeds as above.

---

### `routers/appointments.py`

```
GET  /appointments          → list all appointments for Ashwin, sorted by date desc
POST /appointments          → direct create (used by tool, not frontend directly)
GET  /appointments/{id}     → single appointment detail
```

---

### `routers/journal.py`

```
GET  /journal               → all journal entries for Ashwin, sorted by date desc
POST /journal               → create new entry (for manual add from frontend)
                              Body: { "raw_input": str, "source": "manual" }
                              Parse with Gemini before saving, same as tool
GET  /journal/summary       → returns AI-generated summary of last 30 days
```

---

### `routers/profile.py`

```
GET /profile                → return Ashwin's patient profile
```

---

## 9. Frontend Implementation

### App.jsx — Router

```jsx
// 4 routes:
// /           → Home (Voice Chat)
// /appointments → Appointments list
// /journal    → Journal page
// /profile    → Profile page
// All routes share BottomNav
```

---

### `hooks/useVoice.js`

This hook manages the entire voice interaction lifecycle:

```js
// State:
// - isListening: bool
// - isAISpeaking: bool
// - transcript: string (live from STT)

// Functions:
// - startListening(): starts mic recording
// - stopListening(): stops mic, sends audio to backend /conversation/audio-message
// - playAudioReply(base64audio): plays TTS audio response
// - cancelSpeaking(): stops AI audio playback

// Implementation notes:
// - Use MediaRecorder API to capture mic audio
// - Record as webm/opus format
// - Show waveform animation while recording
// - Auto-stop recording after 3 seconds of silence (use audio level detection)
```

---

### `pages/Home.jsx` — Voice Chat (Main Page)

This is the most important screen. Build it like a messaging app with voice controls.

**Layout (top to bottom):**
```
┌────────────────────────────┐
│  🍎 Redapple          [⋮]  │  ← PageHeader
├────────────────────────────┤
│                            │
│   [ChatThread]             │  ← Scrollable, flex-col-reverse
│   - AI greeting bubble     │
│   - User bubbles           │
│   - AI reply bubbles       │
│   - DoctorSuggestionCards  │  ← Rendered inline in chat when tool_result has doctors
│                            │
├────────────────────────────┤
│  [TypingIndicator]         │  ← Shown while AI is thinking
├────────────────────────────┤
│ ┌──────────────────────┐   │
│ │ [transcript preview] │   │  ← Shows live text while user is speaking
│ └──────────────────────┘   │
│     [VoiceButton]          │  ← Big centered mic button
└────────────────────────────┘
        [BottomNav]
```

**Behaviour:**
- On page load: fetch Ashwin's profile + last 3 journal entries → send to backend to generate personalized greeting → play greeting audio automatically
- User taps VoiceButton → recording starts → waveform animates
- User taps again (or silence detected) → recording stops → audio sent to backend
- Show TypingIndicator while waiting for response
- When response arrives: add AI bubble to chat + play audio
- If `tool_result` contains doctors: render DoctorSuggestionCards in the chat thread after the AI bubble
- If `tool_used` is `book_appointment`: show a confirmation card in chat
- If `tool_used` is `log_journal`: show a small "Journal saved ✓" card in chat
- Auto-scroll to latest message after each exchange
- Chat history persists — reload loads previous conversation from DB

---

### `components/voice/VoiceButton.jsx`

```jsx
// Large circular button, centered at bottom of chat
// States:
// - idle: white circle with red mic icon, red border
// - listening: pulsing red circle with white mic icon + WaveformAnimation
// - ai_speaking: animated waveform, "tap to interrupt" hint text
// Size: 72px diameter
// On tap: toggle listening on/off
```

---

### `components/chat/DoctorSuggestionCard.jsx`

Rendered inline in the chat thread when AI suggests doctors:

```jsx
// Shows for each doctor:
// - Colored avatar circle with initials
// - Name + specialty
// - Rating (stars) + experience years
// - "Book Appointment" button → sends "Book appointment with [doctor name]" as voice message
// Card width: full width inside chat bubble area
// Max 3 doctors shown
```

---

### `pages/Journal.jsx`

```
┌────────────────────────────┐
│  Health Journal      [+ Add]│  ← Add button opens AddJournalModal
├────────────────────────────┤
│  [JournalEntryCard]         │
│  Apr 24 · via voice         │
│  Back pain 6/10 · Sleep 5h  │
│  Mood: Anxious              │
├────────────────────────────┤
│  [JournalEntryCard]         │
│  ...                        │
└────────────────────────────┘
```

Each `JournalEntryCard` shows:
- Date + source (voice/manual)
- AI-parsed summary
- Pain level badge (color coded: green < 4, yellow 4-6, red > 6)
- Sleep hours, mood, energy level
- Expandable to see full parsed details

`AddJournalModal`:
- Text area for typing
- Submit button → POST /journal with source: "manual"
- Shows parsed result after save

---

### `pages/Appointments.jsx`

```
┌────────────────────────────┐
│  Appointments               │
├────────────────────────────┤
│  Upcoming                   │
│  [AppointmentCard]          │
│  Dr. Priya Sharma           │
│  Chiropractor               │
│  Mon Apr 28 · 3:00 PM       │
│  [View in Calendar] button  │
├────────────────────────────┤
│  Past                       │
│  [AppointmentCard]          │
└────────────────────────────┘
```

---

### `pages/Profile.jsx`

Display Ashwin's profile data cleanly:
- Name, age, blood group, location
- Health conditions (pills/tags)
- Current medications
- Allergies
- Emergency contact

---

### `components/layout/BottomNav.jsx`

4 tabs with icons + labels:

| Tab | Icon | Route |
|---|---|---|
| Home | microphone | / |
| Appointments | calendar | /appointments |
| Journal | notebook | /journal |
| Profile | user | /profile |

Active tab: red color. Inactive: gray. Fixed to bottom.

---

## 10. Google Calendar Setup Instructions

Add these instructions as a `CALENDAR_SETUP.md` file in the project root:

```markdown
# Google Calendar Auth Setup

Run this once before the demo to authenticate:

1. Start the backend: uvicorn main:app --reload
2. Open in browser: http://localhost:8000/auth/google
3. Sign in with the demo Google account
4. Approve calendar access
5. Token saved to token.json automatically
6. All demo appointments will be booked on this account
```

---

## 11. Installation & Run Instructions

Create a `README.md` in project root:

```markdown
# Redapple Demo — Setup

## Backend
cd backend
pip install -r requirements.txt
cp .env.example .env       # Fill in API keys
python scripts/seed_doctors.py
python scripts/seed_patient.py
uvicorn main:app --reload

## Frontend
cd frontend
npm install
cp .env.example .env       # Set VITE_API_BASE_URL
npm run dev

## Google Calendar (run once)
Open http://localhost:8000/auth/google in browser and complete OAuth
```

---

## 12. requirements.txt (backend)

```
fastapi
uvicorn
motor
pymongo
python-dotenv
google-generativeai
google-auth-oauthlib
google-api-python-client
httpx
python-multipart
pydantic
```

---

## 13. Implementation Order

Build in this exact sequence to ensure a working demo at each stage:

1. **Database** — `connection.py`, `models.py`, seed scripts → verify data in MongoDB
2. **Backend services** — `elevenlabs_service.py`, `gemini_service.py`, `calendar_service.py`, `doctor_service.py`
3. **Tools** — `search_doctors.py`, `log_journal.py`, `book_appointment.py`
4. **Routers** — `profile.py`, `journal.py`, `appointments.py`, `conversation.py`
5. **Frontend foundation** — Tailwind setup, `App.jsx`, `BottomNav.jsx`, `PageHeader.jsx`, all API client files
6. **Profile page** — simplest page, good to verify frontend-backend connection
7. **Journal page** — `JournalEntryCard.jsx`, `AddJournalModal.jsx`, `useJournal.js`, `Journal.jsx`
8. **Appointments page** — `AppointmentCard.jsx`, `useAppointments.js`, `Appointments.jsx`
9. **Voice infrastructure** — `VoiceButton.jsx`, `WaveformAnimation.jsx`, `useVoice.js`
10. **Home chat page** — `ChatBubble.jsx`, `ChatThread.jsx`, `DoctorSuggestionCard.jsx`, `TypingIndicator.jsx`, `useConversation.js`, `Home.jsx`
11. **Google Calendar auth** — `auth.py`, `CALENDAR_SETUP.md`
12. **End-to-end testing** — full voice booking, journal logging, doctor search flows

---

## 14. Key Demo Scenarios to Test Before Meeting

After implementation, verify these 5 flows work end-to-end:

**Scenario 1 — Personalized greeting:**
Open app → AI greets Ashwin by name and mentions his back pain from recent journals

**Scenario 2 — Voice journal:**
Say "let me log today's update" → AI asks for details → speak update → AI confirms journal saved → check Journal page shows new entry

**Scenario 3 — Doctor search:**
Say "my back pain is getting worse" → AI calls search_doctors → 3 doctor cards appear in chat

**Scenario 4 — Voice appointment booking:**
Say "book with Dr. Priya" → AI asks date/time → confirm → appointment saved in DB + Google Calendar event created → check Appointments page

**Scenario 5 — Health Q&A with context:**
Say "what should I do about my anxiety" → AI references journal history and suggests therapist options

---

## 15. Important Notes for Implementation

- **Audio format**: Frontend should record audio as `audio/webm;codecs=opus` using MediaRecorder. Send as multipart form data to backend.
- **Base64 audio**: Backend returns TTS audio as base64 string. Frontend decodes and plays via Web Audio API or `<audio>` element.
- **Conversation persistence**: Always load and send full conversation history to Gemini to maintain context across page refreshes.
- **Tool result rendering**: The frontend must check `tool_used` and `tool_result` in every AI response and render the appropriate UI component (doctor cards, confirmation card, journal saved card) inline in the chat thread.
- **Mobile testing**: Use Chrome DevTools mobile emulation (iPhone 14 Pro, 393px) during development.
- **Error states**: Show friendly error messages if mic permission denied or API call fails. Never show raw error objects.
- **Loading states**: Always show TypingIndicator while waiting for AI response. Disable VoiceButton while AI is speaking.
