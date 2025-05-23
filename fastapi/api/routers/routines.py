"""
Routines Router Module

This module handles all routine-related API endpoints, providing CRUD operations
for workout routine management. Routines are collections of workouts that users
can organize for their fitness plans.

Endpoints:
----------
- GET /routines/ - Get all routines for the authenticated user
- POST /routines/ - Create a new routine with associated workouts
- DELETE /routines/ - Delete a routine by ID

Features:
---------
- Many-to-many relationship between routines and workouts
- Automatic loading of associated workout data
- User ownership validation for all operations
- Comprehensive error handling

Authentication:
---------------
All endpoints require JWT authentication. Users can only access routines
they have created.

Models:
-------
- RoutineBase: Base model with common routine fields
- RoutineCreate: Model for routine creation with workout associations
- RoutineResponse: Full routine data with associated workouts
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy.orm import joinedload
from api.models import Routine, Workout
from api.deps import db_dependency, user_dependency

# Create router instance for routine endpoints
router = APIRouter(
    prefix="/routines",
    tags=["routines"]
)

class RoutineBase(BaseModel):
    """
    Base Pydantic model for routine data.
    
    Contains the common fields shared between different routine operations.
    
    Attributes:
        name (str): The name of the routine (required)
        description (str, optional): Detailed description of the routine purpose
    """
    name: str = Field(..., min_length=1, max_length=100, description="Name of the routine")
    description: Optional[str] = Field(None, max_length=500, description="Description of the routine")

class RoutineCreate(RoutineBase):
    """
    Pydantic model for routine creation requests.
    
    Extends RoutineBase to include workout associations for routine creation.
    
    Attributes:
        name (str): Name of the routine
        description (str, optional): Description of the routine
        workouts (List[int]): List of workout IDs to include in this routine
    """
    workouts: List[int] = Field(default=[], description="List of workout IDs to include in the routine")

class WorkoutSummary(BaseModel):
    """
    Simplified workout model for inclusion in routine responses.
    
    Attributes:
        id (int): Workout identifier
        name (str): Workout name
        description (str, optional): Workout description
    """
    id: int
    name: str
    description: Optional[str]
    
    class Config:
        from_attributes = True

class RoutineResponse(RoutineBase):
    """
    Pydantic model for routine response data.
    
    Includes the routine ID, user association, and associated workouts.
    
    Attributes:
        id (int): Unique identifier for the routine
        user_id (int): ID of the user who created the routine
        name (str): Name of the routine
        description (str, optional): Description of the routine
        workouts (List[WorkoutSummary]): List of workouts included in this routine
    """
    id: int
    user_id: int
    workouts: List[WorkoutSummary] = []
    
    class Config:
        from_attributes = True

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[RoutineResponse])
def get_routines(db: db_dependency, user: user_dependency):
    """
    Retrieve all routines for the authenticated user.
    
    Returns a list of all routines created by the current user, including
    the associated workout information loaded via joinedload for efficiency.
    
    Args:
        db: Database session dependency
        user: Authenticated user dependency
        
    Returns:
        List[RoutineResponse]: List of user's routines with associated workouts
        
    Example:
        GET /routines/
        Response: [
            {
                "id": 1,
                "name": "Morning Routine",
                "description": "Quick morning workout",
                "user_id": 1,
                "workouts": [
                    {"id": 1, "name": "Push-ups", "description": "Upper body"},
                    {"id": 2, "name": "Squats", "description": "Lower body"}
                ]
            }
        ]
    """
    routines = db.query(Routine).options(
        joinedload(Routine.workouts)
    ).filter(
        Routine.user_id == user.get('id')
    ).all()
    
    return routines

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=RoutineResponse)
def create_routine(db: db_dependency, user: user_dependency, routine: RoutineCreate):
    """
    Create a new routine for the authenticated user.
    
    Creates a new routine and associates it with the specified workouts.
    All workout IDs must exist and belong to workouts the user has access to.
    
    Args:
        db: Database session dependency
        user: Authenticated user dependency
        routine (RoutineCreate): The routine data including workout associations
        
    Returns:
        RoutineResponse: The created routine with associated workout data
        
    Raises:
        HTTPException: 404 if any specified workout is not found
        HTTPException: 403 if user doesn't have access to specified workouts
        HTTPException: 400 if routine creation fails
        
    Example:
        POST /routines/
        Request: {
            "name": "Evening Routine",
            "description": "Relaxing evening workout",
            "workouts": [1, 3, 5]
        }
    """
    try:
        # Create the routine instance
        db_routine = Routine(
            name=routine.name,
            description=routine.description,
            user_id=user.get('id')
        )
        
        # Add associated workouts
        for workout_id in routine.workouts:
            workout = db.query(Workout).filter(
                Workout.id == workout_id,
                Workout.user_id == user.get('id')  # Ensure user owns the workout
            ).first()
            
            if not workout:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail=f"Workout with ID {workout_id} not found or you don't have access to it"
                )
            
            db_routine.workouts.append(workout)
        
        # Save to database
        db.add(db_routine)
        db.commit()
        db.refresh(db_routine)
        
        # Return with loaded relationships
        created_routine = db.query(Routine).options(
            joinedload(Routine.workouts)
        ).filter(
            Routine.id == db_routine.id
        ).first()
        
        return created_routine
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create routine: {str(e)}"
        )

@router.delete("/", status_code=status.HTTP_200_OK)
def delete_routine(
    db: db_dependency, 
    user: user_dependency, 
    routine_id: int = Query(..., description="ID of the routine to delete")
):
    """
    Delete a specific routine.
    
    Removes a routine from the database. Users can only delete routines they own.
    This operation removes the routine and its associations with workouts, but
    does not delete the actual workouts.
    
    Args:
        db: Database session dependency
        user: Authenticated user dependency
        routine_id (int): The ID of the routine to delete
        
    Returns:
        dict: Success message confirming deletion
        
    Raises:
        HTTPException: 404 if routine not found or user doesn't own it
        HTTPException: 400 if deletion fails
        
    Example:
        DELETE /routines/?routine_id=1
        Response: {"message": "Routine deleted successfully"}
    """
    # Find routine with user ownership validation
    db_routine = db.query(Routine).filter(
        Routine.id == routine_id,
        Routine.user_id == user.get('id')
    ).first()
    
    if not db_routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Routine not found or you don't have permission to delete it"
        )
    
    try:
        db.delete(db_routine)
        db.commit()
        return {"message": "Routine deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete routine: {str(e)}"
        )
