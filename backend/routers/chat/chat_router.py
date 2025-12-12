from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.db import get_db
from schemas.chat.chat_schema import (
    ChatRoomCreate,
    ChatRoomResponse,
    MessageCreate,
    MessageResponse,
    MessageListResponse
)
from services.chat.chat_service import ChatService
from dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

@router.post("/rooms", response_model=ChatRoomResponse)
def create_chat_room(
    chat_room: ChatRoomCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Create a new chat room in a community"""
    try:
        return ChatService.create_chat_room(db, chat_room, user.id)
    except Exception as e:
        logger.error(f"Create chat room failed for user {user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/rooms/community/{community_id}", response_model=List[ChatRoomResponse])
def get_community_chat_rooms(
    community_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get all chat rooms for a community"""
    try:
        return ChatService.get_community_chat_rooms(db, community_id, user.id)
    except Exception as e:
        logger.error(f"Get community chat rooms failed for community {community_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/messages", response_model=MessageResponse)
def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Send a message to a chat room"""
    try:
        db_message = ChatService.send_message(db, message, user.id)
        
        # Add sender information for response
        db_message.sender_display_name = user.user_metadata.get('display_name') or user.email
        db_message.is_sender = True
        
        return db_message
    except Exception as e:
        logger.error(f"Send message failed for user {user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/messages/{chat_id}")
def get_chat_messages(
    chat_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get messages from a chat room with pagination"""
    try:
        result = ChatService.get_chat_messages(db, chat_id, user.id, skip, limit)
        result['chat_id'] = chat_id
        return result
    except Exception as e:
        logger.error(f"Get chat messages failed for chat {chat_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))