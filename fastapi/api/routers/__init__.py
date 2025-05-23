"""
Routers Package

This package contains FastAPI router modules organized by functionality.
Each router handles a specific domain of the API, promoting code organization
and maintainability.

Available Routers:
------------------
- auth: Authentication and user management endpoints
  - POST /auth/register - User registration
  - POST /auth/login - JSON-based login (alternative to OAuth2)
  - POST /auth/token - OAuth2 password flow login
  
Future Routers (planned):
-------------------------
- workouts: CRUD operations for workout management
- routines: CRUD operations for routine management
- users: User profile management endpoints

Router Organization:
--------------------
Each router module should:
1. Define its own APIRouter instance with appropriate prefix and tags
2. Include comprehensive docstrings for all endpoints
3. Use dependency injection for database sessions and authentication
4. Include proper error handling and HTTP status codes
5. Use Pydantic models for request/response validation

Usage:
------
Routers are included in the main FastAPI application via:

    from .routers import auth
    app.include_router(auth.router)

This allows for modular organization of API endpoints while maintaining
a single FastAPI application instance.

Version: 1.0.0
"""

__version__ = "1.0.0"
