# Redapple — Static Conversation Module
## Claude Code Implementation Prompt

---

## Context

The Redapple demo app is fully functional with a live AI conversation module. You are now adding a **Static Conversation Module (SCM)** on top of the existing system without breaking anything.

The purpose of this module is to enable a **controlled, rehearsed demo recording** where:
- AI responses follow a pre-written script (from a JSON file)
- But all real tool calls still execute (doctor search, appointment booking, journal logging)
- So the UI still shows real doctor cards, real appointment confirmation cards, real journal saved cards — nothing is faked

Think of it as: **static words, real actions.**

---

## How It Works — Core Logic

```
STATIC MODE ON:
  User speaks → STT converts to text → displayed in chat as user bubble
  AI response → pulled from JSON script (next item in sequence) → spoken via TTS → displayed in chat
  If that script step has a tool_call defined → execute the REAL tool (same as live mode)
  Tool result → render real UI card in chat (doctor cards, booking card, journal card)
  Move to next step in sequence

STATIC MODE OFF:
  Existing live AI module works exactly as before — no change
```

---

## 1. New Files to Create

```
frontend/src/
  data/
    static_conversation.json       ← The full scripted conversation

  hooks/
    useStaticConversation.js       ← Manages static mode state and sequence

  components/
    StaticModeToggle.jsx           ← Toggle switch shown on Home page
```

No new backend files needed. All existing tool endpoints (`/conversation-analysis`, `/appointments`, `/journal`) are called exactly as they are today.

---

## 2. The JSON Script File

Create `frontend/src/data/static_conversation.json`

The structure is an array of steps. Each step is either a `user` turn or an `ai` turn. AI turns can optionally include a `tool_call`.

### JSON Schema

```json
{
  "conversation": [
    {
      "step": 1,
      "role": "ai",
      "text": "string — exactly what the AI will say and TTS will speak",
      "tool_call": null
    },
    {
      "step": 2,
      "role": "user",
      "text": "string — what the user is expected to say (displayed in chat when user speaks)"
    },
    {
      "step": 3,
      "role": "ai",
      "text": "string — AI response text",
      "tool_call": {
        "type": "search_doctors",
        "params": {
          "problem": "tooth pain cold sensitivity"
        }
      }
    }
  ]
}
```

### Tool Call Types

```json
tool_call types and their params:

{ "type": "search_doctors", "params": { "problem": "string" } }

{ "type": "book_appointment", "params": {
    "doctor_name": "string",
    "date": "string",
    "time": "string",
    "reason": "string"
  }
}

{ "type": "log_journal", "params": {
    "raw_input": "string — exactly what user said as journal update"
  }
}

{ "type": "cancel_appointment", "params": {
    "doctor_name": "string"
  }
}
```

### Full JSON Content

Populate the JSON with the exact conversation sequence below. Do not paraphrase — use the exact text:

