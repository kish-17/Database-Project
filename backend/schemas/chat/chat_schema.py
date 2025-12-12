from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# ChatRoom schemas
class ChatRoomBase(BaseModel):
    title: str

class ChatRoomCreate(ChatRoomBase):
    community_id: int

class ChatRoomResponse(ChatRoomBase):
    chat_id: int
    community_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Message schemas
class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    chat_id: int
    type: Optional[str] = "text"

class MessageResponse(MessageBase):
    msg_id: int
    chat_id: int
    sender_id: Optional[UUID]
    type: Optional[str]
    sent_at: datetime
    
    # Additional fields for frontend display
    sender_display_name: Optional[str] = None
    is_sender: bool = False
    
    class Config:
        from_attributes = True

class ChatRoomWithMessages(ChatRoomResponse):
    """Chat room with recent messages"""
    messages: List[MessageResponse] = []
    message_count: int = 0

class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total_count: int
    chat_id: int
    has_more: bool = False
    chat_id: int