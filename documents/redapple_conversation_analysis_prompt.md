# Redapple — Doctor-Patient Conversation Analysis Feature
## Claude Code Integration Prompt

---

## Context

You are adding a **new feature** to an existing Redapple health demo application. The app already has:
- A React frontend (mobile-first, Tailwind CSS, brand color `#E24B4A`)
- A FastAPI backend with MongoDB
- Existing pages: Home (voice chat), Appointments, Journal, Profile
- Existing collections: `patients`, `doctors`, `appointments`, `journal`, `conversations`
- ElevenLabs for TTS, Google Gemini `gemini-2.5-pro` for LLM
- browser native feature for STT

**Do not break or modify any existing features.** Only add new code on top of what exists.

---

## Feature Overview

When a patient has a real-world consultation with a doctor (video call or in-person), their conversation can be recorded inside the app. The AI then analyses the full conversation transcript and generates two separate, professionally formatted sets of notes:

- **Patient Notes** — written for the patient: what they were told, medications, exercises, tasks, follow-ups in simple language
- **Doctor Notes** — written for the doctor: clinical observations, symptoms reported, advice given, prescriptions, pending tasks, follow-up reminders

Both notes are saved to MongoDB and displayed on their respective profile pages.

---

## 1. New Database Collections

### Collection: `patient_notes`
```json
{
  "_id": "ObjectId",
  "appointment_id": "ObjectId — ref appointments",
  "patient_id": "ObjectId — ref patients",
  "doctor_id": "ObjectId — ref doctors",
  "doctor_name": "string",
  "appointment_date": "string — e.g. 2025-04-28",
  "appointment_reason": "string",
  "conversation_transcript": "string — full raw transcript",
  "notes": {
    "summary": "string — 2-3 sentence overview of the consultation",
    "symptoms_discussed": ["string"],
    "diagnosis_or_concern": "string",
    "medications": [
      {
        "name": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "notes": "string"
      }
    ],
    "diet_advice": ["string"],
    "exercises": [
      {
        "name": "string",
        "instructions": "string",
        "frequency": "string"
      }
    ],
    "tasks_assigned": ["string"],
    "follow_up": "string — e.g. Come back in 2 weeks if pain persists",
    "things_to_avoid": ["string"],
    "doctor_will_provide": ["string — e.g. Written prescription, MRI referral"],
    "additional_notes": "string"
  },
  "created_at": "ISODate"
}
```

### Collection: `doctor_notes`
```json
{
  "_id": "ObjectId",
  "appointment_id": "ObjectId — ref appointments",
  "patient_id": "ObjectId — ref patients",
  "doctor_id": "ObjectId — ref doctors",
  "patient_name": "string",
  "appointment_date": "string",
  "appointment_reason": "string",
  "conversation_transcript": "string — full raw transcript",
  "notes": {
    "summary": "string — clinical summary of the session",
    "chief_complaint": "string — primary reason patient came",
    "symptoms_reported": [
      {
        "symptom": "string",
        "severity": "string — e.g. 7/10",
        "duration": "string — e.g. 1 week",
        "notes": "string"
      }
    ],
    "patient_history_mentioned": ["string — anything patient mentioned about past conditions"],
    "clinical_observations": "string — what doctor noted about the patient",
    "advice_given": ["string"],
    "prescriptions": [
      {
        "medicine": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "reason": "string"
      }
    ],
    "exercises_prescribed": ["string"],
    "diet_instructions": ["string"],
    "tasks_for_patient": ["string"],
    "pending_actions": ["string — e.g. Send MRI referral, Share diet plan"],
    "follow_up_plan": "string",
    "red_flags_to_watch": ["string — symptoms to watch out for"],
    "additional_clinical_notes": "string"
  },
  "created_at": "ISODate"
}
```

---

## 2. New Backend Files

Add these files to the existing backend structure:

```
backend/
  routers/
    conversation_analysis.py     ← NEW: all endpoints for this feature
  services/
    conversation_analysis_service.py  ← NEW: AI analysis logic
  tools/
    save_patient_notes.py        ← NEW: tool for LLM to save patient notes
    save_doctor_notes.py         ← NEW: tool for LLM to save doctor notes
```

Register the new router in `main.py`:
```python
from routers.conversation_analysis import router as conversation_analysis_router
app.include_router(conversation_analysis_router, prefix="/conversation-analysis")
```

