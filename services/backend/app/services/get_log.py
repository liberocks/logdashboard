from app.models.log_models import LogModel
from prisma import Prisma


class GetLogResponse(LogModel):
    pass


async def get_log_svc(log_id: str, db: Prisma) -> None:
    """
    Service to get a log entry by ID
    """

    log = await db.log.find_unique(where={"id": log_id})

    if not log:
        return None

    return GetLogResponse(
        id=log.id,
        severity=log.severity,
        message=log.message,
        source=log.source,
        timestamp=log.timestamp,
    )
