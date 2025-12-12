from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.db import get_db
from schemas.posts.post_schema import (
    PostCreate,
    PostUpdate,
    PostResponse,
    PostListResponse
)
from services.posts.post_service import PostService
from dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)

@router.post("/", response_model=PostResponse)
def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        db_post = PostService.create_post(db, post, user.id)
        
        # Add author information for response
        db_post.author_display_name = user.user_metadata.get('display_name') or user.email
        db_post.is_author = True
        
        return db_post
    except Exception as e:
        logger.error(f"Create post failed for user {user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/community/{community_id}", response_model=PostListResponse)
def get_community_posts(
    community_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get posts for a specific community with pagination"""
    try:
        result = PostService.get_community_posts(db, community_id, user.id, skip, limit)
        return result
    except Exception as e:
        logger.error(f"Get community posts failed for community {community_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get a single post by ID"""
    try:
        post = PostService.get_post(db, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Add computed fields
        post.is_author = str(post.author_id) == str(user.id)
        
        return post
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get post failed for post {post_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_update: PostUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Update a post (only by author)"""
    try:
        updated_post = PostService.update_post(db, post_id, post_update, user.id)
        if not updated_post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Add computed fields
        updated_post.is_author = True
        updated_post.author_display_name = user.user_metadata.get('display_name') or user.email
        
        return updated_post
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update post failed for post {post_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Delete a post (only by author)"""
    try:
        result = PostService.delete_post(db, post_id, user.id)
        if not result:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return {"message": "Post deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete post failed for post {post_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))