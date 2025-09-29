from app.database import get_database
from app.services.create_log import CreateLogPayload, CreateLogResponse, create_log_svc
from app.services.generate_logs import (
    GenerateLogsPayload,
    GenerateLogsResponse,
    generate_logs_svc,
)
from app.services.get_logs import GetLogsParameter, GetLogsResponse, get_logs_svc
from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma

router = APIRouter()


@router.get("", response_model=GetLogsResponse)
async def get_logs(
    severity: str | None = None,
    source: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Prisma = Depends(get_database),
):
    """
    Get log entries based on filters
    """

    parameter = GetLogsParameter(
        severity=severity,
        source=source,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )

    try:
        return await get_logs_svc(parameter, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