```json
{
  "conversation": [
    {
      "step": 1,
      "role": "ai",
      "text": "Welcome to RedApple — your complete digital health companion. RedApple connects you with a wide range of healthcare providers all in one place. Whether you need a chiropractor, a therapist, a general physician, a dentist, a nutritionist, a cardiologist, a physiotherapist, a dermatologist, a sleep specialist, or a health coach — we have got you covered. You can book appointments, track your health, talk to your providers, and manage your entire health journey, all by just using your voice. So, what can I help you with today?",
      "tool_call": null
    },
    {
      "step": 2,
      "role": "user",
      "text": "Hi."
    },
    {
      "step": 3,
      "role": "ai",
      "text": "Hey Ashwin, welcome back! Great to see you again. You last visited Dr. Priya Sharma, your chiropractor, on April 28th. Your lower back pain was at a 7 out of 10 then. How are you feeling today? Is the back doing better?",
      "tool_call": null
    },
    {
      "step": 4,
      "role": "user",
      "text": "Back is a little better, maybe a 5 now. But actually today I'm having some tooth pain and I wanted to see a dentist."
    },
    {
      "step": 5,
      "role": "ai",
      "text": "Glad the back is improving! Tooth pain can be really uncomfortable — let's get that sorted. Before I find you a dentist, let me pull up your profile. I can see your insurance coverage is BlueCross BlueShield PPO Plan. This plan covers dental consultations at 80% after your deductible. You are good to go. Let me find the best dentists available for you.",
      "tool_call": {
        "type": "search_doctors",
        "params": {
          "problem": "tooth pain cold sensitivity dental"
        }
      }
    },
    {
      "step": 6,
      "role": "user",
      "text": "Yes, book with Dr. Sneha."
    },
    {
      "step": 7,
      "role": "ai",
      "text": "Before I confirm the booking, let me just collect a few quick details so Dr. Sneha is fully prepared before your appointment. First — do you have any known allergies? Especially to any medications or anaesthesia?",
      "tool_call": null
    },
    {
      "step": 8,
      "role": "user",
      "text": "Yes, I'm allergic to penicillin."
    },
    {
      "step": 9,
      "role": "ai",
      "text": "Got it, penicillin allergy noted. Are you currently taking any medications?",
      "tool_call": null
    },
    {
      "step": 10,
      "role": "user",
      "text": "Yes I'm on Ibuprofen 400mg twice a day that Dr. Priya prescribed, and Vitamin D3."
    },
    {
      "step": 11,
      "role": "ai",
      "text": "Noted — Ibuprofen 400mg and Vitamin D3. Last question — any recent medical conditions or ongoing health issues Dr. Sneha should know about before the appointment?",
      "tool_call": null
    },
    {
      "step": 12,
      "role": "user",
      "text": "Just the lower back issue and some anxiety."
    },
    {
      "step": 13,
      "role": "ai",
      "text": "Perfect, I have everything. I am preparing a pre-appointment health summary for Dr. Sneha right now — your allergy, current medications, and health background. She will have this before you even walk in. Now, what day and time works for your appointment?",
      "tool_call": null
    },
    {
      "step": 14,
      "role": "user",
      "text": "This Friday at 3 PM."
    },
    {
      "step": 15,
      "role": "ai",
      "text": "Ashwin, I checked your calendar and you actually have your follow-up with Dr. Priya Sharma this Friday at 3 PM for your back. You cannot have both at the same time. Would you like to book Dr. Sneha at a different time on Friday, or a different day entirely?",
      "tool_call": null
    },
    {
      "step": 16,
      "role": "user",
      "text": "Book her for Friday 5 PM."
    },
    {
      "step": 17,
      "role": "ai",
      "text": "Perfect. Dr. Sneha Kulkarni, Dentist, this Friday at 5 PM — with your allergy and medication notes already sent to her. Confirming now.",
      "tool_call": {
        "type": "book_appointment",
        "params": {
          "doctor_name": "Dr. Sneha Kulkarni",
          "date": "2025-05-02",
          "time": "5:00 PM",
          "reason": "Tooth pain and cold sensitivity"
        }
      }
    },
    {
      "step": 18,
      "role": "ai",
      "text": "Done! You are all set. Dr. Priya at 3 PM for your back, Dr. Sneha at 5 PM for your teeth. Both are on your calendar and both doctors have your pre-appointment health summary. Anything else you need today?",
      "tool_call": null
    },
    {
      "step": 19,
      "role": "user",
      "text": "Actually yes, let me log today's update."
    },
    {
      "step": 20,
      "role": "ai",
      "text": "Of course — go ahead, tell me how you are feeling today.",
      "tool_call": null
    },
    {
      "step": 21,
      "role": "user",
      "text": "Back pain is around 5 today, much better than last week. Slept around 6 hours. Tooth pain is a 6, especially when I drink something cold. Feeling a bit tired but anxiety is a little less than before."
    },
    {
      "step": 22,
      "role": "ai",
      "text": "Got it, I have logged that for you.",
      "tool_call": {
        "type": "log_journal",
        "params": {
          "raw_input": "Back pain is around 5 today, much better than last week. Slept around 6 hours. Tooth pain is a 6, especially when I drink something cold. Feeling a bit tired but anxiety is a little less than before."
        }
      }
    },
    {
      "step": 23,
      "role": "ai",
      "text": "Today's entry saved — back pain 5 out of 10, improving. Tooth pain 6 out of 10, cold sensitivity. Sleep 6 hours, energy low, anxiety mild. Dr. Priya and Dr. Sneha will both be able to see this before your Friday appointments. You are doing well Ashwin — the trend is moving in the right direction.",
      "tool_call": null
    },
    {
      "step": 24,
      "role": "user",
      "text": "Actually wait, cancel my appointment on Friday."
    },
    {
      "step": 25,
      "role": "ai",
      "text": "You have two appointments this Friday — Dr. Priya Sharma at 3 PM for your back, and Dr. Sneha Kulkarni at 5 PM for your teeth. Which one would you like to cancel?",
      "tool_call": null
    },
    {
      "step": 26,
      "role": "user",
      "text": "Cancel the dentist one."
    },
    {
      "step": 27,
      "role": "ai",
      "text": "Just confirming — you want to cancel Dr. Sneha Kulkarni on Friday at 5 PM. Should I go ahead?",
      "tool_call": null
    },
    {
      "step": 28,
      "role": "user",
      "text": "Yes."
    },
    {
      "step": 29,
      "role": "ai",
      "text": "Done. Dr. Sneha's appointment has been cancelled. Your appointment with Dr. Priya at 3 PM is still confirmed. Would you like to reschedule the dentist for another day?",
      "tool_call": {
        "type": "cancel_appointment",
        "params": {
          "doctor_name": "Dr. Sneha Kulkarni"
        }
      }
    },
    {
      "step": 30,
      "role": "user",
      "text": "No that's fine for now, thanks."
    },
    {
      "step": 31,
      "role": "ai",
      "text": "Anytime Ashwin. To recap today — your follow-up with Dr. Priya is confirmed for Friday at 3 PM, your health journal is updated, and your pre-appointment notes are ready for her. RedApple is always here whenever you need it — whether it is booking, tracking your health, or just talking through how you are feeling. Take care and hope the back continues to improve!",
      "tool_call": null
    }
  ]
}
```

