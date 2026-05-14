from motor.motor_asyncio import AsyncClient, AsyncDatabase
from config import settings

# Global database instance
client: AsyncClient = None
db: AsyncDatabase = None


async def connect_to_mongo():
    """Connect to MongoDB."""
    global client, db
    client = AsyncClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    print("✓ Connected to MongoDB")


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("✗ Disconnected from MongoDB")


def get_database() -> AsyncDatabase:
    """Get the database instance."""
    return db
