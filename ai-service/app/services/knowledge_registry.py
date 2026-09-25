#!/usr/bin/env python3
"""
Premier Jharkhand University Knowledge Registry (app/services/knowledge_registry.py).

Fetches academic institution data directly from the `university_embaddings`
PostgreSQL table — no hardcoded dictionaries.

Returns an empty list when the database is unreachable so callers can fall
through to the next retrieval mode (local vector index, etc.).
"""

import json
import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)



def get_chunks_from_registry(
    domain: str,
    district: str = "Jharkhand",
    top_k: int = 25,
) -> List[Dict[str, Any]]:
    """
    Fetch candidate chunks from the ``university_embaddings`` database table,
    optionally narrowed by domain and district context.

    Returns a list of chunk dicts in the standard shape expected by the
    pgvector_retriever pipeline::

        {
            "chunk_id":         str,
            "university_code":  str,
            "university_name":  str,
            "entity_type":      str,
            "chunk_text":       str,
            "metadata":         dict,
            "similarity_score": float,
        }

    Returns an empty list if the database is unreachable or the table has no
    rows, so the caller can fall through to the next retrieval mode.
    """
    domain_upper = (domain or "").upper().replace(" & ", "_").replace(" ", "_").strip()
    district_lower = (district or "").lower().strip()

    try:
        from app.infrastructure.database.client import get_db_cursor  # type: ignore

        with get_db_cursor(dict_cursor=True) as cur:
            # ------------------------------------------------------------------
            # Strategy 1: domain + district aware query from Supabase
            # ------------------------------------------------------------------
            try:
                cur.execute(
                    """
                    SELECT
                        ue.id            AS chunk_id,
                        u.code           AS university_code,
                        u.name           AS university_name,
                        ue.entity_type,
                        ue.chunk_text,
                        ue.metadata,
                        0.92             AS similarity_score
                    FROM university_embeddings ue
                    JOIN universities u ON u.id = ue.university_id
                    WHERE
                        (%s = ''
                            OR ue.chunk_text ILIKE '%%' || %s || '%%'
                            OR ue.metadata::text ILIKE '%%' || %s || '%%')
                        AND
                        (%s = ''
                            OR ue.chunk_text ILIKE '%%' || %s || '%%'
                            OR u.name ILIKE '%%' || %s || '%%'
                            OR ue.metadata::text ILIKE '%%' || %s || '%%')
                    LIMIT %s;
                    """,
                    (
                        domain_upper, domain_upper, domain_upper,
                        district_lower, district_lower, district_lower, district_lower,
                        top_k,
                    ),
                )
                rows = cur.fetchall()
                if rows:
                    chunks = _rows_to_chunks(rows)
                    logger.info(
                        "knowledge_registry: fetched %d chunks from Supabase "
                        "(domain=%s, district=%s).",
                        len(chunks), domain_upper, district_lower,
                    )
                    return chunks
            except Exception as e_filtered:
                logger.debug(
                    "knowledge_registry: filtered query failed (%s), "
                    "trying unfiltered fallback.", e_filtered
                )

            # ------------------------------------------------------------------
            # Strategy 2: unfiltered — return top rows from university_embeddings
            # ------------------------------------------------------------------
            cur.execute(
                """
                SELECT
                    ue.id            AS chunk_id,
                    u.code           AS university_code,
                    u.name           AS university_name,
                    ue.entity_type,
                    ue.chunk_text,
                    ue.metadata,
                    0.88             AS similarity_score
                FROM university_embeddings ue
                JOIN universities u ON u.id = ue.university_id
                LIMIT %s;
                """,
                (top_k,),
            )
            rows = cur.fetchall()
            if rows:
                chunks = _rows_to_chunks(rows)
                logger.info(
                    "knowledge_registry: fetched %d chunks from Supabase (unfiltered).",
                    len(chunks),
                )
                return chunks

    except Exception as e:
        logger.warning(
            "knowledge_registry: Supabase database unavailable (%s); returning empty list.", e
        )

    return []


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _rows_to_chunks(rows) -> List[Dict[str, Any]]:
    """Convert raw DB rows (dict-cursor) to the standard chunk shape."""
    chunks = []
    for r in rows:
        raw_meta = r.get("metadata") or {}
        if isinstance(raw_meta, str):
            try:
                raw_meta = json.loads(raw_meta)
            except Exception:
                raw_meta = {}

        chunks.append(
            {
                "chunk_id": str(r["chunk_id"]),
                "university_code": r.get("university_code") or "",
                "university_name": r.get("university_name") or "",
                "entity_type": r.get("entity_type") or "UNKNOWN",
                "chunk_text": r.get("chunk_text") or "",
                "metadata": raw_meta,
                "similarity_score": float(r.get("similarity_score") or 0.88),
            }
        )
    return chunks
