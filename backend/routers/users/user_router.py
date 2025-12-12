from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config.db import get_db
from schemas.users.user_schema import UserProfileUpdate, UserProfileResponse
from services.users.user_service import UserService
from dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/profile", response_model=UserProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        return UserService.get_user_profile(db, user.id)
    except Exception as e:
        logger.error(f"Get profile failed for user {user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/profile", response_model=UserProfileResponse)
def update_my_profile(
    profile_update: UserProfileUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        return UserService.update_user_profile(db, user.id, profile_update)
    except Exception as e:
        logger.error(f"Update profile failed for user {user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

