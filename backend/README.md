# FastAPI Backend

A production-ready FastAPI backend with MongoDB integration.

## Project Structure

```
backend/
├── app/
│   ├── models/           # Pydantic models for data validation
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   └── __init__.py
├── main.py              # Application entry point
├── config.py            # Configuration settings
├── database.py          # MongoDB connection
├── requirements.txt     # Python dependencies
├── .env.example         # Example environment variables
└── README.md
```

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

### 3. Run the Server
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### 4. API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure Overview

### `/app/models/`
Contains Pydantic models for data validation and serialization.
- `user.py` - User data models

### `/app/routes/`
Contains API endpoint definitions organized by resource.
- `health.py` - Health check endpoints
- `users.py` - User CRUD operations

### `/app/services/`
Contains business logic and database operations.
- `user_service.py` - User service implementation

### `config.py`
Application configuration loaded from environment variables.

### `database.py`
MongoDB connection management and utilities.

### `main.py`
FastAPI application initialization and router registration.

## Adding New Features

### 1. Create a Model
Create a new file in `app/models/` with your Pydantic models.

### 2. Create a Service
Create a new file in `app/services/` to handle database operations.

### 3. Create Routes
Create a new file in `app/routes/` to define API endpoints.

### 4. Register the Router
Import and include the router in `main.py`:
```python
from app.routes import my_routes
app.include_router(my_routes.router)
```

## MongoDB Connection
The application uses Motor (async MongoDB driver) for MongoDB connections. Connection details are configured in `.env` file.

## Dependencies
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **python-dotenv** - Environment variable management
