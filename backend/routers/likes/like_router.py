from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.db import get_db
from schemas.likes.like_schema import (
    LikeStatusResponse,
    LikeToggleResponse
)
from services.likes.like_service import LikeService
from dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/likes",
    tags=["likes"]
)

@router.post("/toggle/{post_id}", response_model=LikeToggleResponse)
def toggle_post_like(
    post_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        result = LikeService.toggle_like(db, post_id, user.id)
        return result
    except Exception as e:
        logger.error(f"Toggle like failed for user {user.id}, post {post_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status/{post_id}", response_model=LikeStatusResponse)
def get_post_like_status(
    post_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get like status for a specific post"""
    try:
        result = LikeService.get_like_status(db, post_id, user.id)
        return result
    except Exception as e:
        logger.error(f"Get like status failed for post {post_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))