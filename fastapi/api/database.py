"""
Database Configuration Module
This module sets up the SQLAlchemy database connection and session management.
It uses SQLite as the database backend for simplicity in development.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL for SQLite - creates a local file-based database
SQLALCHEMY_DATABASE_URL = "sqlite:///workout_app.db"

# Create SQLAlchemy engine instance
# check_same_thread=False allows multiple threads to access the database
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create a session factory for database operations
# This will be used to create individual database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for declarative models
# All database models will inherit from this Base class
Base = declarative_base()

def get_db():
    """
    Dependency function to get a database session.
    
    This function creates a new database session and ensures it is properly closed
    after use, even if an error occurs.
    
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