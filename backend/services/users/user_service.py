from sqlalchemy.orm import Session
from models import User
from schemas.users.user_schema import UserProfileUpdate
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    def get_user_profile(db: Session, user_id: UUID):
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise Exception("User not found")
        return user
    
    @staticmethod
    def update_user_profile(db: Session, user_id: UUID, profile_update: UserProfileUpdate):
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise Exception("User not found")
        
        update_data = profile_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"User {user_id} updated profile")
        return user

