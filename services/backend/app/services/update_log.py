from app.models.log_models import LogModel, SeverityLevel
from prisma import Prisma
from pydantic import BaseModel, Field


class UpdateLogPayload(BaseModel):
    severity: SeverityLevel
    message: str = Field(..., max_length=1024)
    source: str = Field(..., max_length=256)


class UpdateLogResponse(LogModel):
    status_code: int


async def update_log_svc(
    log_id: str, log: UpdateLogPayload, db: Prisma
) -> UpdateLogResponse:
    """
    Service to update an existing log entry by ID
    """

    updated_log = await db.log.update(
        where={"id": log_id},
        data={
            "severity": log.severity,
            "message": log.message,
            "source": log.source,
        },
    )

    return UpdateLogResponse(
        id=updated_log.id,
        severity=updated_log.severity,
        message=updated_log.message,
        source=updated_log.source,
        timestamp=updated_log.timestamp,
        status_code=200,
    )
