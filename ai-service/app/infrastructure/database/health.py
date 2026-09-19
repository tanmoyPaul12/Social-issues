"""
Database Health Check Module for Supabase PostgreSQL & pgvector.
Verifies connection integrity, extension presence, and table availability.
"""
import time
from typing import Dict, Any, List
from app.infrastructure.database.client import get_db_cursor
from app.utils.logger import logger

REQUIRED_ROUTING_TABLES: List[str] = [
    "universities",
    "departments",
    "faculty",
    "research_centres",
    "facilities",
    "innovation_centres",
    "incubation_centres",
    "expertise_taxonomy",
    "evidence_claims"
]


def check_database_connection() -> Dict[str, Any]:
    """
    Performs comprehensive health check on Supabase PostgreSQL:
    1. Basic connectivity and latency
    2. Server version
    3. pgvector extension verification
    4. Routing tables existence check
    """
    start_time = time.time()
    result: Dict[str, Any] = {
        "status": "unhealthy",
        "database": "PostgreSQL",
        "latency_ms": 0.0,
        "server_version": None,
        "pgvector_installed": False,
        "pgvector_version": None,
        "tables_status": {},
        "all_required_tables_present": False,
        "error": None
    }

    try:
        with get_db_cursor(commit=False, dict_cursor=True) as cur:
            # 1. Ping & Server Version
            cur.execute("SELECT version();")
            ver_row = cur.fetchone()
            result["server_version"] = ver_row["version"] if ver_row else "Unknown"

            # 2. Check pgvector extension
            cur.execute("""
                SELECT extname, extversion 
                FROM pg_extension 
                WHERE extname = 'vector';
            """)
            ext_row = cur.fetchone()
            if ext_row:
                result["pgvector_installed"] = True
                result["pgvector_version"] = ext_row["extversion"]

            # 3. Check Routing Foundation Tables
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                  AND table_name = ANY(%s);
            """, (REQUIRED_ROUTING_TABLES,))
            existing_tables = {row["table_name"] for row in cur.fetchall()}

            tables_status = {}
            for tbl in REQUIRED_ROUTING_TABLES:
                tables_status[tbl] = tbl in existing_tables

            result["tables_status"] = tables_status
            result["all_required_tables_present"] = len(existing_tables) == len(REQUIRED_ROUTING_TABLES)

            # Mark healthy if connection and required tables are intact
            if result["pgvector_installed"] and result["all_required_tables_present"]:
                result["status"] = "healthy"
            else:
                result["status"] = "degraded"

    except Exception as e:
        logger.error("Database health check failed: {}", e)
        result["status"] = "unhealthy"
        result["error"] = str(e)

    result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
    return result
