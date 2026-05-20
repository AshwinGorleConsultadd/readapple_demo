# Redapple — Startup Guide

## Prerequisites
- Docker Desktop (running)
- Python 3.11+
- Node.js 18+

---

## Step 1 — Start MongoDB (Docker)

```bash
cd backend
docker compose up -d
```

Verify it's running:
```bash
docker ps
```
MongoDB will be available at `mongodb://localhost:27017`

---

## Step 2 — Start Backend

```bash
cd backend
```

Create and activate virtual environment (first time only):
```bash
python -m venv venv
```

Activate:
```bash
# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

Install dependencies (first time only):
```bash
pip install -r requirements.txt
```

Start the server:
```bash
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

## Step 3 — Start Frontend

```bash
cd frontend
npm install        # first time only
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Step 4 — Seed Database (first time only)

Open a new terminal with the venv active:
```bash
cd backend
source venv/bin/activate
python scripts/seed_doctors.py
python scripts/seed_patient.py
```

---

## Required API Keys (`backend/.env`)

```
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
MONGODB_URL=mongodb://admin:password@localhost:27017
DATABASE_NAME=redapple
```

---

## Quick Start (all steps combined)

```bash
# Terminal 1 — MongoDB
cd backend && docker compose up -d

# Terminal 2 — Backend
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 3 — Frontend
cd frontend && npm run dev
```