---

## 3. `hooks/useStaticConversation.js`

This hook manages the entire static mode flow.

```js
// State:
// - currentStep: number (index into conversation array, starts at 0)
// - isStaticMode: bool (synced with toggle)
// - isProcessing: bool (true while tool is executing)
// - waitingForUser: bool (true when next expected step is a user turn)

// On mount:
// - Load static_conversation.json
// - Set currentStep to 0

// Function: startStaticConversation()
// - Reset currentStep to 0
// - Clear chat history
// - Trigger first AI step automatically (step 1 is always AI)

// Function: advanceToNextAIStep()
// - Find next step in sequence where role === "ai"
// - Get text from that step
// - Call TTS to speak the text (same ElevenLabs service as live mode)
// - Add AI bubble to chat
// - If step has tool_call → call executeStaticToolCall(tool_call)
// - If next step after this is role === "user" → set waitingForUser = true

// Function: handleUserSpoke(transcript)
// - In static mode: IGNORE the actual transcript content
// - Instead: get the current expected user step text from JSON
// - Display that text in chat as user bubble (not what user actually said)
// - Advance currentStep
// - Call advanceToNextAIStep()

// Function: executeStaticToolCall(tool_call)
// - Switch on tool_call.type:
//   "search_doctors"   → call POST /tools/search-doctors with params
//   "book_appointment" → call POST /tools/book-appointment with params
//   "log_journal"      → call POST /tools/log-journal with params
//   "cancel_appointment" → call DELETE /appointments/by-doctor-name with params
// - Await real API response
// - Return tool_result to be rendered as UI card in chat (same cards as live mode)
// - After tool result rendered, check if next step is another AI step (continuation)
//   If yes → immediately call advanceToNextAIStep() without waiting for user

// Note on consecutive AI steps:
// Steps 17 and 18 are both AI turns (book confirmation then recap).
// After executing the tool in step 17, automatically play step 18 as well.
// Only set waitingForUser = true when the NEXT step in sequence is role === "user"
```

---

## 4. `components/StaticModeToggle.jsx`

Add this toggle to the top of the Home page (inside PageHeader or just below it).

