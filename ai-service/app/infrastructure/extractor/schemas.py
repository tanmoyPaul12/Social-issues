"""
Structured Extraction Schemas for University Knowledge Base.
Defines Pydantic models for Departments, Faculty, Research Centers, TBIs, and Labs
supporting both raw text, structured items, and normalized taxonomy tokens.
"""
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from app.infrastructure.extractor.taxonomy_normalizer import ResearchInterestItem


class PublicationItem(BaseModel):
    title: str = Field(description="Title of the research publication or paper")
    journal_or_publisher: Optional[str] = Field(default=None, description="Journal name, conference, or publisher (e.g. Elsevier, Springer, Nature, IEEE)")
    year: Optional[str] = Field(default=None, description="Year of publication")
    doi_or_url: Optional[str] = Field(default=None, description="DOI or web link")
    impact_factor: Optional[str] = Field(default=None, description="Journal impact factor or Q-quartile if specified")


class PatentItem(BaseModel):
    title: str = Field(description="Title of the patent or innovation")
    patent_number: Optional[str] = Field(default=None, description="Patent application or grant number")
    status: Optional[str] = Field(default="Granted", description="Status: Granted, Filed, or Published")
    inventors: List[str] = Field(default_factory=list, description="Co-inventors or research team")


class ProjectItem(BaseModel):
    project_name: str = Field(description="Title or topic of the funded R&D project")
    funding_agency: Optional[str] = Field(default=None, description="Sponsoring agency (e.g., DRDO, DST, CIL, ISRO, CSIR, SERB, MoE, Industry)")
    pi_name: Optional[str] = Field(default=None, description="Principal Investigator or Co-PI name")
    amount_or_duration: Optional[str] = Field(default=None, description="Grant amount or project duration")


class LabEquipmentItem(BaseModel):
    name: str = Field(description="Name of equipment, testing rig, or analytical instrument")
    specifications: Optional[str] = Field(default=None, description="Technical specs or capacity")
    applications: Optional[str] = Field(default=None, description="Primary research or testing applications")


class FacultyItem(BaseModel):
    name: str = Field(description="Full name of the faculty member or professor")
    designation: Optional[str] = Field(default=None, description="Designation (e.g., Professor, Associate Professor, Assistant Professor, HOD)")
    email: Optional[str] = Field(default=None, description="Official email address")
    phone: Optional[str] = Field(default=None, description="Phone number")
    department_name: Optional[str] = Field(default=None, description="Department they belong to")
    raw_research_interests: List[str] = Field(default_factory=list, description="Original raw research areas")
    structured_research_interests: List[ResearchInterestItem] = Field(default_factory=list, description="Raw + Normalized research objects")
    specialization_domains: List[str] = Field(default_factory=list, description="Matched Societal Domains")
    teaching: List[str] = Field(default_factory=list, description="Teaching subjects")
    education: List[str] = Field(default_factory=list, description="Degrees and qualifications")
    awards: List[str] = Field(default_factory=list, description="Awards, honors, and recognitions")
    publications: List[Union[PublicationItem, str]] = Field(default_factory=list, description="Extracted publication objects or paper titles")
    patents: List[Union[PatentItem, str]] = Field(default_factory=list, description="Extracted patent objects or patent titles")
    sponsored_projects: List[Union[ProjectItem, str]] = Field(default_factory=list, description="Funded R&D projects")
    profile_url: Optional[str] = Field(default=None, description="URL of faculty profile page")


class DepartmentItem(BaseModel):
    name: str = Field(description="Department or School name (e.g., Department of Mining Engineering)")
    code: Optional[str] = Field(default=None, description="Department short code (e.g., DMIN, DCSE, DENV)")
    hod_name: Optional[str] = Field(default=None, description="Head of Department name")
    overview: Optional[str] = Field(default=None, description="Summary of academic focus and mission")
    domain_tags: List[str] = Field(default_factory=list, description="Associated Societal Challenge Domains")
    ongoing_projects: List[Union[ProjectItem, str]] = Field(default_factory=list, description="Ongoing department research projects")
    completed_projects: List[Union[ProjectItem, str]] = Field(default_factory=list, description="Completed department research projects")
    faculties: List[FacultyItem] = Field(default_factory=list, description="List of faculty members in this department")
    source_url: Optional[str] = Field(default=None, description="Source page URL")


class ResearchCenterItem(BaseModel):
    name: str = Field(description="Name of Research Center or Center of Excellence (CoE)")
    code: Optional[str] = Field(default=None, description="Center abbreviation or code")
    thrust_areas: List[str] = Field(default_factory=list, description="Key research thrust areas and themes")
    structured_thrust_areas: List[ResearchInterestItem] = Field(default_factory=list, description="Raw + Normalized thrust areas")
    facilities_equipment: List[str] = Field(default_factory=list, description="Major equipment, testing setups, or simulators")
    projects: List[Union[ProjectItem, str]] = Field(default_factory=list, description="Center R&D projects")
    lead_name: Optional[str] = Field(default=None, description="Director, Coordinator, or Principal Investigator")
    domain_tags: List[str] = Field(default_factory=list, description="Associated Societal Challenge Domains")
    source_url: Optional[str] = Field(default=None, description="Source page URL")


class IncubationCenterItem(BaseModel):
    name: str = Field(description="Name of Technology Business Incubator (TBI) or Innovation Hub")
    code: Optional[str] = Field(default=None, description="Incubator code (e.g., CIIE, NAHEP-CAAST)")
    focus_sectors: List[str] = Field(default_factory=list, description="Startup domains and supported sectors")
    facilities_provided: List[str] = Field(default_factory=list, description="Maker spaces, prototyping labs, seed grants")
    funding_grants: Optional[str] = Field(default=None, description="Available funding programs (e.g., DST NIDHI, BIRAC)")
    portfolio_startups: List[str] = Field(default_factory=list, description="Incubated startups or innovation projects")
    domain_tags: List[str] = Field(default_factory=list, description="Associated Societal Challenge Domains")
    source_url: Optional[str] = Field(default=None, description="Source page URL")


class LaboratoryItem(BaseModel):
    name: str = Field(description="Name of the laboratory or testing facility")
    department_name: Optional[str] = Field(default=None, description="Parent department")
    testing_capabilities: List[str] = Field(default_factory=list, description="Sample testing, characterization, simulation capabilities")
    key_equipment: List[Union[LabEquipmentItem, str]] = Field(default_factory=list, description="Key analytical and testing machinery")
    societal_applicability: Optional[str] = Field(default=None, description="Direct application to societal challenges")
    domain_tags: List[str] = Field(default_factory=list, description="Associated Societal Challenge Domains")
    source_url: Optional[str] = Field(default=None, description="Source page URL")


class PageClassification(BaseModel):
    page_type: str = Field(description="FACULTY | DEPARTMENT | RESEARCH_COE | INCUBATION_TBI | LABORATORY | GENERAL_OVERVIEW")
    confidence: float = Field(default=0.9, description="Classification confidence score")
    summary: Optional[str] = Field(default=None, description="Brief summary of page content")


class UniversityKnowledgePayload(BaseModel):
    university_code: str
    university_name: str
    departments: List[DepartmentItem] = Field(default_factory=list)
    faculty_profiles: List[FacultyItem] = Field(default_factory=list)
    research_centers: List[ResearchCenterItem] = Field(default_factory=list)
    incubation_centers: List[IncubationCenterItem] = Field(default_factory=list)
    laboratories: List[LaboratoryItem] = Field(default_factory=list)
    total_extracted_entities: int = 0
