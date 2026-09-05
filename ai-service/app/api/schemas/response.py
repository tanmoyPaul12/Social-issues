"""
Response Schema: Standard API envelope.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Generic, TypeVar, Optional, Any
from datetime import datetime, timezone

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """
    Standard API response envelope for all AI microservice endpoints.
    """

    success: bool = Field(..., description="True if request succeeded, False on error.")
    message: str = Field(..., description="Human-readable status or error message.")
    data: Optional[T] = Field(None, description="Typed response payload.")
    request_id: Optional[str] = Field(None, description="Optional correlation ID for distributed tracing.")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp.")

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "success": True,
                    "message": "Challenge CH-1024 preprocessed successfully.",
                    "data": {"challenge_id": "CH-1024", "processing_status": "COMPLETED"},
                    "request_id": "req-12345",
                    "timestamp": "2026-09-02T11:30:00Z"
                }
            ]
        }
    )


def success_response(data: Any, message: str, request_id: str = None) -> APIResponse:
    return APIResponse(success=True, message=message, data=data, request_id=request_id)


def error_response(message: str, request_id: str = None) -> APIResponse:
    return APIResponse(success=False, message=message, data=None, request_id=request_id)
