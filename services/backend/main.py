from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import logs
from app.database import get_database
import asyncio

app = FastAPI(
    title="Log Dashboard API",
    description="A FastAPI application for managing logs with Prisma ORM",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(logs.router, prefix="/api/v1", tags=["logs"])

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
