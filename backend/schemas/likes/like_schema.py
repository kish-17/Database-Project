from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class LikeCreate(BaseModel):
    post_id: int

class LikeResponse(BaseModel):
    like_id: int
    post_id: int
    user_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class LikeStatusResponse(BaseModel):
    """Response showing like status for a post"""
    post_id: int
    is_liked: bool
    like_count: int

class LikeToggleResponse(BaseModel):
    """Response after liking/unliking a post"""
    post_id: int
    is_liked: bool
    like_count: int
    message: str