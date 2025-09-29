from prisma import Prisma


async def delete_log_svc(log_id: str, db: Prisma) -> None:
    """
    Service to delete a log entry by ID
    """

    await db.log.delete(where={"id": log_id})
