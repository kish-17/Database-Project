from sqlalchemy.orm import Session
from sqlalchemy import desc
from models import ChatRoom, Community, Membership, Message, User
from schemas.chat.chat_schema import ChatRoomCreate, MessageCreate
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class ChatService:
    @staticmethod
    def create_chat_room(db: Session, chat_room: ChatRoomCreate, user_id: UUID):
        community = db.query(Community).filter(Community.community_id == chat_room.community_id).first()
        if not community:
            raise Exception("Community not found")
        
        is_owner = str(community.created_by) == str(user_id)
        
        if not is_owner:
            membership = db.query(Membership).filter(
                Membership.user_id == user_id,
                Membership.community_id == chat_room.community_id
            ).first()
            
            if not membership:
                raise Exception("You must be a member of this community to create chat rooms")
        
        existing_room = db.query(ChatRoom).filter(
            ChatRoom.community_id == chat_room.community_id,
            ChatRoom.title == chat_room.title
        ).first()
        
        if existing_room:
            raise Exception("A chat room with this title already exists in this community")
        
        db_chat_room = ChatRoom(
            title=chat_room.title,
            community_id=chat_room.community_id
        )
        
        db.add(db_chat_room)
        db.commit()
        db.refresh(db_chat_room)
        
        logger.info(f"User {user_id} created chat room {db_chat_room.chat_id} in community {chat_room.community_id}")
        return db_chat_room
    
    @staticmethod
    def get_community_chat_rooms(db: Session, community_id: int, user_id: UUID):
        community = db.query(Community).filter(Community.community_id == community_id).first()
        if not community:
            raise Exception("Community not found")
        
        is_owner = str(community.created_by) == str(user_id)
        
        if not is_owner:
            membership = db.query(Membership).filter(
                Membership.user_id == user_id,
                Membership.community_id == community_id
            ).first()
            
            if not membership:
                raise Exception("You must be a member of this community to view chat rooms")
        
        chat_rooms = db.query(ChatRoom).filter(ChatRoom.community_id == community_id).all()
        
        return chat_rooms
    
    @staticmethod
    def send_message(db: Session, message: MessageCreate, user_id: UUID):
        chat_room = db.query(ChatRoom).filter(ChatRoom.chat_id == message.chat_id).first()
        if not chat_room:
            raise Exception("Chat room not found")
        
        is_owner = str(chat_room.community.created_by) == str(user_id) if hasattr(chat_room, 'community') else False
        
        if not is_owner:
            membership = db.query(Membership).filter(
                Membership.user_id == user_id,
                Membership.community_id == chat_room.community_id
            ).first()
            
            if not membership:
                raise Exception("You must be a member of this community to send messages")
        
        db_message = Message(
            chat_id=message.chat_id,
            sender_id=user_id,
            content=message.content,
            type=message.type or 'text'
        )
        
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        
        return db_message
    
    @staticmethod
    def get_chat_messages(db: Session, chat_id: int, user_id: UUID, skip: int = 0, limit: int = 50):
        chat_room = db.query(ChatRoom).filter(ChatRoom.chat_id == chat_id).first()
        if not chat_room:
            raise Exception("Chat room not found")
        
        community = db.query(Community).filter(Community.community_id == chat_room.community_id).first()
        is_owner = str(community.created_by) == str(user_id) if community else False
        
        if not is_owner:
            membership = db.query(Membership).filter(
                Membership.user_id == user_id,
                Membership.community_id == chat_room.community_id
            ).first()
            
            if not membership:
                raise Exception("You must be a member of this community to view messages")
        
        messages_query = db.query(Message, User).join(
            User, Message.sender_id == User.user_id, isouter=True
        ).filter(Message.chat_id == chat_id).order_by(desc(Message.sent_at))
        
        total_count = messages_query.count()
        messages_with_users = messages_query.offset(skip).limit(limit).all()
        
        messages_data = []
        for message, sender in reversed(messages_with_users):
            message.sender_display_name = sender.display_name or sender.username or sender.email if sender else "Unknown User"
            message.is_sender = user_id and str(message.sender_id) == str(user_id)
            messages_data.append(message)
        
        has_more = skip + limit < total_count
        
        return {
            "messages": messages_data,
            "total_count": total_count,
            "has_more": has_more
        }
    
    @staticmethod
    def create_default_chat_room(db: Session, community_id: int):
        existing_general = db.query(ChatRoom).filter(
            ChatRoom.community_id == community_id,
            ChatRoom.title == "General"
        ).first()
        
        if not existing_general:
            default_room = ChatRoom(
                title="General",
                community_id=community_id
            )
            db.add(default_room)
            db.commit()
            db.refresh(default_room)
            
            logger.info(f"Created default chat room for community {community_id}")
            return default_room
        
        return existing_general