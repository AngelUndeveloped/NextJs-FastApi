# NextJs-FastApi

A full-stack application built with Next.js and FastAPI to demonstrate modern web development concepts.

## Project Structure

- `fastapi/` - Backend API built with FastAPI
  - `api/` - Main API implementation
    - `main.py` - FastAPI application setup and endpoints
    - `database.py` - SQLAlchemy database configuration
  - `learning_guide/` - Learning resources and examples

## Features

- FastAPI backend with SQLite database
- CORS configuration for Next.js frontend integration
- Basic API endpoints for health check and example responses
- SQLAlchemy ORM integration for database operations

## Development Setup

1. Backend (FastAPI):
   ```bash
   cd fastapi
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn api.main:app --reload
   ```

2. Frontend (Next.js):
   ```bash
   # Coming soon
   ```

## API Endpoints

- `GET /` - Health check endpoint
- `GET /hello` - Example endpoint returning a greeting message
