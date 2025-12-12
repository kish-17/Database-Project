from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None

class UserProfileResponse(BaseModel):
    user_id: UUID
    email: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
