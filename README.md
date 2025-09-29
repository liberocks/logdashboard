# Log Dashboard

## Getting Started

## Running database migrations
Make sure you have Prisma CLI installed. You can run the following command to apply migrations:

```bash
cd services/backend
uv run prisma migrate dev
```

## Starting the backend server
Navigate to the `services/backend` directory and run the following command:
```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Create Log Entry
To create a log entry, you can use the following API endpoint using a tool like `curl` or Postman:

```bash
curl -X POST "http://localhost:8000/api/v1/logs" -H "Content-Type: application/json" -d '{
    "timestamp": "2023-10-01T12:00:00Z",
    "severity": "INFO",
    "message": "This is a test log message",
    "source": "test-service"
}'
```

## Generate Random Logs
To generate random log entries, you can use the following API endpoint:
```bash
curl -X POST "http://localhost:8000/api/v1/logs/generate" -H "Content-Type: application/json" -d '{
    "count": 10,
    "days_back": 7
}'
```
