from sqlalchemy.orm import Session
from sqlalchemy import desc
from models import Post, Community, Membership, User
from schemas.posts.post_schema import PostCreate, PostUpdate
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class PostService:
    @staticmethod
    def create_post(db: Session, post: PostCreate, user_id: UUID):
        community = db.query(Community).filter(Community.community_id == post.community_id).first()
        if not community:
            raise Exception("Community not found")
        
        is_owner = str(community.created_by) == str(user_id)
        
        if not is_owner:
            membership = db.query(Membership).filter(
                Membership.user_id == user_id,
                Membership.community_id == post.community_id
            ).first()
            
            if not membership:
                raise Exception("You must be a member of this community to create posts")
        db_post = Post(
            content=post.content,
            media_url=post.media_url,
            media_type=post.media_type,
            community_id=post.community_id,
            author_id=user_id
        )
        
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        
        logger.info(f"User {user_id} created post {db_post.post_id} in community {post.community_id}")
        return db_post
    
    @staticmethod
    def get_community_posts(db: Session, community_id: int, user_id: UUID = None, skip: int = 0, limit: int = 20):
        community = db.query(Community).filter(Community.community_id == community_id).first()
        if not community:
            raise Exception("Community not found")
        
        if user_id:
            is_owner = str(community.created_by) == str(user_id)
            
            if not is_owner:
                membership = db.query(Membership).filter(
                    Membership.user_id == user_id,
                    Membership.community_id == community_id
                ).first()
                
                if not membership:
                    raise Exception("You must be a member of this community to view posts")
        posts_query = db.query(Post, User).join(
            User, Post.author_id == User.user_id
        ).filter(
            Post.community_id == community_id
        ).order_by(desc(Post.created_at))
        
        total_count = posts_query.count()
        posts_with_users = posts_query.offset(skip).limit(limit).all()
        
        posts_data = []
        for post, author in posts_with_users:
            post.author_display_name = author.display_name or author.username or author.email
            post.is_author = user_id and str(post.author_id) == str(user_id)
            posts_data.append(post)
        
        has_more = skip + limit < total_count
        page = (skip // limit) + 1 if limit > 0 else 1
        
        return {
            "posts": posts_data,
            "total_count": total_count,
            "page": page,
            "page_size": limit,
            "has_more": has_more
        }
    
    @staticmethod
    def get_post(db: Session, post_id: int):
        return db.query(Post).filter(Post.post_id == post_id).first()
    
    @staticmethod
    def update_post(db: Session, post_id: int, post_update: PostUpdate, user_id: UUID):
        db_post = db.query(Post).filter(Post.post_id == post_id).first()
        
        if not db_post:
            return None
        
        if str(db_post.author_id) != str(user_id):
            raise Exception("You can only edit your own posts")
        update_data = post_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_post, field, value)
        
        db.commit()
        db.refresh(db_post)
        
        logger.info(f"User {user_id} updated post {post_id}")
        return db_post
    
    @staticmethod
    def delete_post(db: Session, post_id: int, user_id: UUID):
        db_post = db.query(Post).filter(Post.post_id == post_id).first()
        
        if not db_post:
            return None
        
        if str(db_post.author_id) != str(user_id):
            raise Exception("You can only delete your own posts")
        
        db.delete(db_post)
        db.commit()
        
        logger.info(f"User {user_id} deleted post {post_id}")
        return True