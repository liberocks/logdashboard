from app.database import get_database
from app.services.create_log import CreateLogPayload, CreateLogResponse, create_log_svc
from app.services.generate_logs import (
    GenerateLogsPayload,
    GenerateLogsResponse,
    generate_logs_svc,
)
from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma

router = APIRouter()


@router.post("", response_model=CreateLogResponse)
async def create_log(payload: CreateLogPayload, db: Prisma = Depends(get_database)):
    """
    Create a new log entry
    """

    try:
        return await create_log_svc(payload, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate", response_model=GenerateLogsResponse)
async def generate_log(
    payload: GenerateLogsPayload, db: Prisma = Depends(get_database)
):
    """
    Generate random log entries
    """

    try:
        return await generate_logs_svc(payload, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
