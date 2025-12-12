from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config.db import get_db
from schemas.comments.comment_schema import (
    CommentCreate,
    CommentResponse,
    CommentListResponse
)
from services.comments.comment_service import CommentService
from dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/comments",
    tags=["comments"]
)

@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        db_comment = CommentService.create_comment(db, comment, user.id)
        
        # Add author information for response
        db_comment.author_display_name = user.user_metadata.get('display_name') or user.email
        db_comment.is_author = True
        
        return db_comment
    except Exception as e:
        logger.error(f"Create comment failed for user {user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/post/{post_id}", response_model=CommentListResponse)
def get_post_comments(
    post_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        result = CommentService.get_post_comments(db, post_id, user.id)
        return result
    except Exception as e:
        logger.error(f"Get post comments failed for post {post_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{comment_id}", response_model=CommentResponse)
def get_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        comment = CommentService.get_comment(db, comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        comment.is_author = str(comment.author_id) == str(user.id)
        
        return comment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get comment failed for comment {comment_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        result = CommentService.delete_comment(db, comment_id, user.id)
        if not result:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        return {"message": "Comment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete comment failed for comment {comment_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))