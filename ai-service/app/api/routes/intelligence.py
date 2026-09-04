"""
AI Intelligence Route: Issue Validity, Categorization, and Priority Scoring endpoints.
"""
from fastapi import APIRouter, Header, status, Body
from typing import Optional, Dict, Any

from app.api.schemas.response import APIResponse, success_response
from app.domain.intelligence.issue_context_builder import build_unified_issue_context
from app.domain.intelligence.issue_validator import evaluate_issue_validity
from app.domain.intelligence.categorization.categorizer import issue_categorizer
from app.domain.intelligence.prioritization.priority_engine import priority_engine

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])


@router.post(
    "/categorize",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Categorize Unified Issue Context"
)
async def categorize_issue_endpoint(
    payload: Dict[str, Any] = Body(...),
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[Dict[str, Any]]:
    result = await issue_categorizer.categorize_issue(payload)
    return success_response(
        data=result,
        message="Issue categorized successfully.",
        request_id=x_request_id
    )


@router.post(
    "/prioritize",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Calculate Priority Score & Urgency Tier"
)
async def prioritize_issue_endpoint(
    payload: Dict[str, Any] = Body(...),
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[Dict[str, Any]]:
    unified_context = payload.get("unified_context", payload)
    category_info = payload.get("category_info", {})

    result = await priority_engine.prioritize_issue(unified_context, category_info)
    return success_response(
        data=result,
        message="Issue priority computed successfully.",
        request_id=x_request_id
    )


@router.post(
    "/process",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Full AI Intelligence Pipeline: Validity -> Categorize -> Prioritize"
)
async def process_full_intelligence_endpoint(
    payload: Dict[str, Any] = Body(...),
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[Dict[str, Any]]:
    """
    Executes the full Unified AI Intelligence Pipeline.
    Expects payload with keys: 'text', 'image' (optional), 'document' (optional), 'location' (optional).
    """
    issue_id = payload.get("issue_id")
    text_data = payload.get("text", {})
    image_data = payload.get("image")
    doc_data = payload.get("document")
    loc_data = payload.get("location")

    # 1. Build Unified Issue Context
    unified_context = build_unified_issue_context(
        issue_id=issue_id,
        text_data=text_data,
        image_data=image_data,
        document_data=doc_data,
        location_data=loc_data
    )

    # 2. Issue Validity Guardrail Check
    validity_res = evaluate_issue_validity(unified_context)

    # 3. Categorization Engine
    cat_res = await issue_categorizer.categorize_issue(unified_context)

    # 4. Priority Scoring Engine
    prio_res = await priority_engine.prioritize_issue(unified_context, cat_res)

    # 5. Multimodal Generalized 4-Modality Consensus
    from app.prioritization.priority_rules import calculate_multimodal_generalized_consensus
    multimodal_consensus = calculate_multimodal_generalized_consensus(
        text_data=unified_context.get("text", {}),
        image_data=unified_context.get("image_evidence"),
        document_data=unified_context.get("document_evidence"),
        location_data=unified_context.get("location")
    )

    full_result = {
        "issue_id": unified_context["issue_id"],
        "unified_context": unified_context,
        "validity": validity_res,
        "categorization": cat_res,
        "priority": prio_res,
        "modality_breakdown": multimodal_consensus["modality_breakdown"],
        "generalized_consensus": multimodal_consensus["generalized_consensus"]
    }

    return success_response(
        data=full_result,
        message="4-Modality Generalized Intelligence pipeline executed successfully.",
        request_id=x_request_id
    )

