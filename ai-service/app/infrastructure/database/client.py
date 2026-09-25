#!/usr/bin/env python3
"""
Supabase PostgreSQL Database Client (`app/infrastructure/database/client.py`).

Provides context-managed database connections, cursors, execute_query, and execute_statement helpers.
"""

import os
import logging
from contextlib import contextmanager
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

logger = logging.getLogger(__name__)

# Fallback stub for legacy db_pool references
db_pool = None


def get_db_url() -> str:
    db_url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        user = os.getenv("POSTGRES_USER", "postgres.twdhxcuxxznfqvqhtdmk")
        password = os.getenv("POSTGRES_PASSWORD", "39i9?+fED6gwv!F")
        host = os.getenv("POSTGRES_HOST", "db.twdhxcuxxznfqvqhtdmk.supabase.co")
        port = os.getenv("POSTGRES_PORT", "5432")
        dbname = os.getenv("POSTGRES_DB", "postgres")
        db_url = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
    return db_url


@contextmanager
def get_db_connection(commit=False):
    """Context manager for raw psycopg2 database connection."""
    conn = psycopg2.connect(get_db_url())
    try:
        yield conn
        if commit:
            conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database connection transaction failed: {e}")
        raise e
    finally:
        conn.close()


@contextmanager
def get_db_cursor(commit=False, dict_cursor=True):
    """
    Context manager for database cursor.
    Handles automatic connection creation, commit/rollback, and resource cleanup.
    """
    cursor_factory = RealDictCursor if dict_cursor else None
    conn = psycopg2.connect(get_db_url())
    try:
        cur = conn.cursor(cursor_factory=cursor_factory)
        yield cur
        if commit:
            conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database cursor transaction failed: {e}")
        raise e
    finally:
        conn.close()


def execute_query(query: str, params: tuple = (), fetch: bool = True, dict_cursor: bool = True):
    """Executes a SQL query directly against Supabase database."""
    with get_db_cursor(commit=not fetch, dict_cursor=dict_cursor) as cur:
        cur.execute(query, params)
        if fetch:
            return cur.fetchall()
        return None


def execute_statement(statement: str, params: tuple = ()):
    """Executes a DDL/DML SQL statement with auto-commit."""
    with get_db_cursor(commit=True, dict_cursor=False) as cur:
        cur.execute(statement, params)
        return True
