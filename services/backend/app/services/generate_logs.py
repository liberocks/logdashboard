import random
from datetime import datetime, timedelta
from typing import Any, Dict

from prisma import Prisma
from pydantic import BaseModel, Field
from uuid_utils import uuid7


class GenerateLogsPayload(BaseModel):
    count: int = Field(..., gte=10, lt=1001)
    days_back: int = Field(..., gte=0, lt=366)


class GenerateLogsResponse(BaseModel):
    count: int
    status_code: int


# Sample data for generating random logs
LOG_SEVERITIES = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]

LOG_SOURCES = [
    "user-service",
    "auth-service",
    "payment-service",
    "notification-service",
    "api-gateway",
    "database",
    "cache-service",
    "file-service",
    "email-service",
    "analytics-service",
]

LOG_MESSAGES = {
    "DEBUG": [
        "Database query executed successfully",
        "Cache hit for user session",
        "Request validation completed",
        "Configuration loaded from environment",
        "Background job started",
        "Memory usage within normal range",
        "Connection pool status checked",
    ],
    "INFO": [
        "User login successful",
        "Payment processed successfully",
        "Email notification sent",
        "File uploaded successfully",
        "User account created",
        "Password reset requested",
        "API request completed",
        "Data backup completed",
        "Report generated successfully",
    ],
    "WARN": [
        "High memory usage detected",
        "Slow database query detected",
        "Rate limit threshold approaching",
        "Disk space running low",
        "Connection timeout occurred",
        "Invalid request parameter ignored",
        "Cache miss rate high",
        "Deprecated API endpoint used",
    ],
    "ERROR": [
        "Database connection failed",
        "Payment processing failed",
        "Email delivery failed",
        "File upload failed",
        "Authentication failed",
        "Invalid user credentials",
        "API request timeout",
        "Data validation error",
        "External service unavailable",
    ],
    "FATAL": [
        "Database server crashed",
        "Out of memory error",
        "Critical security breach detected",
        "Application startup failed",
        "Data corruption detected",
        "System disk full",
        "Unable to connect to essential services",
    ],
}

SAMPLE_METADATA = [
    {"user_id": "user_123", "ip_address": "192.168.1.100", "browser": "Chrome"},
    {"user_id": "user_456", "ip_address": "10.0.0.50", "browser": "Firefox"},
    {"transaction_id": "txn_789", "amount": 99.99, "currency": "USD"},
    {"request_id": "req_abc123", "endpoint": "/api/users", "method": "GET"},
    {"file_name": "document.pdf", "file_size": 1024000, "upload_time": 2.5},
    {"query": "SELECT * FROM users", "execution_time": 150, "rows_affected": 25},
    {"email": "user@example.com", "template": "welcome", "delivery_status": "sent"},
    {"process_id": "proc_xyz", "memory_usage": 512, "cpu_usage": 15.5},
    {"cache_key": "user_session_123", "ttl": 3600, "hit_rate": 0.85},
    {"backup_size": 2048000000, "compression_ratio": 0.7, "duration": 300},
]


def generate_random_timestamp(days_back: int) -> datetime:
    """Generate a random timestamp within the specified number of days back"""
    now = datetime.now()
    start_time = now - timedelta(days=days_back)
    time_between = now - start_time
    random_seconds = random.randrange(int(time_between.total_seconds()))
    return start_time + timedelta(seconds=random_seconds)


def generate_random_log_data(days_back: int = 7) -> Dict[str, Any]:
    """Generate random log data"""
    severity = random.choice(LOG_SEVERITIES)
    source = random.choice(LOG_SOURCES)
    message = random.choice(LOG_MESSAGES[severity])

    return {
        "id": str(uuid7()),
        "severity": severity,
        "message": message,
        "source": source,
        "timestamp": generate_random_timestamp(days_back),
    }


async def generate_logs_svc(
    payload: GenerateLogsPayload, db: Prisma
) -> GenerateLogsResponse:
    """
    Service to generate random log entries
    """

    generated_logs = []
    for _ in range(payload.count):
        log_data = generate_random_log_data(payload.days_back)

        generated_logs.append(log_data)

    await db.log.create_many(data=generated_logs)

    return GenerateLogsResponse(count=payload.count, status_code=201)
