"""
FastAPI + NextJS Integration Project
This is the main FastAPI application file that sets up the backend server and defines API endpoints.
The application is designed to work with a NextJS frontend running on localhost:3000.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI application with metadata
app = FastAPI(title="FastAPI + NextJS", description="FastAPI + NextJS practice project")

# Configure CORS middleware to allow requests from the NextJS frontend
# This is essential for local development where frontend and backend run on different ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # NextJS development server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Health check endpoint to verify the API is running
@app.get("/")
def health_check():
    return {"status": "ok"}

# Example endpoint that returns a greeting message
@app.get("/hello")
def hello():
    return {"message": "Hello, World!"}