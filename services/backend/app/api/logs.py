import csv
from io import StringIO

from app.database import get_database
from app.services.create_log import CreateLogPayload, CreateLogResponse, create_log_svc
from app.services.delete_log import delete_log_svc
from app.services.generate_logs import (
    GenerateLogsPayload,
    GenerateLogsResponse,
    generate_logs_svc,
)
from app.services.get_aggregated_logs import (
    GetAggregatedLogsResponse,
    get_aggregated_logs_svc,
)
from app.services.get_log import GetLogResponse, get_log_svc
from app.services.get_logs import GetLogsParameter, GetLogsResponse, get_logs_svc
from app.services.update_log import UpdateLogResponse, update_log_svc
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
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
    sort_by: str = "timestamp",
    sort_order: str = "desc",
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
        sort_by=sort_by,
        sort_order=sort_order,
    )

    try:
        return await get_logs_svc(parameter, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/aggregated", response_model=GetAggregatedLogsResponse)
async def get_aggreagated_logs(
    severity: str | None = None,
    source: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Prisma = Depends(get_database),
):
    """
    Get aggregated log entries based on filters
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
        return await get_aggregated_logs_svc(parameter, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download")
async def download_logs(
    severity: str | None = None,
    source: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 10000,
    offset: int = 0,
    sort_by: str = "timestamp",
    sort_order: str = "desc",
    db: Prisma = Depends(get_database),
):
    """
    Download log entries based on filters
    """

    parameter = GetLogsParameter(
        severity=severity,
        source=source,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    try:
        logs_response = await get_logs_svc(parameter, db)

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "severity", "message", "source", "timestamp"])
        for log in logs_response.logs:
            writer.writerow(
                [log.id, log.severity, log.message, log.source, log.timestamp]
            )

        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=logs.csv"},
        )
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


@router.post("", response_model=CreateLogResponse)
async def create_log(payload: CreateLogPayload, db: Prisma = Depends(get_database)):
    """
    Create a new log entry
    """

    try:
        return await create_log_svc(payload, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{log_id}", response_model=GetLogResponse)
async def get_log(log_id: str, db: Prisma = Depends(get_database)):
    """
    Get a log entry by ID
    """

    try:
        log = await get_log_svc(log_id, db)
        if not log:
            raise HTTPException(status_code=404, detail="Log not found")
        return log
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{log_id}", response_model=UpdateLogResponse)
async def update_log(
    log_id: str, payload: CreateLogPayload, db: Prisma = Depends(get_database)
):
    """
    Update an existing log entry by ID
    """

    try:
        return await update_log_svc(log_id, payload, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{log_id}", status_code=204)
async def delete_log(log_id: str, db: Prisma = Depends(get_database)):
    """
    Delete a log entry by ID
    """

    try:
        await delete_log_svc(log_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