---

## 3. Backend Implementation

### `services/conversation_analysis_service.py`

This is the core AI brain for this feature.

```python
async def analyse_conversation(
    transcript: str,
    appointment: dict,      # full appointment object from DB
    patient: dict,          # Ashwin's profile
    doctor: dict            # doctor object from DB
) -> dict:
    """
    Sends transcript + context to Gemini.
    Gemini analyses and calls both save_patient_notes and save_doctor_notes tools.
    Returns: { "patient_notes_id": str, "doctor_notes_id": str }
    """
```

**Gemini system prompt for analysis:**

```
You are a medical conversation analyst for Redapple Health Platform.

You have been given a full transcript of a consultation between a patient and a doctor.

Your job is to carefully read the entire conversation and extract all medically relevant information, then generate two separate sets of structured notes:

1. PATIENT NOTES — Written in simple, friendly language for the patient (not clinical jargon). Should feel like a helpful summary the patient can refer to at home.

2. DOCTOR NOTES — Written in professional clinical language for the doctor. Should capture everything the doctor needs to remember: symptoms reported, advice given, prescriptions, pending actions, follow-up plan.

Appointment context:
- Patient: {patient_name}, Age: {patient_age}
- Doctor: {doctor_name}, Specialty: {doctor_specialty}
- Date: {appointment_date}
- Reason: {appointment_reason}

Patient health background:
{patient_health_conditions}

Instructions:
- Read the transcript carefully and extract EVERY piece of relevant information
- Do not invent or assume anything not present in the transcript
- If a field has no relevant information from the transcript, use null or empty array
- For medications: capture exact name, dosage, timing if mentioned
- For exercises: capture specific instructions if given
- Capture anything the doctor said they will provide later (prescription, referral, etc.) under pending_actions
- After generating both notes, call the save_patient_notes tool AND the save_doctor_notes tool to save them

Call BOTH tools. Do not stop after calling just one.
```

---

### `tools/save_patient_notes.py`

```python
SAVE_PATIENT_NOTES_TOOL = {
    "name": "save_patient_notes",
    "description": "Save the generated patient notes to the database. Call this after analysing the conversation transcript.",
    "parameters": {
        "summary": "string",
        "symptoms_discussed": "array of strings",
        "diagnosis_or_concern": "string",
        "medications": "array of objects with name, dosage, frequency, duration, notes",
        "diet_advice": "array of strings",
        "exercises": "array of objects with name, instructions, frequency",
        "tasks_assigned": "array of strings",
        "follow_up": "string",
        "things_to_avoid": "array of strings",
        "doctor_will_provide": "array of strings",
        "additional_notes": "string"
    }
}

async def execute_save_patient_notes(params: dict, appointment: dict, transcript: str) -> dict:
    # Build full patient_notes document
    # Save to MongoDB patient_notes collection
    # Return { "saved": true, "note_id": str }
```

---

### `tools/save_doctor_notes.py`

```python
SAVE_DOCTOR_NOTES_TOOL = {
    "name": "save_doctor_notes",
    "description": "Save the generated doctor notes to the database. Call this after analysing the conversation transcript.",
    "parameters": {
        "summary": "string",
        "chief_complaint": "string",
        "symptoms_reported": "array of objects with symptom, severity, duration, notes",
        "patient_history_mentioned": "array of strings",
        "clinical_observations": "string",
        "advice_given": "array of strings",
        "prescriptions": "array of objects with medicine, dosage, frequency, duration, reason",
        "exercises_prescribed": "array of strings",
        "diet_instructions": "array of strings",
        "tasks_for_patient": "array of strings",
        "pending_actions": "array of strings",
        "follow_up_plan": "string",
        "red_flags_to_watch": "array of strings",
        "additional_clinical_notes": "string"
    }
}

async def execute_save_doctor_notes(params: dict, appointment: dict, transcript: str) -> dict:
    # Build full doctor_notes document including doctor_id from appointment
    # Save to MongoDB doctor_notes collection
    # Return { "saved": true, "note_id": str }
```

---

### `routers/conversation_analysis.py`

