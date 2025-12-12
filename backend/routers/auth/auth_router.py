from fastapi import APIRouter, HTTPException
from schemas.auth.auth_schema import UserSignup, UserLogin
from services.auth.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/signup")
def signup(user: UserSignup):
    try:
        logger.info(f"Signup request received for email: {user.email}")
        response = AuthService.signup(user.email, user.password)
        
        if not hasattr(response, 'user') or not response.user:
            logger.error(f"Signup failed - no user in response: {response}")
            raise HTTPException(status_code=400, detail="Signup failed - user not created")
             
        return {"message": "Signup successful", "user": response.user}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup exception: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Signup error: {str(e)}")

@router.post("/login")
def login(user: UserLogin):
    try:
        logger.info(f"Login request received for email: {user.email}")
        response = AuthService.login(user.email, user.password)
        
        if not hasattr(response, 'session') or not response.session:
            logger.error(f"Login failed - no session in response: {response}")
            raise HTTPException(status_code=400, detail="Login failed - invalid credentials")

        return {"message": "Login successful", "session": response.session}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login exception: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Login error: {str(e)}")

@router.post("/logout")
def logout():
    try:
        logger.info("Logout request received")
        AuthService.logout()
        return {"message": "Logout successful"}
    except Exception as e:
        logger.error(f"Logout exception: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Logout error: {str(e)}")
