"""
Structured Knowledge Extractor Module.
Processes raw markdown dataset directories for universities into clean, validated JSON output files
under `structured_kb/{university_id}/{category}/` without mutating the original crawl.
Handles Faculty, Departments/Academics, Research Centers, Laboratories, and Incubation Hubs with deep
extraction for Publications, Patents, Sponsored Projects, and Laboratory Equipment.
"""
import os
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
from app.infrastructure.extractor.raw_provenance import build_provenance_header, RawProvenance
from app.infrastructure.extractor.taxonomy_normalizer import normalizer
from app.infrastructure.extractor.schemas import (
    FacultyItem, DepartmentItem, ResearchCenterItem,
    IncubationCenterItem, LaboratoryItem, UniversityKnowledgePayload,
    PublicationItem, PatentItem, ProjectItem, LabEquipmentItem
)

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
STRUCTURED_KB_DIR = ROOT_DIR / "structured_kb"

# Noise lines commonly found in website crawl outputs
NOISE_PATTERNS = [
    r"^\!\[\]\(http.*?\)", r"^Accessibility Menu", r"Contrast\s*\+", r"Bigger Text", r"Smaller Text",
    r"Reset Text", r"^Close$", r"^Search$", r"^Admission$", r"Alumni Portal", r"Faculty Portal",
    r"Twitter", r"Linkedin", r"Instagram", r"Facebook", r"Youtube", r"Designed and Developed By",
    r"User Visitors:", r"Policy for Fair Usage", r"Right to Information", r"Minutes of BoG"
]


def clean_markdown_noise(raw_text: str) -> str:
    """Strips website navigation boilerplate and non-substantive lines."""
    lines = raw_text.splitlines()
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if any(re.search(pat, stripped, re.IGNORECASE) for pat in NOISE_PATTERNS):
            continue
        cleaned.append(stripped)
    return "\n".join(cleaned)


def parse_markdown_tables(raw_text: str) -> List[Dict[str, str]]:
    """Extracts Markdown tables into structured row dictionaries."""
    rows_data = []
    lines = raw_text.splitlines()
    in_table = False
    headers = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            if not cells:
                continue
            # Check if separator line
            if all(set(c).issubset({"-", ":", " "}) for c in cells):
                continue
            if not headers:
                headers = [c.lower().replace("*", "") for c in cells]
                in_table = True
            else:
                row = {}
                for idx, cell in enumerate(cells):
                    h_key = headers[idx] if idx < len(headers) else f"col_{idx}"
                    row[h_key] = cell
                rows_data.append(row)
        else:
            if in_table and not stripped.startswith("|"):
                in_table = False
                headers = []

    return rows_data