```
POST /conversation-analysis/transcribe-and-analyse
  Body: multipart/form-data
    - audio_file: audio file (webm/opus)
    - appointment_id: string

  Flow:
  1. Load appointment from DB by appointment_id
  2. Load patient profile from DB
  3. Load doctor profile from DB using appointment.doctor_id
  4. Send audio to ElevenLabs STT → get transcript string
  5. Call conversation_analysis_service.analyse_conversation()
     (this triggers Gemini + both save tools)
  6. Return:
     {
       "transcript": str,
       "patient_notes_id": str,
       "doctor_notes_id": str,
       "status": "success"
     }


POST /conversation-analysis/analyse-transcript
  Body: { "transcript": str, "appointment_id": str }
  
  Same as above but skips STT step.
  Use this as fallback if audio upload fails during demo.


GET /conversation-analysis/patient-notes/{patient_id}
  Returns all patient_notes for given patient_id, sorted by date desc


GET /conversation-analysis/patient-notes/detail/{note_id}
  Returns single patient note by ID


GET /conversation-analysis/doctor-notes/{doctor_id}
  Returns all doctor_notes for given doctor_id, sorted by date desc


GET /conversation-analysis/doctor-notes/detail/{note_id}
  Returns single doctor note by ID
```

---

## 4. New Frontend Files

Add these to the existing frontend structure:

```
frontend/src/
  pages/
    ConversationRecording.jsx    ← NEW: recording page (accessed from appointment card)
    PatientNotes.jsx             ← NEW: all notes for Ashwin
    DoctorNotes.jsx              ← NEW: all notes for a specific doctor

  components/
    conversation/
      RecordingControls.jsx      ← NEW: mic button + recording state for this feature
      TranscriptDisplay.jsx      ← NEW: shows live/final transcript text
      AnalysisLoader.jsx         ← NEW: animated loading while AI analyses

    notes/
      PatientNoteCard.jsx        ← NEW: single patient note summary card
      PatientNoteDetail.jsx      ← NEW: full expanded patient note view
      DoctorNoteCard.jsx         ← NEW: single doctor note summary card
      DoctorNoteDetail.jsx       ← NEW: full expanded doctor note view
      MedicationItem.jsx         ← NEW: single medication display component
      ExerciseItem.jsx           ← NEW: single exercise display component

  hooks/
    useConversationRecording.js  ← NEW: recording state management for this feature
    useNotes.js                  ← NEW: fetch patient and doctor notes

  api/
    conversationAnalysis.js      ← NEW: API calls for this feature
```

Add new routes in `App.jsx`:
```
/conversation/:appointmentId     → ConversationRecording page
/patient-notes                   → PatientNotes page
/doctor-notes/:doctorId          → DoctorNotes page
```

---

## 5. Frontend Implementation

### Changes to existing `AppointmentCard.jsx`

Add a **"Start Conversation"** button at the bottom of each appointment card:

```jsx
// Add to existing AppointmentCard.jsx
// Button at the bottom of each card:

<button
  onClick={() => navigate(`/conversation/${appointment._id}`)}
  className="w-full mt-3 py-2 px-4 bg-red-50 border border-red-200 
             text-[#E24B4A] text-sm font-medium rounded-xl 
             flex items-center justify-center gap-2 active:bg-red-100"
>
  🎙️ Start Conversation Recording
</button>
```

---

### Changes to existing `Profile.jsx`

Add a **"My Notes"** button in Ashwin's profile page:

```jsx
// Add after existing profile cards in Profile.jsx:

<button
  onClick={() => navigate('/patient-notes')}
  className="w-full py-3 px-4 bg-white border border-gray-200 
             rounded-xl flex items-center justify-between 
             text-sm font-medium text-gray-700 mt-3"
>
  <span className="flex items-center gap-2">
    📋 My Consultation Notes
  </span>
  <span className="text-gray-400">→</span>
</button>
```

---

### `pages/ConversationRecording.jsx`

This is the recording interface. Accessed via `/conversation/:appointmentId`.

**Layout:**
```
┌────────────────────────────┐
│ ← Back    Consultation     │  ← Back button + page title
├────────────────────────────┤
│ 📅 Dr. Priya Sharma        │  ← Appointment info card (loaded from appointmentId)
│    Chiropractor            │
│    Friday, Apr 28 · 3 PM   │
├────────────────────────────┤
│                            │
│  ┌──────────────────────┐  │
│  │ Conversation will be │  │  ← Instructions card (shown before recording)
│  │ recorded and         │  │
│  │ analysed by AI to    │  │
│  │ generate notes for   │  │
│  │ you and Dr. Priya    │  │
│  └──────────────────────┘  │
│                            │
│  [RecordingControls]       │  ← Big mic button, state-aware
│                            │
│  [TranscriptDisplay]       │  ← Shows transcript as it comes in (after recording stops)
│                            │
│  [Analyse Button]          │  ← Appears after transcript is ready. "Generate Notes →"
│                            │
│  [AnalysisLoader]          │  ← Shown during Gemini analysis
│                            │
└────────────────────────────┘
```

