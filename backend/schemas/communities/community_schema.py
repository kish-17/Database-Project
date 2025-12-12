from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class CommunityBase(BaseModel):
    name: str
    description: Optional[str] = None

class CommunityCreate(CommunityBase):
    pass

class CommunityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CommunityResponse(CommunityBase):
    community_id: int
    created_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True

class CommunityDetailResponse(CommunityResponse):
    """Enhanced community response with membership info for detail pages"""
    member_count: int
    is_member: bool = False
    is_owner: bool = False
    
    class Config:
        from_attributes = True

