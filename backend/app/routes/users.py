from fastapi import APIRouter, status, HTTPException, Depends
from app.models.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService
from database import get_database

router = APIRouter(prefix="/api/users", tags=["users"])


def get_user_service(db=Depends(get_database)) -> UserService:
    """Get user service with database dependency."""
    return UserService(db)


@router.get("/", response_model=list[UserResponse])
async def get_users(user_service: UserService = Depends(get_user_service)):
    """Get all users."""
    users = await user_service.get_all_users()
    return users


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, user_service: UserService = Depends(get_user_service)):
    """Create a new user."""
    # Check if user already exists
    existing_user = await user_service.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    created_user = await user_service.create_user(user)
    return created_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, user_service: UserService = Depends(get_user_service)):
    """Get a specific user by ID."""
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user: UserUpdate, user_service: UserService = Depends(get_user_service)):
    """Update a user."""
    updated_user = await user_service.update_user(user_id, user)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, user_service: UserService = Depends(get_user_service)):
    """Delete a user."""
    deleted = await user_service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
