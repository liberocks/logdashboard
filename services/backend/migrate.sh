#!/bin/bash
# Migration script for Log Dashboard
# Runs Prisma migrations with basic error handling

set -e

echo "Running database migrations..."

# Wait for database to be ready
echo "Waiting for database connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if uv run python -c "import psycopg2; psycopg2.connect('$DATABASE_URL')" > /dev/null 2>&1; then
        echo "Database is ready"
        break
    fi

    echo "Attempt $attempt/$max_attempts - waiting for database..."
    sleep 2
    ((attempt++))

    if [ $attempt -gt $max_attempts ]; then
        echo "Failed to connect to database"
        exit 1
    fi
done

# Generate Prisma client
echo "Generating Prisma client..."
uv run prisma generate

# Run migrations
echo "Running Prisma migrations..."
uv run prisma migrate deploy

echo "Migration completed successfully!"
