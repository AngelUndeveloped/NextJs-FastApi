# NextJs-FastApi

A full-stack application built with Next.js and FastAPI to demonstrate modern web development concepts.

## Project Overview

This project demonstrates the integration of a FastAPI backend with a Next.js frontend, showcasing:
- RESTful API development with FastAPI
- Database integration using SQLAlchemy ORM
- CORS configuration for frontend-backend communication
- Modern web development practices

## Project Structure

```
.
├── fastapi/                 # Backend API built with FastAPI
│   ├── api/                # Main API implementation
│   │   ├── main.py        # FastAPI application setup and endpoints
│   │   └── database.py    # SQLAlchemy database configuration
│   ├── learning_guide/    # Learning resources and examples
│   └── requirements.txt   # Python dependencies
└── README.md              # Project documentation
```

## Features

- FastAPI backend with SQLite database
- CORS configuration for Next.js frontend integration
- Basic API endpoints for health check and example responses
- SQLAlchemy ORM integration for database operations
- Environment variable management with python-dotenv

## Development Setup

1. Backend (FastAPI):
   ```bash
   # Navigate to the FastAPI directory
   cd fastapi

   # Create and activate virtual environment
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Run the development server
   uvicorn api.main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   - API documentation: `http://localhost:8000/docs`
   - Alternative API documentation: `http://localhost:8000/redoc`

2. Frontend (Next.js):
   ```bash
   # Coming soon
   ```

## API Endpoints

### Health Check
- `GET /`
  - Purpose: Verify API is running
  - Response: `{"status": "ok"}`

### Example Endpoint
- `GET /hello`
  - Purpose: Example endpoint returning a greeting
  - Response: `{"message": "Hello, World!"}`

## Database

The project uses SQLite with SQLAlchemy ORM:
- Database file: `workout_app.db`
- Configuration: `fastapi/api/database.py`
- Session management: Uses dependency injection for database sessions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the terms of the license included in the repository.
