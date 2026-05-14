from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: EmailStr
    username: str
    password: str


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[EmailStr] = None
    username: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user response (excludes password)."""
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    username: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        populate_by_name = True
