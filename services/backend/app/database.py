from prisma import Prisma
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Global prisma instance
db = Prisma()

async def get_database() -> Prisma:
    """Get database connection"""
    if not db.is_connected():
        await db.connect()
    return db

async def disconnect_database():
    """Disconnect from database"""
    if db.is_connected():
        await db.disconnect()

async def init_database():
    """Initialize database connection for testing or manual use"""
    await db.connect()
    return db