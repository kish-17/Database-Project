from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Community, Membership
from schemas.communities.community_schema import CommunityCreate, CommunityUpdate
from services.chat.chat_service import ChatService
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class CommunityService:
    @staticmethod
    def create_community(db: Session, community: CommunityCreate, user_id: UUID):
        db_community = Community(
            name=community.name,
            description=community.description,
            created_by=user_id
        )
        db.add(db_community)
        db.commit()
        db.refresh(db_community)
        
        try:
            ChatService.create_default_chat_room(db, db_community.community_id)
        except Exception as e:
            logger.warning(f"Failed to create default chat room for community {db_community.community_id}: {str(e)}")
        
        return db_community

    @staticmethod
    def get_all_communities(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Community).offset(skip).limit(limit).all()

    @staticmethod
    def get_community(db: Session, community_id: int):
        return db.query(Community).filter(Community.community_id == community_id).first()
    
    @staticmethod
    def get_community_with_details(db: Session, community_id: int, user_id: UUID = None):
        community = db.query(Community).filter(Community.community_id == community_id).first()
        
        if not community:
            return None
        
        membership_count = db.query(Membership).filter(Membership.community_id == community_id).count()
        
        owner_has_membership = False
        if community.created_by:
            owner_membership = db.query(Membership).filter(
                Membership.user_id == community.created_by,
                Membership.community_id == community_id
            ).first()
            owner_has_membership = owner_membership is not None
        
        member_count = membership_count + (1 if community.created_by and not owner_has_membership else 0)
        
        is_member = False
        is_owner = False
        
        if user_id:
            is_owner = str(community.created_by) == str(user_id)
            
            if is_owner:
                is_member = True
            else:
                membership = db.query(Membership).filter(
                    Membership.user_id == user_id,
                    Membership.community_id == community_id
                ).first()
                is_member = membership is not None
        community.member_count = member_count
        community.is_member = is_member
        community.is_owner = is_owner
        
        return community

    @staticmethod
    def update_community(db: Session, community_id: int, community_update: CommunityUpdate, user_id: UUID):
        db_community = db.query(Community).filter(Community.community_id == community_id).first()
        
        if not db_community:
            return None
        if str(db_community.created_by) != str(user_id):
            logger.error(f"Ownership check failed - user {user_id} cannot edit community {community_id} created by {db_community.created_by}")
            raise Exception("You can only edit communities you created")
        
        update_data = community_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_community, field, value)
        
        db.commit()
        db.refresh(db_community)
        return db_community

    @staticmethod
    def delete_community(db: Session, community_id: int, user_id: UUID):
        db_community = db.query(Community).filter(Community.community_id == community_id).first()
        
        if not db_community:
            return None
        if str(db_community.created_by) != str(user_id):
            raise Exception("You can only delete communities you created")
        
        db.delete(db_community)
        db.commit()
        return True

