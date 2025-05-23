"""
Dependencies Module

This module contains dependency functions and shared utilities used across
the FastAPI application, including database session management and
authentication utilities.
"""

from typing import Annotated
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
from .database import SessionLocal

# Load environment variables from .env file
load_dotenv()

# Authentication configuration with fallback values
SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "fallback-secret-key-change-this-in-production")
ALGORITHM = os.getenv("AUTH_ALGORITHM", "HS256")

def get_db():
    """
    Dependency function to get a database session.
    
    This function creates a new database session and ensures it is properly closed
    after use, even if an error occurs. It's used as a FastAPI dependency.
    
    Yields:
        Session: A SQLAlchemy database session
        
    Example:
        ```python
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            items = db.query(Item).all()
            return items
        ```
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database dependency annotation for type hints
# This allows FastAPI to automatically inject database sessions into endpoint functions
db_dependency = Annotated[Session, Depends(get_db)]

# Password hashing context using bcrypt algorithm
# Used for hashing passwords during registration and verifying during login
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 bearer token scheme for authentication
# Expects tokens to be passed in the Authorization header as "Bearer <token>"
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

# OAuth2 bearer dependency annotation for type hints
# This allows FastAPI to automatically extract and validate bearer tokens
oauth2_bearer_dependency = Annotated[str, Depends(oauth2_bearer)]

async def get_current_user(token: oauth2_bearer_dependency):
    """
    Extract and validate the current user from a JWT token.
    
    This function decodes the JWT token to extract user information and validates
    that all required fields are present. It's used as a dependency for protected
    endpoints that require authentication.
    
    Args:
        token (str): The JWT bearer token from the Authorization header
        
    Returns:
        dict: A dictionary containing user information:
            {
                "username": str,  # The user's username
                "id": int        # The user's ID
            }
            
    Raises:
        HTTPException: 401 Unauthorized if:
            - Token is invalid or expired
            - Token is missing required fields (username or user_id)
            - Token signature verification fails
            
    Example:
        ```python
        @app.get("/protected")
        def protected_endpoint(current_user: dict = Depends(get_current_user)):
            return {"message": f"Hello {current_user['username']}!"}
        ```
    """
    try:
        # Decode the JWT token using the secret key and algorithm
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract username and user ID from token payload
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        
        # Validate that required fields are present
        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail='Could not validate user credentials'
            )
            
        return {'username': username, 'id': user_id}
        
    except JWTError:
        # Handle any JWT-related errors (invalid signature, expired token, etc.)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail='Could not validate user credentials'
        )

# User dependency annotation for type hints
# This allows FastAPI to automatically inject current user info into endpoint functions
user_dependency = Annotated[dict, Depends(get_current_user)]