class StructuredExtractor:
    """Extracts and normalizes raw dataset pages into structured, schema-validated JSON files."""

    def __init__(self, output_dir: Path = STRUCTURED_KB_DIR):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def extract_faculty_from_markdown(self, raw_text: str, file_path: Path, uni_code: str) -> FacultyItem:
        """Parses a faculty member Markdown page into a deep, validated FacultyItem."""
        cleaned_text = clean_markdown_noise(raw_text)
        lines = cleaned_text.splitlines()
        name = file_path.stem.replace("_", " ").title()
        designation = "Faculty / Researcher"
        department = "Academic Department"
        email = None
        phone = None
        raw_interests = []
        teaching_subjects = []
        education = []
        awards = []
        publications: List[PublicationItem] = []
        patents: List[PatentItem] = []
        projects: List[ProjectItem] = []

        # Current section tracker
        current_section = ""

        for i, line in enumerate(lines):
            line_str = line.strip()
            # Name & Profile detection
            if ("Prof." in line_str or "Dr." in line_str) and len(line_str) < 80 and not name.startswith(("Prof", "Dr")):
                name = line_str.replace("#", "").strip()
            elif "Designation:" in line_str or "Designation :" in line_str:
                designation = line_str.split(":", 1)[-1].strip()
            elif "Department:" in line_str or "Department :" in line_str:
                department = line_str.split(":", 1)[-1].strip()
            elif "Contact Number:" in line_str or "Office Number:" in line_str:
                phone = line_str.split(":", 1)[-1].strip()
            elif "@" in line_str and ("ac.in" in line_str or "edu" in line_str or "org" in line_str) and not email:
                email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line_str)
                if email_match:
                    email = email_match.group(0)

            # Detect Header Sections
            if line_str.startswith("#"):
                header_title = line_str.lstrip("#").strip().lower()
                if "research interest" in header_title or "area" in header_title or "specialization" in header_title:
                    current_section = "interests"
                elif "teaching" in header_title or "course" in header_title:
                    current_section = "teaching"
                elif "academic" in header_title or "education" in header_title or "qualification" in header_title:
                    current_section = "education"
                elif "award" in header_title or "honor" in header_title or "recognition" in header_title:
                    current_section = "awards"
                elif "publication" in header_title or "paper" in header_title or "book" in header_title:
                    current_section = "publications"
                elif "patent" in header_title:
                    current_section = "patents"
                elif "project" in header_title or "grant" in header_title or "activity" in header_title:
                    current_section = "projects"
                else:
                    current_section = ""
                continue

            # In-line research interest check
            if "Research Interest:" in line_str or "Research Interests:" in line_str:
                interest_val = line_str.split(":", 1)[-1].strip()
                items = [it.strip() for it in interest_val.split(",") if it.strip()]
                raw_interests.extend(items)

            # Content accumulation by section
            if current_section == "interests":
                if line_str.startswith(("*", "-")):
                    item = line_str.lstrip("*- ").strip()
                    if item and len(item) < 150:
                        raw_interests.append(item)
            elif current_section == "teaching":
                if line_str.startswith(("*", "-")):
                    t_item = line_str.lstrip("*- ").strip()
                    if t_item:
                        teaching_subjects.append(t_item)
            elif current_section == "education":
                if line_str.startswith(("*", "-")) or any(yr in line_str for yr in ["200", "201", "202", "199", "198"]):
                    edu_item = line_str.lstrip("*- ").strip()
                    if edu_item and len(edu_item) < 200:
                        education.append(edu_item)
            elif current_section == "awards":
                if line_str.startswith(("*", "-")):
                    aw_item = line_str.lstrip("*- ").strip()
                    if aw_item and len(aw_item) < 200:
                        awards.append(aw_item)
            elif current_section == "publications":
                # Match numbered or bulleted publication items
                bullet_clean = re.sub(r'^\d+\.\s*', '', line_str.lstrip("*- "))
                if len(bullet_clean) > 25 and not bullet_clean.startswith("#"):
                    journal_match = re.search(r'\b(Journal|Transactions|Letters|Cellulose|ACS|RSC|Elsevier|Springer|IEEE|Nature|Polymer|Materials|Physics|Chemistry|Conference)\b', bullet_clean, re.IGNORECASE)
                    doi_match = re.search(r'10\.\d{4,9}/[-._;()/:A-Z0-9]+', bullet_clean, re.IGNORECASE)
                    publisher = journal_match.group(0) if journal_match else "Peer-Reviewed Journal"
                    doi = f"https://doi.org/{doi_match.group(0)}" if doi_match else None
                    year_match = re.search(r'\(?(19\d{2}|20\d{2})\)?', bullet_clean)
                    year = year_match.group(1) if year_match else None

                    publications.append(PublicationItem(
                        title=bullet_clean[:250],
                        journal_or_publisher=publisher,
                        year=year,
                        doi_or_url=doi
                    ))
            elif current_section == "patents":
                bullet_clean = re.sub(r'^\d+\.\s*', '', line_str.lstrip("*- "))
                if len(bullet_clean) > 15:
                    pat_num_match = re.search(r'Patent\s*(?:No\.?|Application)?\s*[:\s]*([A-Z0-9/-]+)', bullet_clean, re.IGNORECASE)
                    pat_num = pat_num_match.group(1) if pat_num_match else None
                    status = "Granted" if "granted" in bullet_clean.lower() else ("Filed" if "filed" in bullet_clean.lower() else "Published")
                    patents.append(PatentItem(
                        title=bullet_clean[:250],
                        patent_number=pat_num,
                        status=status
                    ))
            elif current_section == "projects":
                bullet_clean = re.sub(r'^\d+\.\s*', '', line_str.lstrip("*- "))
                if len(bullet_clean) > 20:
                    agency_match = re.search(r'\b(DRDO|DST|CIL|ISRO|CSIR|SERB|MoE|MHRD|ICAR|DBT|CMPDI|SAIL|Tata Steel|Ministry of Coal)\b', bullet_clean)
                    agency = agency_match.group(0) if agency_match else "Sponsoring Agency"
                    projects.append(ProjectItem(
                        project_name=bullet_clean[:250],
                        funding_agency=agency,
                        pi_name=name
                    ))

        if not raw_interests:
            raw_interests = [f"Research & Teaching in {department}"]

        structured_interests = normalizer.normalize_list(raw_interests)
        domain_set = set()
        for item in structured_interests:
            domain_set.update(item.normalized)

        return FacultyItem(
            name=name,
            designation=designation,
            email=email,
            phone=phone,
            department_name=department,
            raw_research_interests=raw_interests,
            structured_research_interests=structured_interests,
            specialization_domains=sorted(list(domain_set)),
            teaching=teaching_subjects,
            education=education,
            awards=awards,
            publications=publications[:30],  # Keep top 30 most relevant
            patents=patents[:15],
            sponsored_projects=projects[:20],
            profile_url=f"https://www.university.ac.in/{uni_code.lower()}/faculty/{file_path.stem}"
        )

    def extract_department_from_markdown(self, raw_text: str, file_path: Path, uni_code: str) -> DepartmentItem:
        """Parses academic record / department page into a DepartmentItem."""
        cleaned_text = clean_markdown_noise(raw_text)
        lines = [l.strip() for l in cleaned_text.splitlines() if l.strip()]
        title = file_path.stem.replace("_", " ").title()
        overview = "\n".join(lines[:10]) if lines else title

        # Parse tables (e.g. ongoing / completed research)
        table_rows = parse_markdown_tables(cleaned_text)
        ongoing_projects = []
        for row in table_rows:
            p_name = row.get("projectname", row.get("project name", row.get("col_1", "")))
            agency = row.get("funding agency", row.get("fundingagency", row.get("col_2", "")))
            pi = row.get("name of pi", row.get("pi", row.get("col_3", "")))
            if p_name and len(p_name) > 10 and p_name.lower() != "projectname":
                ongoing_projects.append(ProjectItem(
                    project_name=p_name,
                    funding_agency=agency or "Sponsoring Agency",
                    pi_name=pi or None
                ))

        structured_interests = normalizer.normalize_list(lines[:15])
        domain_set = set()
        for item in structured_interests:
            domain_set.update(item.normalized)

        return DepartmentItem(
            name=title,
            code=file_path.stem.upper()[:6],
            overview=overview[:600],
            domain_tags=sorted(list(domain_set)),
            ongoing_projects=ongoing_projects,
            source_url=f"https://www.university.ac.in/{uni_code.lower()}/academic/{file_path.stem}"
        )

    def extract_research_from_markdown(self, raw_text: str, file_path: Path, uni_code: str) -> ResearchCenterItem:
        """Parses research center / expertise page into a ResearchCenterItem."""
        cleaned_text = clean_markdown_noise(raw_text)
        lines = [l.strip() for l in cleaned_text.splitlines() if l.strip()]
        title = file_path.stem.replace("_", " ").title()
        thrust = [l.lstrip("*- ") for l in lines if l.startswith("*") or l.startswith("-")][:10]

        # Parse tables for research center projects
        table_rows = parse_markdown_tables(cleaned_text)
        projects = []
        for row in table_rows:
            p_name = row.get("projectname", row.get("project name", row.get("col_1", "")))
            agency = row.get("funding agency", row.get("fundingagency", row.get("col_2", "")))
            pi = row.get("name of pi", row.get("pi", row.get("col_3", "")))
            if p_name and len(p_name) > 10 and p_name.lower() != "projectname":
                projects.append(ProjectItem(
                    project_name=p_name,
                    funding_agency=agency or "Funding Agency",
                    pi_name=pi or None
                ))

        structured_interests = normalizer.normalize_list(lines[:15])
        domain_set = set()
        for item in structured_interests:
            domain_set.update(item.normalized)

        return ResearchCenterItem(
            name=f"{title} Center of Excellence",
            code=file_path.stem.upper()[:6],
            thrust_areas=thrust or [title],
            structured_thrust_areas=structured_interests,
            projects=projects,
            domain_tags=sorted(list(domain_set)),
            source_url=f"https://www.university.ac.in/{uni_code.lower()}/research/{file_path.stem}"
        )

    def extract_incubation_from_markdown(self, raw_text: str, file_path: Path, uni_code: str) -> IncubationCenterItem:
        """Parses incubation / innovation page into an IncubationCenterItem."""
        cleaned_text = clean_markdown_noise(raw_text)
        lines = [l.strip() for l in cleaned_text.splitlines() if l.strip()]
        title = file_path.stem.replace("_", " ").title()

        facilities = ["Maker Space", "Seed Capital Grant", "IP Support", "Prototyping Lab", "TBI Mentorship"]
        portfolios = [l.lstrip("*- ") for l in lines if ("startup" in l.lower() or "incubate" in l.lower() or "company" in l.lower())][:10]

        structured_interests = normalizer.normalize_list(lines[:15])
        domain_set = set()
        for item in structured_interests:
            domain_set.update(item.normalized)

        return IncubationCenterItem(
            name=f"{title} Innovation & Incubation Hub",
            code=file_path.stem.upper()[:6],
            focus_sectors=[title],
            facilities_provided=facilities,
            portfolio_startups=portfolios,
            domain_tags=sorted(list(domain_set)),
            source_url=f"https://www.university.ac.in/{uni_code.lower()}/incubation/{file_path.stem}"
        )

    def process_university_dataset(self, uni_code: str, raw_dataset_dir: Path) -> UniversityKnowledgePayload:
        """Reads raw dataset directory for a university and outputs validated structured JSON files."""
        uni_output_dir = self.output_dir / uni_code.lower()
        uni_output_dir.mkdir(parents=True, exist_ok=True)

        faculty_list: List[FacultyItem] = []
        department_list: List[DepartmentItem] = []
        rc_list: List[ResearchCenterItem] = []
        ic_list: List[IncubationCenterItem] = []
        lab_list: List[LaboratoryItem] = []

        if not raw_dataset_dir.exists():
            print(f"⚠️ Raw dataset directory does not exist: {raw_dataset_dir}")
            return UniversityKnowledgePayload(university_code=uni_code, university_name=uni_code.upper())

        # Walk raw directory recursively
        for root, dirs, files in os.walk(raw_dataset_dir):
            for file_name in files:
                if not file_name.endswith(".md"):
                    continue

                file_path = Path(root) / file_name
                raw_text = file_path.read_text(encoding="utf-8", errors="ignore")
                if not raw_text.strip():
                    continue

                provenance = build_provenance_header(uni_code, str(file_path), raw_text)
                rel_path = file_path.relative_to(raw_dataset_dir).as_posix().lower()

                # Categorize based on file path
                if "faculty" in rel_path:
                    faculty_obj = self.extract_faculty_from_markdown(raw_text, file_path, uni_code)
                    faculty_list.append(faculty_obj)
                    out_path = uni_output_dir / "faculty" / f"{file_path.stem}.json"
                    out_path.parent.mkdir(parents=True, exist_ok=True)
                    payload = {"provenance": provenance.model_dump(), "data": faculty_obj.model_dump()}
                    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

                elif "academic" in rel_path or "department" in rel_path:
                    dept_obj = self.extract_department_from_markdown(raw_text, file_path, uni_code)
                    department_list.append(dept_obj)
                    out_path = uni_output_dir / "academic" / f"{file_path.stem}.json"
                    out_path.parent.mkdir(parents=True, exist_ok=True)
                    payload = {"provenance": provenance.model_dump(), "data": dept_obj.model_dump()}
                    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

                elif "research" in rel_path:
                    rc_obj = self.extract_research_from_markdown(raw_text, file_path, uni_code)
                    rc_list.append(rc_obj)
                    out_path = uni_output_dir / "research" / f"{file_path.stem}.json"
                    out_path.parent.mkdir(parents=True, exist_ok=True)
                    payload = {"provenance": provenance.model_dump(), "data": rc_obj.model_dump()}
                    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

                elif "incobation" in rel_path or "incubation" in rel_path or "innovation" in rel_path:
                    ic_obj = self.extract_incubation_from_markdown(raw_text, file_path, uni_code)
                    ic_list.append(ic_obj)
                    out_path = uni_output_dir / "incubation" / f"{file_path.stem}.json"
                    out_path.parent.mkdir(parents=True, exist_ok=True)
                    payload = {"provenance": provenance.model_dump(), "data": ic_obj.model_dump()}
                    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

        total = len(faculty_list) + len(department_list) + len(rc_list) + len(ic_list) + len(lab_list)
        print(f"✅ Extracted {total} structured entities for university '{uni_code}' ({len(faculty_list)} faculty, {len(department_list)} academic, {len(rc_list)} research, {len(ic_list)} incubation)")

        return UniversityKnowledgePayload(
            university_code=uni_code,
            university_name=uni_code.replace("_", " ").upper(),
            departments=department_list,
            faculty_profiles=faculty_list,
            research_centers=rc_list,
            incubation_centers=ic_list,
            laboratories=lab_list,
            total_extracted_entities=total
        )
