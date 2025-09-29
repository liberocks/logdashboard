from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class SeverityLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"
    FATAL = "FATAL"


class LogModel(BaseModel):
    id: str
    severity: SeverityLevel
    message: str
    source: str
    timestamp: datetime
