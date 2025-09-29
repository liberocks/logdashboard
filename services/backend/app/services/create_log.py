from app.models.log_models import LogModel, SeverityLevel
from prisma import Prisma
from pydantic import BaseModel, Field
from uuid_utils import uuid7


class CreateLogPayload(BaseModel):
    severity: SeverityLevel
    message: str = Field(..., max_length=1024)
    source: str = Field(..., max_length=256)


class CreateLogResponse(LogModel):
    status_code: int


async def create_log_svc(log: CreateLogPayload, db: Prisma) -> CreateLogResponse:
    """
    Service to create a new log entry
    """

    created_log = await db.log.create(
        data={
            "id": str(uuid7()),
            "severity": log.severity,
            "message": log.message,
            "source": log.source,
        }
    )

    return CreateLogResponse(
        id=created_log.id,
        severity=created_log.severity,
        message=created_log.message,
        source=created_log.source,
        timestamp=created_log.timestamp,
        status_code=201,
    )
