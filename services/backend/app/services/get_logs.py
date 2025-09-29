import asyncio
from datetime import datetime
from typing import Optional

from app.models.log_models import LogModel, SeverityLevel
from prisma import Prisma
from pydantic import BaseModel, Field


class GetLogsParameter(BaseModel):
    severity: Optional[SeverityLevel] = None
    source: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(100, gte=1, lt=999999)
    offset: int = Field(0, gte=0)
    sort_by: str = "timestamp"
    sort_order: str = "desc"


class GetLogsResponse(BaseModel):
    status_code: int
    logs: list[LogModel]
    total: int
    total_pages: int


async def get_logs_svc(parameter: GetLogsParameter, db: Prisma) -> GetLogsResponse:
    """
    Service to get log entries based on filters
    """

    filters = {}

    if parameter.severity:
        filters["severity"] = parameter.severity
    if parameter.source:
        filters["source"] = parameter.source
    if parameter.start_date and parameter.end_date:
        filters["timestamp"] = {
            "gte": parameter.start_date,
            "lte": parameter.end_date,
        }
    elif parameter.start_date:
        filters["timestamp"] = {"gte": parameter.start_date}
    elif parameter.end_date:
        filters["timestamp"] = {"lte": parameter.end_date}

    if parameter.sort_by not in {"timestamp", "severity", "source"}:
        parameter.sort_by = "timestamp"
    if parameter.sort_order not in {"asc", "desc"}:
        parameter.sort_order = "desc"

    # Run count and find_many queries in parallel for better performance
    total_count, logs = await asyncio.gather(
        db.log.count(where=filters),
        db.log.find_many(
            where=filters,
            order={parameter.sort_by: parameter.sort_order},
            skip=parameter.offset,
            take=parameter.limit,
        ),
    )

    # Calculate total pages
    total_pages = (total_count + parameter.limit - 1) // parameter.limit

    log_list = [
        LogModel(
            id=log.id,
            severity=log.severity,
            message=log.message,
            source=log.source,
            timestamp=log.timestamp,
        )
        for log in logs
    ]

    return GetLogsResponse(
        logs=log_list, status_code=200, total=total_count, total_pages=total_pages
    )
