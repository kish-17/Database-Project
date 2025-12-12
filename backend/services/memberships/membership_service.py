from sqlalchemy.orm import Session
from models import Membership, Community, User
from schemas.memberships.membership_schema import MembershipCreate, UpdateMemberRoleRequest
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class MembershipService:
    @staticmethod
    def join_community(db: Session, membership: MembershipCreate, user_id: UUID):
        community = db.query(Community).filter(Community.community_id == membership.community_id).first()
        if not community:
            raise Exception("Community not found")
        
        existing_membership = db.query(Membership).filter(
            Membership.user_id == user_id,
            Membership.community_id == membership.community_id
        ).first()
        
        if existing_membership:
            raise Exception("You are already a member of this community")
        
        if str(community.created_by) == str(user_id):
            raise Exception("You are the owner of this community")
        
        db_membership = Membership(
            user_id=user_id,
            community_id=membership.community_id,
            role="member"
        )
        
        db.add(db_membership)
        db.commit()
        db.refresh(db_membership)
        
        logger.info(f"User {user_id} joined community {membership.community_id}")
        return db_membership
    
    @staticmethod
    def leave_community(db: Session, community_id: int, user_id: UUID):
        community = db.query(Community).filter(Community.community_id == community_id).first()
        if not community:
            raise Exception("Community not found")
        
        if str(community.created_by) == str(user_id):
            raise Exception("Community owners cannot leave their own community")
        
        membership = db.query(Membership).filter(
            Membership.user_id == user_id,
            Membership.community_id == community_id
        ).first()
        
        if not membership:
            raise Exception("You are not a member of this community")
        
        db.delete(membership)
        db.commit()
        
        logger.info(f"User {user_id} left community {community_id}")
        return True
    
    @staticmethod
    def is_member(db: Session, community_id: int, user_id: UUID):
        membership = db.query(Membership).filter(
            Membership.user_id == user_id,
            Membership.community_id == community_id
        ).first()
        return membership is not None
    
    @staticmethod
    def get_user_communities(db: Session, user_id: UUID):
        memberships = db.query(Membership, Community).join(
            Community, Membership.community_id == Community.community_id
        ).filter(Membership.user_id == user_id).all()
        
        membership_data = []
        for membership, community in memberships:
            community.role = membership.role
            community.joined_at = membership.joined_at
            membership_data.append(community)
        
        return membership_data
    
    @staticmethod
    def get_community_members(db: Session, community_id: int, requesting_user_id: UUID):
        community = db.query(Community).filter(Community.community_id == community_id).first()
        if not community:
            raise Exception("Community not found")
        
        is_owner = str(community.created_by) == str(requesting_user_id)
        
        if not is_owner:
            requesting_membership = db.query(Membership).filter(
                Membership.user_id == requesting_user_id,
                Membership.community_id == community_id
            ).first()
            
            if not requesting_membership:
                raise Exception("You must be a member of this community to view members")
        
        memberships_query = db.query(Membership, User).join(
            User, Membership.user_id == User.user_id
        ).filter(Membership.community_id == community_id)
        
        memberships_with_users = memberships_query.all()
        
        members_data = []
        for membership, user in memberships_with_users:
            member_data = {
                "membership_id": membership.membership_id,
                "user_id": str(user.user_id),
                "community_id": community_id,
                "role": membership.role,
                "joined_at": membership.joined_at,
                "user_display_name": user.display_name or user.username or user.email,
                "is_owner": False
            }
            members_data.append(member_data)
        
        if community.created_by:
            owner_in_members = any(member["user_id"] == str(community.created_by) for member in members_data)
            
            if not owner_in_members:
                owner = db.query(User).filter(User.user_id == community.created_by).first()
                if owner:
                    owner_data = {
                        "membership_id": 0,
                        "user_id": str(owner.user_id),
                        "community_id": community_id,
                        "role": "owner",
                        "joined_at": community.created_at,
                        "user_display_name": owner.display_name or owner.username or owner.email,
                        "is_owner": True
                    }
                    members_data.insert(0, owner_data)
            else:
                for member in members_data:
                    if member["user_id"] == str(community.created_by):
                        member["is_owner"] = True
                        break
        
        return members_data
    
    @staticmethod
    def update_member_role(db: Session, community_id: int, target_user_id: str, role_request: UpdateMemberRoleRequest, requesting_user_id: UUID):
        community = db.query(Community).filter(Community.community_id == community_id).first()
        if not community:
            raise Exception("Community not found")
        
        is_owner = str(community.created_by) == str(requesting_user_id)
        
        if not is_owner:
            requesting_membership = db.query(Membership).filter(
                Membership.user_id == requesting_user_id,
                Membership.community_id == community_id
            ).first()
            
            if not requesting_membership or requesting_membership.role not in ["owner", "admin"]:
                raise Exception("You must be an owner or admin to change member roles")
        
        target_membership = db.query(Membership).filter(
            Membership.user_id == target_user_id,
            Membership.community_id == community_id
        ).first()
        
        if not target_membership:
            raise Exception("Target user is not a member of this community")
        
        if str(community.created_by) == target_user_id:
            raise Exception("Cannot change the role of the community owner")
        
        target_membership.role = role_request.role
        db.commit()
        db.refresh(target_membership)
        
        logger.info(f"User {requesting_user_id} changed role of user {target_user_id} to {role_request.role} in community {community_id}")
        return target_membership