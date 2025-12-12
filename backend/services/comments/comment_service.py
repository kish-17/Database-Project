from sqlalchemy.orm import Session
from sqlalchemy import desc
from models import Comment, Post, Community, Membership, User
from schemas.comments.comment_schema import CommentCreate, CommentUpdate
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class CommentService:
    @staticmethod
    def create_comment(db: Session, comment: CommentCreate, user_id: UUID):
        post = db.query(Post).filter(Post.post_id == comment.post_id).first()
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
                raise Exception("You must be a member of this community to comment")
        
        db_comment = Comment(
            content=comment.content,
            post_id=comment.post_id,
            author_id=user_id
        )
        
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        
        logger.info(f"User {user_id} created comment {db_comment.comment_id} on post {comment.post_id}")
        return db_comment
    
    @staticmethod
    def get_post_comments(db: Session, post_id: int, user_id: UUID = None, skip: int = 0, limit: int = 20):
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise Exception("Post not found")
        
        if user_id:
            community = db.query(Community).filter(Community.community_id == post.community_id).first()
            is_owner = str(community.created_by) == str(user_id) if community else False
            
            if not is_owner:
                membership = db.query(Membership).filter(
                    Membership.user_id == user_id,
                    Membership.community_id == post.community_id
                ).first()
                
                if not membership:
                    raise Exception("You must be a member of this community to view comments")
        
        comments_query = db.query(Comment, User).join(
            User, Comment.author_id == User.user_id
        ).filter(
            Comment.post_id == post_id
        ).order_by(desc(Comment.created_at))
        
        total_count = comments_query.count()
        comments_with_users = comments_query.offset(skip).limit(limit).all()
        
        comments_data = []
        for comment, author in comments_with_users:
            comment.author_display_name = author.display_name or author.username or author.email
            comment.is_author = user_id and str(comment.author_id) == str(user_id)
            comments_data.append(comment)
        
        has_more = skip + limit < total_count
        page = (skip // limit) + 1 if limit > 0 else 1
        
        return {
            "comments": comments_data,
            "total_count": total_count,
            "page": page,
            "page_size": limit,
            "has_more": has_more
        }
    
    @staticmethod
    def update_comment(db: Session, comment_id: int, comment_update: CommentUpdate, user_id: UUID):
        db_comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
        
        if not db_comment:
            return None
        
        if str(db_comment.author_id) != str(user_id):
            raise Exception("You can only edit your own comments")
        
        update_data = comment_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_comment, field, value)
        
        db.commit()
        db.refresh(db_comment)
        
        logger.info(f"User {user_id} updated comment {comment_id}")
        return db_comment
    
    @staticmethod
    def delete_comment(db: Session, comment_id: int, user_id: UUID):
        db_comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
        
        if not db_comment:
            return None
        
        if str(db_comment.author_id) != str(user_id):
            raise Exception("You can only delete your own comments")
        
        db.delete(db_comment)
        db.commit()
        
        logger.info(f"User {user_id} deleted comment {comment_id}")
        return True