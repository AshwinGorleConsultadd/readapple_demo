import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

_client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_db():
    global _client, db
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/redapple")
    _client = AsyncIOMotorClient(uri)
    db = _client.get_default_database() if "/" in uri.split("//")[-1] else _client["redapple"]
    print("✓ Redapple DB connected")


async def close_db():
    global _client
    if _client:
        _client.close()


def get_db() -> AsyncIOMotorDatabase:
    return db
