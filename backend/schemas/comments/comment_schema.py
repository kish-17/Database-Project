from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: int

class CommentUpdate(BaseModel):
    content: str

class CommentResponse(CommentBase):
    comment_id: int
    post_id: int
    author_id: UUID
    created_at: datetime
    
    # Additional fields for frontend display
    author_display_name: Optional[str] = None
    is_author: bool = False
    
    class Config:
        from_attributes = True

class CommentListResponse(BaseModel):
    """Response for listing comments on a post"""
    comments: list[CommentResponse]
    total_count: int