**States and flow:**

```
State 1 — IDLE
  Show appointment info + instructions + big mic button labeled "Tap to Start Recording"

State 2 — RECORDING
  Mic button turns red + pulsing animation
  Label changes to "Recording... Tap to Stop"
  Show live timer (00:00, 00:01, 00:02...)
  Show waveform animation
  NOTE: This is a continuous recording — NOT like the voice chat feature.
  Keep recording until user manually taps stop.

State 3 — PROCESSING_AUDIO
  Show spinner: "Converting speech to text..."
  Call POST /conversation-analysis/transcribe-and-analyse with audio + appointmentId

State 4 — TRANSCRIPT_READY
  Show full transcript in a scrollable text box
  Show "Generate Notes →" button in brand red

State 5 — ANALYSING
  Show AnalysisLoader component:
  Animated icon + rotating messages:
  - "Reading the conversation..."
  - "Extracting medical information..."
  - "Preparing your notes..."
  - "Preparing doctor's notes..."

State 6 — COMPLETE
  Show success card:
  ┌─────────────────────────────┐
  │ ✅ Notes Generated!         │
  │                             │
  │ [View My Notes →]           │  ← navigates to /patient-notes
  │ [View Dr. Priya's Notes →]  │  ← navigates to /doctor-notes/:doctorId
  └─────────────────────────────┘
```

**Important implementation note:**
This recording is a single long continuous recording (not chunked like voice chat). Use MediaRecorder to record the full session. When stopped, send the entire audio blob to the backend in one request.

---

### `hooks/useConversationRecording.js`

```js
// State:
// - recordingState: 'idle' | 'recording' | 'processing' | 'transcript_ready' | 'analysing' | 'complete'
// - transcript: string
// - elapsedSeconds: number (for live timer display)
// - patientNotesId: string | null
// - doctorNotesId: string | null
// - error: string | null

// Functions:
// - startRecording(): starts MediaRecorder, begins timer
// - stopRecording(): stops MediaRecorder, collects full audio blob
// - submitForAnalysis(audioBlob, appointmentId): calls backend, handles all states
// - reset(): resets to idle state
```

---

### `components/conversation/RecordingControls.jsx`

```jsx
// A large centered mic button with 3 visual states:
// IDLE:      white circle, red mic icon, red border, "Tap to Start" label
// RECORDING: solid red circle, white mic icon, pulsing ring animation, timer below
// PROCESSING: gray circle, spinning indicator, "Processing..." label

// Also show this notice above the button when IDLE:
// "Place your phone between you and your doctor during the consultation"
```

---

### `components/conversation/AnalysisLoader.jsx`

```jsx
// Full-width card with:
// - Animated Redapple logo (subtle pulse)
// - Rotating message every 2 seconds:
//   "Reading the full conversation..."
//   "Identifying symptoms and conditions..."  
//   "Extracting prescriptions and advice..."
//   "Preparing your personal notes..."
//   "Preparing clinical notes for the doctor..."
//   "Almost done..."
// - Progress bar (indeterminate / animated)
```

---

### `pages/PatientNotes.jsx`

All consultation notes for Ashwin. Route: `/patient-notes`

**Layout:**
```
┌────────────────────────────┐
│ ← Back    My Notes         │  ← Back button navigates to Profile page
├────────────────────────────┤
│  [PatientNoteCard]          │
│  Dr. Priya Sharma           │
│  Apr 28, 2025 · Chiropractor│
│  Back pain, lower spine...  │  ← summary preview
│  💊 2 meds  🏃 1 exercise   │  ← quick stats badges
├────────────────────────────┤
│  [PatientNoteCard]          │
│  ...                        │
└────────────────────────────┘
```

Tapping a card navigates to a full detail view (or expands inline).

**Full note detail view** (rendered inside PatientNoteDetail.jsx):