```jsx
// Visual design:
// Small pill toggle on the right side of the header
// OFF state: gray, label "Live AI"
// ON state: red (#E24B4A), label "Demo Mode"

// When toggled ON:
// - Call startStaticConversation() from useStaticConversation
// - Clear existing chat
// - Disable the VoiceButton label change — show "Tap to Continue" instead of "Tap to Start"

// When toggled OFF:
// - Return to normal live AI mode
// - Clear static chat
// - Show normal empty state or greeting

// Position: top right of the home screen header
// Size: compact, does not disrupt the layout

// Example markup structure:
// <div className="flex items-center gap-2">
//   <span className="text-xs text-gray-400">{isStatic ? 'Demo Mode' : 'Live AI'}</span>
//   <button onClick={toggle} className={`w-11 h-6 rounded-full transition-colors ${isStatic ? 'bg-[#E24B4A]' : 'bg-gray-300'}`}>
//     <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isStatic ? 'translate-x-6' : 'translate-x-1'}`} />
//   </button>
// </div>
```

---

## 5. Changes to `pages/Home.jsx`

Modify the existing Home page to support both modes. The changes are minimal — only the input handling and greeting logic changes based on mode.

```jsx
// Import useStaticConversation alongside existing useConversation
// Import StaticModeToggle

// Add toggle to PageHeader area

// Modify VoiceButton onPress logic:
// if (isStaticMode) {
//   startListening() — same as before, but on stopListening:
//     instead of sending real audio to backend,
//     call handleUserSpoke(transcript) from useStaticConversation
// } else {
//   existing live mode logic — no change
// }

// Modify initial greeting logic:
// if (isStaticMode) {
//   startStaticConversation() is called when toggle is turned ON
//   this fires step 1 automatically — no fetch to /conversation/message
// } else {
//   existing live greeting fetch — no change
// }

// Chat thread rendering:
// No changes needed — ChatBubble, DoctorSuggestionCard, AppointmentCard
// all render the same regardless of mode
// The tool results from static mode use the same card components as live mode

// VoiceButton label in static mode:
// idle:      "Tap to Respond"
// listening: "Listening..."   (same animation)
// After user speaks: immediately advance script, no waiting for backend
```

---

## 6. Backend: Cancel Appointment by Doctor Name

The static script needs to cancel Dr. Sneha's appointment by name (not by ID, since the ID isn't known at script time). Add this endpoint to the existing `routers/appointments.py`:

```python
DELETE /appointments/by-doctor-name
Body: { "doctor_name": "string" }

# Find the most recent upcoming appointment matching that doctor name for Ashwin
# Update status to "cancelled"
# Return { "cancelled": true, "appointment_id": str }
```

---

## 7. Implementation Order

1. Create `frontend/src/data/static_conversation.json` with full conversation content
2. Add `DELETE /appointments/by-doctor-name` endpoint to existing `routers/appointments.py`
3. Build `hooks/useStaticConversation.js`
4. Build `components/StaticModeToggle.jsx`
5. Modify `pages/Home.jsx` — add toggle, wire static mode input handling
6. Test each step of the static sequence end to end

---

## 8. Key Behaviours to Test

| Test | Expected Result |
|---|---|
| Toggle ON | Chat clears, AI immediately speaks step 1 welcome message |
| User taps mic and speaks anything | Step 2 user text appears (not what user actually said), AI plays step 3 |
| Step 5 — search doctors | Real doctor cards appear in chat, TTS speaks step 5 text |
| Step 17 — book appointment | Real booking executes, confirmation card appears, step 18 plays automatically |
| Step 22 — log journal | Real journal entry saved to DB, journal card appears in chat |
| Step 29 — cancel appointment | Real cancellation executes, appointment removed from DB |
| Steps 17 → 18 (consecutive AI) | Step 18 plays automatically without waiting for user tap |
| Toggle OFF mid conversation | Reverts to live AI mode, clears static chat |
| Toggle OFF then ON again | Conversation resets to step 1 cleanly |

---

## 9. Important Notes

- **Do not change any existing live mode logic.** The toggle is purely additive.
- **TTS in static mode** uses the exact same ElevenLabs call as live mode — same voice, same quality.
- **STT in static mode** still runs (mic still records) but the transcript is discarded. The expected user text from JSON is displayed instead. This ensures the voice interaction still looks and feels real on screen.
- **Consecutive AI steps** (like steps 17 and 18) must auto-advance without requiring user input. After a tool_call completes and the tool result card renders, check if the next step is also `role: "ai"` — if yes, play it immediately with a 800ms delay for natural pacing.
- **Step counter persistence** — do not persist step counter across page refreshes. Each toggle ON starts fresh from step 1.
- **Error handling** — if a real tool call fails (e.g. booking fails), still advance the script and show the AI's confirmation text. This is a demo — the visual flow must not break.
