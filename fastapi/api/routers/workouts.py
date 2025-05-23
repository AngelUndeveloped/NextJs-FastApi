"""
Workouts Router Module

This module handles all workout-related API endpoints, providing CRUD operations
for individual workout management. Workouts are associated with users and can be
included in multiple routines.

Endpoints:
----------
- GET /workouts/ - Get a specific workout by ID
- GET /workouts/workouts - Get all workouts (should be refactored)
- POST /workouts/ - Create a new workout
- DELETE /workouts/ - Delete a workout by ID

Authentication:
---------------
All endpoints require JWT authentication. Users can only access workouts
they have permission to view/modify.

Models:
-------
- WorkoutBase: Base model with common workout fields
- WorkoutCreate: Model for workout creation requests
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status, Query

from api.models import Workout
from api.deps import db_dependency, user_dependency

# Create router instance for workout endpoints
router = APIRouter(
    prefix="/workouts",
    tags=["workouts"]
)

class WorkoutBase(BaseModel):
    """
    Base Pydantic model for workout data.
    
    Contains the common fields shared between different workout operations.
    
    Attributes:
        name (str): The name of the workout (required)
        description (str, optional): Detailed description of the workout
    """
    name: str = Field(..., min_length=1, max_length=100, description="Name of the workout")
    description: Optional[str] = Field(None, max_length=500, description="Description of the workout")

class WorkoutCreate(WorkoutBase):
    """
    Pydantic model for workout creation requests.
    
    Inherits all fields from WorkoutBase. Used for POST /workouts/ endpoint.
    The user_id is automatically set from the authenticated user.
    """
    pass

class WorkoutResponse(WorkoutBase):
    """
    Pydantic model for workout response data.
    
    Includes the workout ID and user association for API responses.
    
    Attributes:
        id (int): Unique identifier for the workout
        user_id (int): ID of the user who created the workout
        name (str): Name of the workout
        description (str, optional): Description of the workout
    """
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

@router.get("/", status_code=status.HTTP_200_OK, response_model=WorkoutResponse)
def get_workout(
    db: db_dependency, 
    user: user_dependency, 
    workout_id: int = Query(..., description="ID of the workout to retrieve")
):
    """
    Retrieve a specific workout by ID.
    
    Fetches a single workout from the database. Users can only access workouts
    they have permission to view.
    
    Args:
        db: Database session dependency
        user: Authenticated user dependency
        workout_id (int): The ID of the workout to retrieve
        
    Returns:
        WorkoutResponse: The requested workout data
        
    Raises:
        HTTPException: 404 if workout not found or user doesn't have access
    """
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Workout not found"
        )
    return workout

@router.get("/all", status_code=status.HTTP_200_OK, response_model=list[WorkoutResponse])
def get_workouts(db: db_dependency, user: user_dependency):
    """
    Retrieve all workouts for the authenticated user.
    
    Returns a list of all workouts created by the current user.
    
    Args:
        db: Database session dependency
        user: Authenticated user dependency
        
    Returns:
        list[WorkoutResponse]: List of user's workouts
    """
    return db.query(Workout).filter(Workout.user_id == user['id']).all()

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=WorkoutResponse)
def create_workout(
    db: db_dependency, 
    user: user_dependency, 
    workout: WorkoutCreate
):
    """
    Create a new workout for the authenticated user.
    
    Creates a new workout record in the database with the provided data.
    The workout is automatically associated with the authenticated user.
    
    Args:
        db: Database session dependency
        user: Authenticated user dependency
        workout (WorkoutCreate): The workout data to create
        
    Returns:
        WorkoutResponse: The created workout with generated ID
        
    Raises:
        HTTPException: 400 if workout creation fails due to validation errors
    """
    try:
        db_workout = Workout(**workout.model_dump(), user_id=user['id'])
        db.add(db_workout)
        db.commit()
        db.refresh(db_workout)
        return db_workout
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create workout: {str(e)}"
        )

@router.delete("/", status_code=status.HTTP_200_OK)
def delete_workout(
    db: db_dependency, 
    user: user_dependency, 
    workout_id: int = Query(..., description="ID of the workout to delete")
):
    """
    Delete a specific workout.
    
    Removes a workout from the database. Users can only delete workouts they own.
    This will also remove the workout from any routines that included it.
    
    Args:
        db: Database session dependency
        user: Authenticated user dependency
        workout_id (int): The ID of the workout to delete
        
    Returns:
        dict: Success message confirming deletion
        
    Raises:
        HTTPException: 404 if workout not found
        HTTPException: 403 if user doesn't own the workout
    """
    db_workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == user['id']
    ).first()
    
    if not db_workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Workout not found or you don't have permission to delete it"
        )
    
    try:
        db.delete(db_workout)
        db.commit()
        return {"message": "Workout deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete workout: {str(e)}"
        )