```
┌────────────────────────────┐
│ ← Back    Consultation Note│
├────────────────────────────┤
│ Dr. Priya Sharma           │
│ Chiropractor · Apr 28      │
├────────────────────────────┤
│ 📝 Summary                 │
│ [summary text]             │
├────────────────────────────┤
│ 🔴 Symptoms Discussed      │
│ • Lower back pain (7/10)   │
│ • Stiffness in the morning │
├────────────────────────────┤
│ 💊 Medications             │
│ [MedicationItem]           │
│ Ibuprofen 400mg            │
│ Twice daily after meals    │
│ Duration: 5 days           │
├────────────────────────────┤
│ 🏃 Exercises               │
│ [ExerciseItem]             │
│ Cat-Cow Stretch            │
│ 10 reps, twice daily       │
├────────────────────────────┤
│ 🥗 Diet Advice             │
│ • Avoid cold foods         │
│ • Increase turmeric intake │
├────────────────────────────┤
│ ✅ Tasks For You           │
│ • Apply heat pack 2x daily │
│ • Rest for 2 days          │
├────────────────────────────┤
│ ⚠️ Things To Avoid         │
│ • Lifting heavy objects    │
│ • Sitting for over 1 hour  │
├────────────────────────────┤
│ 📬 Doctor Will Provide     │
│ • Written prescription     │
├────────────────────────────┤
│ 🔄 Follow Up               │
│ Return in 2 weeks if pain  │
│ doesn't reduce below 4/10  │
└────────────────────────────┘
```

Each section only renders if it has data. Empty sections are hidden.

---

### `pages/DoctorNotes.jsx`

All clinical notes for a specific doctor. Route: `/doctor-notes/:doctorId`

**Layout:**
```
┌────────────────────────────┐
│ ← Back    Dr. Priya's Notes│  ← Doctor name in header
├────────────────────────────┤
│  [DoctorNoteCard]           │
│  Patient: Ashwin            │
│  Apr 28, 2025               │
│  Chief: Lower back pain     │
│  💊 2 Rx  ⚠️ 1 Pending      │  ← quick stats
├────────────────────────────┤
```

**Full doctor note detail** (DoctorNoteDetail.jsx):

```
┌────────────────────────────┐
│ ← Back    Clinical Note    │
├────────────────────────────┤
│ Patient: Ashwin, 28M       │
│ Date: Apr 28, 2025         │
│ Reason: Lower back pain    │
├────────────────────────────┤
│ 🏥 Clinical Summary        │
│ [summary]                  │
├────────────────────────────┤
│ 🔴 Chief Complaint         │
│ [chief_complaint]          │
├────────────────────────────┤
│ 📋 Symptoms Reported       │
│ Lower back pain: 7/10      │
│ Duration: 1 week           │
├────────────────────────────┤
│ 📜 Patient History Mentioned│
│ • Previous physiotherapy   │
├────────────────────────────┤
│ 👁️ Clinical Observations   │
│ [observations text]        │
├────────────────────────────┤
│ 💊 Prescriptions           │
│ Ibuprofen 400mg            │
│ Twice daily · 5 days       │
│ Reason: Anti-inflammatory  │
├────────────────────────────┤
│ 💬 Advice Given            │
│ • Avoid lifting > 5kg      │
│ • Rest 2 days minimum      │
├────────────────────────────┤
│ ⏳ Pending Actions         │
│ • Send written prescription│
│ • Share physiotherapy plan │
├────────────────────────────┤
│ 🚨 Red Flags To Watch      │
│ • Numbness in legs         │
│ • Pain radiating to feet   │
├────────────────────────────┤
│ 🔄 Follow Up Plan          │
│ Review in 2 weeks          │
└────────────────────────────┘
```

---

## 6. Demo Conversation Script to Test This Feature

Use this exact script to test during development. Record two people having this conversation (or simulate it):

---

**[Doctor]:** Good afternoon Ashwin, I'm Dr. Priya. So what brings you in today?

**[Ashwin]:** Hi doctor, I've been having really sharp lower back pain for about a week now. It's especially bad when I sit for long periods. I'd say it's about a 7 out of 10.

**[Doctor]:** I see. Any history of back problems before this?

**[Ashwin]:** I did a few physiotherapy sessions last year for mild strain but it got better on its own.

**[Doctor]:** Okay. And how has your sleep been? Any numbness or tingling in your legs?

