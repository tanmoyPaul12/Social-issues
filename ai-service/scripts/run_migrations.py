#!/usr/bin/env python3
"""
Database Migration Runner for Supabase PostgreSQL.
Executes all SQL migration files in `database/migrations/` in sequence.
"""
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app.infrastructure.database.client import get_db_cursor
from app.utils.logger import logger

MIGRATIONS_DIR = ROOT_DIR / "database" / "migrations"

def run_migrations():
    print("=" * 80)
    print("🚀 RUNNING DATABASE MIGRATIONS ON POSTGRESQL / SUPABASE")
    print("=" * 80)

    sql_files = sorted(list(MIGRATIONS_DIR.glob("*.sql")))
    if not sql_files:
        print("No SQL migration files found.")
        return

    with get_db_cursor(commit=True, dict_cursor=False) as cur:
        for sql_file in sql_files:
            print(f"   • Executing migration: {sql_file.name}...")
            sql_content = sql_file.read_text(encoding="utf-8")
            cur.execute(sql_content)
            print(f"     ✅ {sql_file.name} applied successfully.")

    print("=" * 80)
    print("🎉 ALL MIGRATIONS APPLIED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_migrations()
