"""
Database Infrastructure Package.
Provides client connection pool, context managers, and health checks.
"""
from app.infrastructure.database.client import (
    db_pool,
    get_db_connection,
    get_db_cursor,
    execute_query,
    execute_statement,
)
from app.infrastructure.database.health import check_database_connection

__all__ = [
    "db_pool",
    "get_db_connection",
    "get_db_cursor",
    "execute_query",
    "execute_statement",
    "check_database_connection",
]