**[Ashwin]:** Sleep is not great, maybe 5 hours. No tingling though.

**[Doctor]:** Alright. On examination, you have muscle tightness in the lumbar region. This appears to be a muscular strain aggravated by poor posture. I'm going to prescribe Ibuprofen 400 milligrams, twice daily after meals, for 5 days. Also Muscle Relaxant — Thiocolchicoside 4 milligrams, once at night for 3 days.

**[Ashwin]:** Okay, should I be resting completely?

**[Doctor]:** Not completely. Light movement is actually better. I want you to do Cat-Cow stretches — 10 repetitions twice a day. Also apply a heat pack to your lower back for 15 minutes, twice daily. Avoid lifting anything over 5 kilograms. Avoid sitting for more than 45 minutes continuously — take short walks.

**[Ashwin]:** Any food I should watch out for?

**[Doctor]:** Avoid cold foods and cold water. Try to include turmeric milk at night — it has natural anti-inflammatory properties. Keep yourself well hydrated.

**[Ashwin]:** You mentioned something about a physiotherapy referral?

**[Doctor]:** Yes, I'll send you a physiotherapy referral letter by email by tomorrow. Also, I'll share a detailed exercise PDF with you. If the pain doesn't come below a 4 out of 10 within 2 weeks, come back and we'll consider getting an MRI done.

**[Ashwin]:** Got it, thank you doctor.

**[Doctor]:** Take care Ashwin. And watch out for any numbness or tingling in your legs — if that happens, come back immediately.

---

This script covers: symptoms, history, clinical observations, two prescriptions with dosages, exercises with instructions, diet advice, things to avoid, pending actions (referral letter + exercise PDF), follow-up plan, and red flags. It will generate rich notes for both patient and doctor.

---

## 7. Implementation Order

Build in this exact sequence:

1. Add `patient_notes` and `doctor_notes` collections — update `database/models.py` with new Pydantic models
2. Build `tools/save_patient_notes.py` and `tools/save_doctor_notes.py`
3. Build `services/conversation_analysis_service.py` with Gemini analysis logic
4. Build `routers/conversation_analysis.py` with all endpoints
5. Register new router in `main.py`
6. Build `api/conversationAnalysis.js` in frontend
7. Build `hooks/useConversationRecording.js`
8. Build all new components: `RecordingControls`, `TranscriptDisplay`, `AnalysisLoader`, `MedicationItem`, `ExerciseItem`, `PatientNoteCard`, `PatientNoteDetail`, `DoctorNoteCard`, `DoctorNoteDetail`
9. Build `pages/ConversationRecording.jsx`
10. Build `pages/PatientNotes.jsx`
11. Build `pages/DoctorNotes.jsx`
12. Modify existing `AppointmentCard.jsx` — add "Start Conversation Recording" button
13. Modify existing `Profile.jsx` — add "My Notes" navigation button
14. Add new routes in `App.jsx`
15. End-to-end test using the demo script above

---

## 8. Important Technical Notes

- **Long recording**: Unlike the voice chat (which records short bursts), this records a full multi-minute conversation. Set MediaRecorder timeslice to collect chunks and assemble into one blob on stop.
- **Audio size**: A 5-minute recording at opus quality is approximately 1–3MB. This is fine for a demo. No chunking required.
- **ElevenLabs STT for long audio**: Pass the full audio file. ElevenLabs STT handles longer recordings — check their docs for max file size limits and adjust if needed.
- **Gemini tool calling**: The analysis prompt must instruct Gemini to call BOTH `save_patient_notes` AND `save_doctor_notes` tools in the same response. Handle multi-tool calling in `conversation_analysis_service.py`.
- **appointmentId flow**: The `ConversationRecording` page receives `appointmentId` from the URL param. Load the full appointment from backend on page mount to show doctor info and pass to analysis endpoint.
- **Doctor notes visibility**: The doctor notes page at `/doctor-notes/:doctorId` loads notes filtered by `doctor_id`. In the demo, the "View Doctor's Notes" button on the completion screen should pass the correct doctor ID from the appointment.
- **Back navigation**: PatientNotes page back button → Profile. DoctorNotes page back button → browser back (or Appointments page).
- **Empty state**: If a patient or doctor has no notes yet, show a friendly empty state: "No consultation notes yet. Start a conversation recording after your appointment."
