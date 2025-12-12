from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.db import get_db
from schemas.communities.community_schema import CommunityCreate, CommunityUpdate, CommunityResponse, CommunityDetailResponse
from services.communities.community_service import CommunityService
from dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/communities",
    tags=["communities"]
)

@router.post("/", response_model=CommunityResponse)
def create_community(
    community: CommunityCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        return CommunityService.create_community(db, community, user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[CommunityResponse])
def read_communities(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return CommunityService.get_all_communities(db, skip, limit)

@router.get("/{community_id}", response_model=CommunityResponse)
def read_community(
    community_id: int,
    db: Session = Depends(get_db)
):
    community = CommunityService.get_community(db, community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return community

@router.get("/{community_id}/details", response_model=CommunityDetailResponse)
def read_community_details(
    community_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        community = CommunityService.get_community_with_details(db, community_id, user.id)
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")
        return community
    except Exception as e:
        logger.error(f"Get community details failed for community {community_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{community_id}", response_model=CommunityResponse)
def update_community(
    community_id: int,
    community_update: CommunityUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        updated_community = CommunityService.update_community(db, community_id, community_update, user.id)
        if not updated_community:
            raise HTTPException(status_code=404, detail="Community not found")
        return updated_community
    except Exception as e:
        logger.error(f"Update community {community_id} failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{community_id}")
def delete_community(
    community_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        result = CommunityService.delete_community(db, community_id, user.id)
        if not result:
            raise HTTPException(status_code=404, detail="Community not found")
        return {"message": "Community deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

