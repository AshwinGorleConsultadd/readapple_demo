from motor.motor_asyncio import AsyncDatabase
from app.models.user import UserCreate, UserResponse, UserUpdate
from datetime import datetime
from bson import ObjectId


class UserService:
    """Service for user-related operations."""
    
    def __init__(self, db: AsyncDatabase):
        self.db = db
        self.collection = db["users"]
    
    async def create_user(self, user: UserCreate) -> dict:
        """Create a new user in MongoDB."""
        user_data = {
            "email": user.email,
            "username": user.username,
            "password": user.password,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data
    
    async def get_user_by_id(self, user_id: str) -> dict:
        """Get a user by ID."""
        try:
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception:
            return None
    
    async def get_all_users(self) -> list:
        """Get all users."""
        users = await self.collection.find({}).to_list(None)
        return users
    
    async def get_user_by_email(self, email: str) -> dict:
        """Get a user by email."""
        user = await self.collection.find_one({"email": email})
        return user
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> dict:
        """Update a user."""
        try:
            update_dict = user_data.dict(exclude_unset=True)
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_dict},
                return_document=True
            )
            return result
        except Exception:
            return None
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete a user."""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception:
            return False
