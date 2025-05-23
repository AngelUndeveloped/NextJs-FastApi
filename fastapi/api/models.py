"""
Database Models Module

This module defines the SQLAlchemy models for the application using the declarative base.
All models inherit from the Base class defined in database.py and represent tables
in the SQLite database.

Models:
- User: Handles user authentication and account management
- Workout: Stores individual workout information
- Routine: Stores workout routines that can contain multiple workouts

Relationships:
- Users can have multiple workouts and routines (one-to-many)
- Workouts and routines have a many-to-many relationship through association table
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base
# from sqlalchemy.ext.declarative import declarative_base

# Base = declarative_base()

# Association table for many-to-many relationship between workouts and routines
# This table allows workouts to be part of multiple routines and routines to contain multiple workouts
workout_routine_association = Table(
    'workout_routine', 
    Base.metadata,
    Column('workout_id', Integer, ForeignKey('workouts.id'), primary_key=True),
    Column('routine_id', Integer, ForeignKey('routines.id'), primary_key=True)
)

class User(Base):
    """
    User model for authentication and user management.
    
    This model stores user account information including authentication credentials.
    Users can create workouts and routines that are associated with their account.
    
    Attributes:
        id (int): Primary key, auto-incrementing unique identifier
        username (str): User's unique username for login (indexed for performance)
        hashed_password (str): BCrypt hashed password for secure storage
        
    Table Name:
        users
        
    Indexes:
        - Primary key on id
        - Unique index on username for fast lookups and uniqueness enforcement
        
    Security:
        - Passwords are never stored in plain text
        - Username uniqueness is enforced at database level
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Workout(Base):
    """
    Workout model for storing individual workout information.
    
    Represents a single workout session with name, description, and ownership.
    Workouts can be included in multiple routines through the many-to-many relationship.
    
    Attributes:
        id (int): Primary key, auto-incrementing unique identifier
        user_id (int): Foreign key linking to the user who created this workout
        name (str): Descriptive name of the workout (indexed for search performance)
        description (str): Detailed description of the workout content
        routines (list): List of routines that include this workout (relationship)
        
    Table Name:
        workouts
        
    Relationships:
        - Many-to-one with User (user_id foreign key)
        - Many-to-many with Routine through workout_routine_association table
        
    Indexes:
        - Primary key on id
        - Index on name for search performance
    """
    __tablename__ = 'workouts'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    
    # Many-to-many relationship with routines
    routines = relationship(
        'Routine', 
        secondary=workout_routine_association, 
        back_populates='workouts'
    )

class Routine(Base):
    """
    Routine model for storing workout routines.
    
    Represents a collection of workouts organized into a routine. Users can create
    routines that contain multiple workouts in a specific order or grouping.
    
    Attributes:
        id (int): Primary key, auto-incrementing unique identifier
        user_id (int): Foreign key linking to the user who created this routine
        name (str): Descriptive name of the routine (indexed for search performance)
        description (str): Detailed description of the routine purpose and structure
        workouts (list): List of workouts included in this routine (relationship)
        
    Table Name:
        routines
        
    Relationships:
        - Many-to-one with User (user_id foreign key)
        - Many-to-many with Workout through workout_routine_association table
        
    Indexes:
        - Primary key on id
        - Index on name for search performance
    """
    __tablename__ = 'routines'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    
    # Many-to-many relationship with workouts
    workouts = relationship(
        'Workout', 
        secondary=workout_routine_association, 
        back_populates='routines'
    )
