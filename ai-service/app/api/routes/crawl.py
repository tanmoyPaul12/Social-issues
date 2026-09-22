"""
Crawler API Endpoints: Trigger and inspect university knowledge crawling.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.crawl_service import CrawlService

router = APIRouter(prefix="/crawl", tags=["University Crawler"])


class TriggerCrawlRequest(BaseModel):
    university_code: str = Field(description="Unique university code, e.g., IIT_ISM_DHANBAD")
    max_pages: Optional[int] = Field(default=None, description="Optional override for maximum pages to crawl")


class CrawlStatusResponse(BaseModel):
    university_code: str
    status: str
    pages_crawled: int
    new_pages: int
    updated_pages: int
    unchanged_pages: int
    failed_pages: int


@router.get("/configurations")
def list_configurations():
    """Lists all universities configured for knowledge crawling."""
    return CrawlService.list_crawl_configurations()


@router.get("/status/{university_code}")
def get_crawl_status(university_code: str):
    """Fetches crawl status and page metrics for a specific university."""
    res = CrawlService.get_university_crawl_metrics(university_code)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/trigger")
async def trigger_crawl(payload: TriggerCrawlRequest):
    """Triggers crawling for a university."""
    try:
        result = await CrawlService.trigger_university_crawl(
            university_code=payload.university_code,
            max_pages=payload.max_pages
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
