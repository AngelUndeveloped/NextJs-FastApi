"""
FastAPI + NextJS Integration Project

This is the main FastAPI application file that sets up the backend server and defines API endpoints.
The application is designed to work with a NextJS frontend running on localhost:3000.

Features:
- RESTful API endpoints
- CORS configuration for frontend integration
- JWT-based authentication
- SQLite database with SQLAlchemy ORM
- Automatic API documentation with Swagger UI

Author: Your Name
Version: 1.0.0
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from .database import Base, engine
from .routers import auth, workouts, routines
from . import models  # Import models to ensure they are registered with Base

# Initialize FastAPI application with metadata
app = FastAPI(
    title="FastAPI + NextJS Learning Project",
    description="A practice project demonstrating FastAPI backend with NextJS frontend integration",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI documentation
    redoc_url="/redoc"  # ReDoc documentation
)

# Create all database tables
# This must be done after importing models to ensure all tables are created
Base.metadata.create_all(bind=engine)

# Configure CORS middleware to allow requests from the NextJS frontend
# This is essential for local development where frontend and backend run on different ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # NextJS development server
        "http://127.0.0.1:3000",    # Alternative localhost format
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/", tags=["Health Check"])
def health_check():
    """
    Health check endpoint to verify the API is running.
    
    This endpoint can be used by monitoring systems, load balancers,
    or frontend applications to check if the API is operational.
    
    Returns:
        dict: A dictionary containing the status of the API
            {
                "status": "ok",       # Indicates the API is running properly
                "message": "API is running successfully"
            }
    """
    return {
        "status": "ok",
        "message": "API is running successfully"
    }

@app.get("/hello", tags=["Examples"])
def hello():
    """
    Example endpoint that returns a greeting message.
    
    This is a simple demonstration endpoint that shows how to create
    a basic API route with FastAPI.
    
    Returns:
        dict: A dictionary containing a greeting message
            {
                "message": "Hello, World!",  # The greeting message
                "version": "1.0.0"           # API version
            }
    """
    return {
        "message": "Hello, World!",
        "version": "1.0.0"
    }

@app.get("/info", tags=["API Information"])
def api_info():
    """
    Get information about the API endpoints and features.
    
    Returns:
        dict: A dictionary containing API information
            {
                "name": str,           # API name
                "version": str,        # API version
                "endpoints": list,     # Available endpoint categories
                "documentation": dict  # Links to documentation
            }
    """
    return {
        "name": "FastAPI + NextJS Learning Project",
        "version": "1.0.0",
        "endpoints": [
            "Authentication (/auth/)",
            "Health Check (/)",
            "Examples (/hello)",
            "API Information (/info)"
        ],
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc"
        }
    }

# Include routers
# Authentication router handles user registration, login, and JWT token management
app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(routines.router)