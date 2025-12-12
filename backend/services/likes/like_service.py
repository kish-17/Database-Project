from sqlalchemy.orm import Session
from models import Like, Post, Community, Membership
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class LikeService:
    @staticmethod
    def toggle_like(db: Session, post_id: int, user_id: UUID):
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise Exception("Post not found")
        
        community = db.query(Community).filter(Community.community_id == post.community_id).first()
        is_owner = str(community.created_by) == str(user_id) if community else False
        
        if not is_owner:
            membership = db.query(Membership).filter(
                Membership.user_id == user_id,
                Membership.community_id == post.community_id
            ).first()
            
            if not membership:
                raise Exception("You must be a member of this community to like posts")
        
        existing_like = db.query(Like).filter(
            Like.post_id == post_id,
            Like.user_id == user_id
        ).first()
        
        if existing_like:
            db.delete(existing_like)
            db.commit()
            logger.info(f"User {user_id} unliked post {post_id}")
            like_count = db.query(Like).filter(Like.post_id == post_id).count()
            return {
                "post_id": post_id,
                "is_liked": False,
                "like_count": like_count,
                "message": "Post unliked successfully"
            }
        else:
            new_like = Like(
                post_id=post_id,
                user_id=user_id
            )
            db.add(new_like)
            db.commit()
            db.refresh(new_like)
            logger.info(f"User {user_id} liked post {post_id}")
            like_count = db.query(Like).filter(Like.post_id == post_id).count()
            return {
                "post_id": post_id,
                "is_liked": True,
                "like_count": like_count,
                "message": "Post liked successfully"
            }
    
    @staticmethod
    def get_post_likes_count(db: Session, post_id: int):
        return db.query(Like).filter(Like.post_id == post_id).count()
    
    @staticmethod
    def is_post_liked_by_user(db: Session, post_id: int, user_id: UUID):
        if not user_id:
            return False
        
        like = db.query(Like).filter(
            Like.post_id == post_id,
            Like.user_id == user_id
        ).first()
        
        return like is not None