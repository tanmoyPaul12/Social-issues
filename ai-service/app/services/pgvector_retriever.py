#!/usr/bin/env python3
"""
PGVector Hybrid Retrieval Engine (`app/services/pgvector_retriever.py`).

Retrieves candidate university vector chunks from Supabase PostgreSQL `university_embeddings` table.
Falls back seamlessly to local vector index (`structured_kb/rich_vector_embeddings_index.json`) if offline.
"""

import os
import sys
import json
import math
import logging
from pathlib import Path
from typing import Dict, Any, List
from sentence_transformers import SentenceTransformer
from app.agents.requirement_extractor import ExtractedChallengeRequirements

logger = logging.getLogger(__name__)

# Global lazy-loaded embedding model
_EMBED_MODEL = None


def get_embedding_model():
    global _EMBED_MODEL
    if _EMBED_MODEL is None:
        logger.info("Loading local embedding model 'intfloat/multilingual-e5-small'...")
        _EMBED_MODEL = SentenceTransformer("intfloat/multilingual-e5-small")
    return _EMBED_MODEL


def cosine_similarity(v1: list, v2: list) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    return dot / (norm1 * norm2) if norm1 and norm2 else 0.0


def retrieve_candidate_chunks(requirements: ExtractedChallengeRequirements, top_k: int = 25) -> List[Dict[str, Any]]:
    """
    Computes query vector from extracted challenge requirements and retrieves top-k matching
    chunks from Supabase PostgreSQL `university_embeddings` using PGVector cosine similarity.
    Fallback: Uses local vector index if database is unreachable.
    """
    model = get_embedding_model()
    
    # Construct dense query text
    query_parts = [
        f"Domain: {requirements.domain}",
        f"Problem: {requirements.problem_summary}",
        f"Disciplines: {', '.join(requirements.required_disciplines)}",
        f"Keywords: {', '.join(requirements.expertise_keywords)}",
        f"Capabilities: {', '.join(requirements.required_capabilities)}"
    ]
    query_text = " | ".join(query_parts)
    
    # Prefix 'query: ' for e5 embeddings
    query_vec = model.encode(f"query: {query_text}", normalize_embeddings=True).tolist()
    vec_str = f"[{','.join(str(x) for x in query_vec)}]"

    # Mode 1: Supabase PGVector Database Query
    try:
        from app.infrastructure.database.client import get_db_cursor

        with get_db_cursor(dict_cursor=True) as cur:
            cur.execute(
                """
                SELECT 
                    ue.id AS chunk_id,
                    u.code AS university_code,
                    u.name AS university_name,
                    ue.entity_type,
                    ue.chunk_text,
                    ue.metadata,
                    1 - (ue.embedding <=> %s::vector) AS similarity_score
                FROM university_embeddings ue
                JOIN universities u ON u.id = ue.university_id
                ORDER BY ue.embedding <=> %s::vector ASC
                LIMIT %s;
                """,
                (vec_str, vec_str, top_k)
            )
            rows = cur.fetchall()
            if rows:
                results = []
                for r in rows:
                    results.append({
                        "chunk_id": str(r["chunk_id"]),
                        "university_code": r["university_code"],
                        "university_name": r["university_name"],
                        "entity_type": r["entity_type"],
                        "chunk_text": r["chunk_text"],
                        "metadata": r["metadata"] if isinstance(r["metadata"], dict) else json.loads(r["metadata"]),
                        "similarity_score": float(r["similarity_score"])
                    })
                logger.info(f"Successfully retrieved {len(results)} chunks from Supabase PGVector.")
                return results

    except Exception as e:
        logger.warning(f"Supabase PGVector query failed, switching to local vector index fallback: {e}")

    # Mode 2: Local Vector Index Fallback
    local_index_path = Path(__file__).resolve().parent.parent.parent / "structured_kb" / "rich_vector_embeddings_index.json"
    if local_index_path.exists():
        try:
            records = json.loads(local_index_path.read_text(encoding="utf-8"))
            scored_results = []
            for rec in records:
                score = cosine_similarity(query_vec, rec["embedding"])
                raw_code = rec.get("university_code") or "BIT_MESRA"
                uni_code = raw_code.upper().strip()
                uni_name = "Indian Institute of Technology (ISM) Dhanbad" if "ISM" in uni_code else "Birla Institute of Technology, Mesra"
                scored_results.append({
                    "chunk_id": rec.get("chunk_id", "local_id"),
                    "university_code": uni_code,
                    "university_name": uni_name,
                    "entity_type": rec.get("entity_type", "FACULTY"),
                    "chunk_text": rec.get("chunk_text", ""),
                    "metadata": rec.get("metadata", {}),
                    "similarity_score": float(score)
                })

            scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
            logger.info(f"Retrieved {top_k} candidate chunks using local vector index.")
            return scored_results[:top_k]
        except Exception as local_err:
            logger.error(f"Error executing local vector search fallback: {local_err}")

    return []
