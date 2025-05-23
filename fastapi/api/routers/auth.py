"""
Authentication Router Module

This module handles user authentication, including user registration and login
functionality using JWT tokens. It provides endpoints for creating new users
and authenticating existing users with username/password credentials.

The module uses:
- FastAPI for REST API endpoints
- JWT for token-based authentication
- BCrypt for password hashing
- OAuth2 password flow for login
"""

from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from dotenv import load_dotenv
import os
from api.models import User
from api.deps import db_dependency, bcrypt_context

# Load environment variables from .env file
load_dotenv()

# Create router instance for authentication endpoints
router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Authentication configuration from environment variables
SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "fallback-secret-key-change-in-production")
ALGORITHM = os.getenv("AUTH_ALGORITHM", "HS256")

class UserCreateRequest(BaseModel):
    """
    Pydantic model for user creation request.
    
    Attributes:
        username (str): The username for the new user account
        password (str): The plain text password (will be hashed before storage)
    """
    username: str
    password: str

class UserResponse(BaseModel):
    """
    Pydantic model for user response (without sensitive data).
    
    Attributes:
        id (int): The user's ID
        username (str): The user's username
    """
    id: int
    username: str

class Token(BaseModel):
    """
    Pydantic model for JWT token response.
    
    Attributes:
        access_token (str): The JWT access token
        token_type (str): The type of token (usually "Bearer")
    """
    access_token: str
    token_type: str

def authenticate_user(username: str, password: str, db):
    """
    Authenticate a user with username and password.
    
    This function retrieves a user from the database by username and verifies
    the provided password against the stored hashed password.
    
    Args:
        username (str): The username to authenticate
        password (str): The plain text password to verify
        db: Database session dependency
        
    Returns:
        User: The authenticated user object if credentials are valid
        False: If authentication fails (user not found or wrong password)
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    """
    Create a JWT access token for an authenticated user.
    
    This function generates a JWT token containing user information and an
    expiration timestamp.
    
    Args:
        username (str): The username to encode in the token
        user_id (int): The user ID to encode in the token
        expires_delta (timedelta): How long the token should be valid
        
    Returns:
        str: The encoded JWT token
    """
    encode = {"sub": username, "id": user_id}
    expires = datetime.now(timezone.utc) + expires_delta 
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_user(db: db_dependency, create_user_request: UserCreateRequest):
    """
    Create a new user account.
    
    This endpoint allows registration of new users by creating a user record
    with a hashed password in the database.
    
    Args:
        db: Database session dependency
        create_user_request (UserCreateRequest): The user creation data
        
    Returns:
        UserResponse: The created user information (without password)
        
    Raises:
        HTTPException: If user creation fails (e.g., username already exists)
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == create_user_request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    create_user_model = User(
        username=create_user_request.username,
        hashed_password=bcrypt_context.hash(create_user_request.password),
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    
    return UserResponse(id=create_user_model.id, username=create_user_model.username)

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    """
    Authenticate user and return JWT access token.
    
    This endpoint handles user login using OAuth2 password flow. It validates
    the provided credentials and returns a JWT token for authenticated access.
    
    Note: This endpoint expects form data with:
    - username: The user's username
    - password: The user's password
    - grant_type: Must be "password" (handled automatically by OAuth2PasswordRequestForm)
    
    Args:
        form_data (OAuth2PasswordRequestForm): Form data containing username and password
        db: Database session dependency
        
    Returns:
        Token: Dictionary containing the access token and token type
        
    Raises:
        HTTPException: 401 Unauthorized if credentials are invalid
    """
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token = create_access_token(user.username, user.id, timedelta(minutes=20))

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
async def login_with_json(user_credentials: UserCreateRequest, db: db_dependency):
    """
    Alternative login endpoint that accepts JSON instead of form data.
    
    This endpoint provides an alternative to the OAuth2 form-based login
    for clients that prefer to send JSON data.
    
    Args:
        user_credentials (UserCreateRequest): JSON data containing username and password
        db: Database session dependency
        
    Returns:
        Token: Dictionary containing the access token and token type
        
    Raises:
        HTTPException: 401 Unauthorized if credentials are invalid
    """
    user = authenticate_user(user_credentials.username, user_credentials.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect username or password"
        )
    token = create_access_token(user.username, user.id, timedelta(minutes=20))

    return {
        "access_token": token,
        "token_type": "bearer"
    }