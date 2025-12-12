from config.db import supabase
import logging

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def signup(email: str, password: str):
        try:
            logger.info(f"Attempting signup for email: {email}")
            if not supabase:
                logger.error("Supabase client is not initialized")
                raise Exception("Authentication service unavailable")
                
            response = supabase.auth.sign_up({
                "email": email,
                "password": password,
            })
            
            logger.info(f"Signup response: {response}")
            if hasattr(response, 'user') and response.user:
                logger.info(f"Signup successful for user: {response.user.email}")
            else:
                logger.error(f"Signup failed - no user returned")
                
            return response
        except Exception as e:
            logger.error(f"Signup error for {email}: {str(e)}")
            raise

    @staticmethod
    def login(email: str, password: str):
        try:
            logger.info(f"Attempting login for email: {email}")
            if not supabase:
                logger.error("Supabase client is not initialized")
                raise Exception("Authentication service unavailable")
                
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password,
            })
            
            logger.info(f"Login response: {response}")
            if hasattr(response, 'session') and response.session:
                logger.info(f"Login successful for user: {email}")
            else:
                logger.error(f"Login failed - no session returned")
                
            return response
        except Exception as e:
            logger.error(f"Login error for {email}: {str(e)}")
            raise

    @staticmethod
    def logout():
        try:
            logger.info("Attempting logout")
            if not supabase:
                logger.error("Supabase client is not initialized")
                raise Exception("Authentication service unavailable")
                
            response = supabase.auth.sign_out()
            logger.info("Logout successful")
            return response
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            raise

