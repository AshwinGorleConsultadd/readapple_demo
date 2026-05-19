# Redapple Demo — Setup

## Backend
```bash
cd backend
pip install -r requirements.txt
# Fill in API keys in .env
python scripts/seed_doctors.py
python scripts/seed_patient.py
uvicorn main:app --reload
```

start
cd /Users/consultadd/Desktop/My\ project/Demo/redapple/backend && source venv/bin/activate && uvicorn main:app --reload --port 8000


## Frontend
```bash
cd frontend
npm install
# .env already has VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

## Google Calendar (run once before demo)
```
Open http://localhost:8000/auth/google in browser and complete OAuth
```

## API Keys needed (backend/.env)
- `GEMINI_API_KEY` — Google AI Studio
- `ELEVENLABS_API_KEY` — ElevenLabs dashboard
- `GOOGLE_CALENDAR_CLIENT_ID` + `GOOGLE_CALENDAR_CLIENT_SECRET` — Google Cloud Console (Calendar API)

## Demo Scenarios
1. **Greeting** — Open app, AI greets Ashwin referencing recent back pain
2. **Voice journal** — "Let me log today's update" → speak → journal saved
3. **Doctor search** — "My back is really hurting" → 3 doctor cards appear
4. **Appointment booking** — "Book with Dr. Priya" → confirm date/time → booked
5. **Health Q&A** — "What should I do about my anxiety" → AI references journal
