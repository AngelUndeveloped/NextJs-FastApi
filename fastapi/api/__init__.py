"""
API Package

This package contains the FastAPI application modules for the NextJS + FastAPI learning project.
It provides a complete backend API with authentication, database management, and RESTful endpoints.

Modules:
--------
- main: FastAPI application setup, CORS configuration, and basic endpoints
- database: SQLAlchemy database configuration and session management
- models: Database models using SQLAlchemy ORM (User, Workout, Routine)
- deps: Dependency injection functions for database sessions and authentication
- routers: API route handlers organized by functionality
  - auth: Authentication endpoints (register, login, token management)

Features:
---------
- JWT-based authentication system
- SQLite database with SQLAlchemy ORM
- CORS middleware for frontend integration
- Automatic API documentation (Swagger UI and ReDoc)
- Password hashing with BCrypt
- Dependency injection for database sessions
- Type hints and comprehensive error handling

Usage:
------
This package is designed to be run as a FastAPI application:

    uvicorn api.main:app --reload

Or using the FastAPI CLI:

    fastapi dev api/main.py

API Documentation:
------------------
When running, the API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

Environment Variables:
----------------------
- AUTH_SECRET_KEY: Secret key for JWT token signing
- AUTH_ALGORITHM: Algorithm for JWT token signing (default: HS256)

Version: 1.0.0
Author: Learning Project
"""

__version__ = "1.0.0"
__author__ = "Learning Project"
