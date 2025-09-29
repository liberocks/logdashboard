from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_database
import os

app = FastAPI(
    title="Log Dashboard API",
    description="An API for managing logs",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Log Dashboard API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is operational"}


@app.on_event("startup")
async def startup():
    """Initialize database connection on startup"""
    await get_database()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
