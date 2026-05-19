import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.connection import connect_db, close_db
from routers import conversation, appointments, journal, profile, auth
from routers import dockters
from routers import conversation_analysis
from routers import tools

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Redapple API",
    description="Voice-activated health assistant backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversation.router)
app.include_router(appointments.router)
app.include_router(journal.router)
app.include_router(profile.router)
app.include_router(auth.router)
app.include_router(dockters.router)
app.include_router(conversation_analysis.router)
app.include_router(tools.router)


@app.get("/")
async def root():
    return {"message": "Redapple API is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
