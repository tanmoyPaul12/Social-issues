"""
Knowledge Base Embedder Module.
Generates 384-dimensional dense vectors for multi-passage canonical entity documents using `local_e5_embedder`
and synchronizes them into the PostgreSQL `university_embeddings` table.
"""
import uuid
import logging
from typing import List, Dict, Any
from app.models.text.embedding_model import local_e5_embedder
from app.infrastructure.extractor.canonical_doc_builder import doc_builder
from app.infrastructure.extractor.schemas import UniversityKnowledgePayload

logger = logging.getLogger(__name__)


class KBEmbedder:
    """Computes vector embeddings for multi-passage university entities and prepares DB records."""

    def generate_entity_embeddings(self, payload: UniversityKnowledgePayload) -> List[Dict[str, Any]]:
        """Transforms a full university payload into a list of vector embedding records."""
        records = []
        uni_name = payload.university_name
        uni_code = payload.university_code

        # 1. Faculty Embeddings (Multi-Passage: Profile, Publications, Patents, Projects)
        for fac in payload.faculty_profiles:
            passages = doc_builder.build_faculty_passages(fac, uni_name, uni_code)
            for item in passages:
                doc_text = item["passage_text"]
                vector = local_e5_embedder.encode(doc_text, is_query=False)
                meta = dict(item["metadata"])
                meta["chunk_type"] = item["chunk_type"]

                records.append({
                    "id": str(uuid.uuid4()),
                    "entity_type": "FACULTY",
                    "entity_name": fac.name,
                    "university_code": uni_code,
                    "chunk_text": doc_text,
                    "embedding": vector,
                    "metadata": meta
                })

        # 2. Department Embeddings
        for dept in payload.departments:
            passages = doc_builder.build_department_passages(dept, uni_name, uni_code)
            for item in passages:
                doc_text = item["passage_text"]
                vector = local_e5_embedder.encode(doc_text, is_query=False)
                meta = dict(item["metadata"])
                meta["chunk_type"] = item["chunk_type"]

                records.append({
                    "id": str(uuid.uuid4()),
                    "entity_type": "DEPARTMENT",
                    "entity_name": dept.name,
                    "university_code": uni_code,
                    "chunk_text": doc_text,
                    "embedding": vector,
                    "metadata": meta
                })

        # 3. Research Center Embeddings
        for rc in payload.research_centers:
            passages = doc_builder.build_research_center_passages(rc, uni_name, uni_code)
            for item in passages:
                doc_text = item["passage_text"]
                vector = local_e5_embedder.encode(doc_text, is_query=False)
                meta = dict(item["metadata"])
                meta["chunk_type"] = item["chunk_type"]

                records.append({
                    "id": str(uuid.uuid4()),
                    "entity_type": "RESEARCH_CENTRE",
                    "entity_name": rc.name,
                    "university_code": uni_code,
                    "chunk_text": doc_text,
                    "embedding": vector,
                    "metadata": meta
                })

        # 4. Laboratory Embeddings
        for lab in payload.laboratories:
            passages = doc_builder.build_laboratory_passages(lab, uni_name, uni_code)
            for item in passages:
                doc_text = item["passage_text"]
                vector = local_e5_embedder.encode(doc_text, is_query=False)
                meta = dict(item["metadata"])
                meta["chunk_type"] = item["chunk_type"]

                records.append({
                    "id": str(uuid.uuid4()),
                    "entity_type": "FACILITY",
                    "entity_name": lab.name,
                    "university_code": uni_code,
                    "chunk_text": doc_text,
                    "embedding": vector,
                    "metadata": meta
                })

        # 5. Incubation Center Embeddings
        for ic in payload.incubation_centers:
            passages = doc_builder.build_incubation_passages(ic, uni_name, uni_code)
            for item in passages:
                doc_text = item["passage_text"]
                vector = local_e5_embedder.encode(doc_text, is_query=False)
                meta = dict(item["metadata"])
                meta["chunk_type"] = item["chunk_type"]

                records.append({
                    "id": str(uuid.uuid4()),
                    "entity_type": "INCUBATION_CENTRE",
                    "entity_name": ic.name,
                    "university_code": uni_code,
                    "chunk_text": doc_text,
                    "embedding": vector,
                    "metadata": meta
                })

        logger.info(f"Generated {len(records)} multi-passage vector embedding records for {uni_code}.")
        return records


kb_embedder = KBEmbedder()
