from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional, List

class MembershipCreate(BaseModel):
    community_id: int

class MembershipResponse(BaseModel):
    membership_id: int
    user_id: UUID
    community_id: int
    role: str
    joined_at: datetime
    
    class Config:
        from_attributes = True

class MembershipStatus(BaseModel):
    """Simple response to indicate membership status"""
    is_member: bool
    community_id: int
    message: str

class JoinCommunityResponse(BaseModel):
    """Response after successfully joining a community"""
    message: str
    membership: MembershipResponse

class LeaveCommunityResponse(BaseModel):
    """Response after successfully leaving a community"""
    message: str
    community_id: int

class MemberResponse(BaseModel):
    """Response for community member with role info"""
    membership_id: int
    user_id: UUID
    community_id: int
    role: str
    joined_at: datetime
    user_display_name: Optional[str] = None
    is_owner: bool = False
    
    class Config:
        from_attributes = True

class MemberListResponse(BaseModel):
    """Response for community member list"""
    members: List[MemberResponse]
    total_count: int
    community_id: int

class UpdateMemberRoleRequest(BaseModel):
    role: str

class UpdateMemberRoleResponse(BaseModel):
    """Response after updating member role"""
    message: str
    membership: MemberResponse