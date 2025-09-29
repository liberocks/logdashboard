from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class Log(BaseModel):
    id: str
    severity: str
    message: str
    source: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime
