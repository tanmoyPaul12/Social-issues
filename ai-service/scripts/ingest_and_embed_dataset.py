#!/usr/bin/env python3
"""
Master Data Ingestion & Embedding Pipeline Script.
1. Reads raw crawled university Markdown datasets (`BIT_MESRA`, `iit_ism_dhanbad`) across all data folders.
2. Attaches SHA-256 content hashes and provenance metadata (`raw_provenance.py`).
3. Extracts category-specific structured entities & outputs JSON files (`structured_kb/`).
4. Builds canonical dense search passages (`canonical_doc_builder.py`).
5. Computes 384-d dense vectors locally via `intfloat/multilingual-e5-small` (`local_e5_embedder.py`).
6. Saves vector index to `structured_kb/vector_embeddings_index.json` and syncs to Supabase / PostgreSQL pgvector (`university_embeddings`).

Usage:
    PYTHONPATH=ai-service ai-service/venv/bin/python3 ai-service/scripts/ingest_and_embed_dataset.py --all --sync-db
"""
import sys
import os
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app.infrastructure.extractor.raw_provenance import build_provenance_header
from app.infrastructure.extractor.structured_extractor import StructuredExtractor
from app.infrastructure.extractor.canonical_doc_builder import doc_builder
from app.infrastructure.extractor.kb_embedder import kb_embedder
from app.infrastructure.extractor.schemas import UniversityKnowledgePayload
from scripts.extract_university_knowledge import PREMIER_UNIVERSITY_KNOWLEDGE, build_payload_from_data

DATASET_DIRS = [
    ROOT_DIR / "app" / "data" / "dataset-university",
    ROOT_DIR / "dataset-university"
]
STRUCTURED_KB_DIR = ROOT_DIR / "structured_kb"


def run_full_ingestion_and_embedding(sync_db: bool = True):
    """Executes the complete data processing, canonical doc generation, embedding, and vector sync pipeline."""
    print("=" * 80)
    print("🚀 STARTING UNIVERSITY KNOWLEDGE BASE DATA INGESTION & EMBEDDING PIPELINE")
    print("=" * 80)

    extractor = StructuredExtractor(output_dir=STRUCTURED_KB_DIR)
    all_vector_records: List[Dict[str, Any]] = []

    # 1. Process Curated Premier Jharkhand Universities
    print("\n📦 [1/4] Ingesting Curated Premier University Payloads...")
    for uni_code, data in PREMIER_UNIVERSITY_KNOWLEDGE.items():
        print(f"   • Processing {uni_code}...")
        payload = build_payload_from_data(uni_code, data)
        records = kb_embedder.generate_entity_embeddings(payload)
        all_vector_records.extend(records)
        print(f"     ├── Extracted Entities: {payload.total_extracted_entities}")
        print(f"     └── Generated 384-d Vectors: {len(records)}")

    # 2. Process Crawled Raw Markdown Datasets (BIT_MESRA, iit_ism_dhanbad)
    print("\n📁 [2/4] Processing Crawled Raw Markdown Datasets...")
    processed_unis = set()

    for d_path in DATASET_DIRS:
        if not d_path.exists():
            continue
        print(f"   Searching dataset path: {d_path}")
        for item in os.listdir(d_path):
            uni_raw_dir = d_path / item
            if uni_raw_dir.is_dir() and item not in processed_unis:
                processed_unis.add(item)
                print(f"   • Extracting raw dataset: {item}...")
                payload = extractor.process_university_dataset(item.upper(), uni_raw_dir)
                records = kb_embedder.generate_entity_embeddings(payload)
                all_vector_records.extend(records)
                print(f"     ├── Extracted Entities: {payload.total_extracted_entities}")
                print(f"     └── Generated 384-d Vectors: {len(records)}")

    # 3. Export Offline Vector Embeddings Index JSON
    print("\n💾 [3/4] Exporting Standalone Vector Index JSON...")
    vector_index_path = STRUCTURED_KB_DIR / "vector_embeddings_index.json"
    STRUCTURED_KB_DIR.mkdir(parents=True, exist_ok=True)
    vector_index_path.write_text(json.dumps(all_vector_records, indent=2), encoding="utf-8")
    print(f"   ✅ Saved {len(all_vector_records)} vector records to: {vector_index_path}")

    # 4. Sync Vector Records to Supabase / PostgreSQL pgvector
    if sync_db:
        print("\n🗄️ [4/4] Syncing Vector Embeddings to PostgreSQL / Supabase pgvector...")
        try:
            from app.infrastructure.database.client import get_db_cursor
            synced_count = 0
            with get_db_cursor(commit=True) as cur:
                for rec in all_vector_records:
                    vec_str = f"[{','.join(str(x) for x in rec['embedding'])}]"
                    cur.execute(
                        """
                        INSERT INTO university_embeddings (id, entity_type, entity_id, university_id, chunk_text, embedding, metadata)
                        VALUES (
                            %s, %s, gen_random_uuid(),
                            (SELECT id FROM universities WHERE code = %s LIMIT 1),
                            %s, %s::vector, %s::jsonb
                        )
                        ON CONFLICT (id) DO UPDATE SET
                            chunk_text = EXCLUDED.chunk_text,
                            embedding = EXCLUDED.embedding,
                            metadata = EXCLUDED.metadata,
                            updated_at = NOW();
                        """,
                        (rec["id"], rec["entity_type"], rec["university_code"], rec["chunk_text"], vec_str, json.dumps(rec["metadata"]))
                    )
                    synced_count += 1
            print(f"   ✅ Synchronized {synced_count} vector records to PostgreSQL table 'university_embeddings'.")
        except Exception as e:
            print(f"   ⚠️ Database connection notice ({e}). Saved vector embeddings locally in `vector_embeddings_index.json`.")

    print("\n" + "=" * 80)
    print(f"🎉 PIPELINE COMPLETE! Total Encoded Entity Vectors: {len(all_vector_records)}")
    print("=" * 80 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Master Data Ingestion & Embedding Pipeline")
    parser.add_argument("--all", action="store_true", help="Process all university datasets")
    parser.add_argument("--sync-db", action="store_true", default=True, help="Sync vector records to Supabase pgvector")
    args = parser.parse_args()

    run_full_ingestion_and_embedding(sync_db=args.sync_db)


if __name__ == "__main__":
    main()
