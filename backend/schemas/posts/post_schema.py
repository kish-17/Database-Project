from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class PostBase(BaseModel):
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None

class PostCreate(PostBase):
    community_id: int

class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None

class PostResponse(PostBase):
    post_id: int
    community_id: int
    author_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Additional fields for frontend display
    author_display_name: Optional[str] = None
    is_author: bool = False
    
    class Config:
        from_attributes = True

class PostListResponse(BaseModel):
    """Response for listing posts in a community"""
    posts: list[PostResponse]
    total_count: int
    page: int
    page_size: int
    has_more: bool