import asyncio
from datetime import datetime
from typing import Any, Optional

from app.models.log_models import SeverityLevel
from prisma import Prisma
from pydantic import BaseModel, Field


class GetAggregatedLogsParameter(BaseModel):
    severity: Optional[SeverityLevel] = None
    source: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(100, gte=1, lt=1001)
    offset: int = Field(0, gte=0)


class GetAggregatedLogsResponse(BaseModel):
    status_code: int
    severity_counts: dict[SeverityLevel, int]
    source_counts: dict[str, int]
    total_logs: int


def _get_entry_value(entry: Any, key: str) -> Any:
    if isinstance(entry, dict):
        return entry.get(key)
    return getattr(entry, key, None)


def _extract_total_count(count_value: Any) -> int:
    if count_value is None:
        return 0
    if isinstance(count_value, int):
        return count_value
    if isinstance(count_value, dict):
        total = count_value.get("_all")
        if isinstance(total, int):
            return total
        return sum(value for value in count_value.values() if isinstance(value, int))

    total_attr = getattr(count_value, "_all", None)
    if isinstance(total_attr, int):
        return total_attr

    if hasattr(count_value, "dict"):
        maybe_dict = count_value.dict()
        if isinstance(maybe_dict, dict):
            total = maybe_dict.get("_all")
            if isinstance(total, int):
                return total
            return sum(value for value in maybe_dict.values() if isinstance(value, int))

    return 0


async def get_aggregated_logs_svc(
    parameter: GetAggregatedLogsParameter, db: Prisma
) -> GetAggregatedLogsResponse:
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

    total_logs, severities, sources = await asyncio.gather(
        db.log.count(where=filters),
        db.log.group_by(
            by=["severity"],
            where=filters,
            count=True,
        ),
        db.log.group_by(
            by=["source"],
            where=filters,
            count=True,
        ),
    )

    severity_counts = {}
    for entry in severities:
        severity_value = _get_entry_value(entry, "severity")
        if severity_value is None:
            continue
        try:
            severity_key = SeverityLevel(severity_value)
        except ValueError:
            continue

        count_value = _extract_total_count(_get_entry_value(entry, "_count"))
        severity_counts[severity_key] = count_value

    source_counts = {}
    for entry in sources:
        source_value = _get_entry_value(entry, "source")
        if source_value is None:
            continue
        count_value = _extract_total_count(_get_entry_value(entry, "_count"))
        source_counts[source_value] = count_value

    return GetAggregatedLogsResponse(
        status_code=200,
        severity_counts=severity_counts,
        source_counts=source_counts,
        total_logs=total_logs,
    )
