from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.db import get_db
from schemas.memberships.membership_schema import (
    JoinCommunityResponse, 
    LeaveCommunityResponse, 
    MembershipStatus,
    MembershipResponse,
    MemberListResponse,
    UpdateMemberRoleRequest,
    UpdateMemberRoleResponse
)
from schemas.communities.community_schema import CommunityResponse
from services.memberships.membership_service import MembershipService
from dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/memberships",
    tags=["memberships"]
)

@router.post("/join/{community_id}", response_model=JoinCommunityResponse)
def join_community(
    community_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        from schemas.memberships.membership_schema import MembershipCreate
        membership_data = MembershipCreate(community_id=community_id)
        membership = MembershipService.join_community(db, membership_data, user.id)
        return JoinCommunityResponse(
            message="Successfully joined the community",
            membership=membership
        )
    except Exception as e:
        logger.error(f"Join community failed for user {user.id}, community {community_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/leave/{community_id}", response_model=LeaveCommunityResponse)
def leave_community(
    community_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        MembershipService.leave_community(db, community_id, user.id)
        return LeaveCommunityResponse(
            message="Successfully left the community",
            community_id=community_id
        )
    except Exception as e:
        logger.error(f"Leave community failed for user {user.id}, community {community_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status/{community_id}", response_model=MembershipStatus)
def get_membership_status(
    community_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        is_member = MembershipService.is_member(db, community_id, user.id)
        return MembershipStatus(
            is_member=is_member,
            community_id=community_id,
            message="Member" if is_member else "Not a member"
        )
    except Exception as e:
        logger.error(f"Get membership status failed for user {user.id}, community {community_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-communities", response_model=List[CommunityResponse])
def get_my_communities(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        communities = MembershipService.get_user_communities(db, user.id)
        return communities
    except Exception as e:
        logger.error(f"Get user communities failed for user {user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/community/{community_id}/members", response_model=MemberListResponse)
def get_community_members(
    community_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        members = MembershipService.get_community_members(db, community_id, user.id)
        return MemberListResponse(
            members=members,
            total_count=len(members),
            community_id=community_id
        )
    except Exception as e:
        logger.error(f"Get community members failed for community {community_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/community/{community_id}/members/{target_user_id}/role", response_model=UpdateMemberRoleResponse)
def update_member_role(
    community_id: int,
    target_user_id: str,  # UUID as string in URL
    role_update: UpdateMemberRoleRequest,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        from uuid import UUID
        target_uuid = UUID(target_user_id)
        
        updated_membership = MembershipService.update_member_role(
            db, community_id, str(target_uuid), role_update, user.id
        )
        
        return UpdateMemberRoleResponse(
            message=f"Successfully updated member role to {role_update.role}",
            membership=updated_membership
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    except Exception as e:
        logger.error(f"Update member role failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))