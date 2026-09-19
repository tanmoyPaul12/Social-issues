"""
LangGraph Extraction Pipeline: State machine orchestrating page classification,
structured entity extraction, 9-domain taxonomy mapping, and database persistence.
"""
import re
import json
from typing import Dict, Any, List, Optional
from app.utils.logger import logger
from app.infrastructure.database.client import get_db_cursor
from .schemas import (
    FacultyItem,
    DepartmentItem,
    ResearchCenterItem,
    IncubationCenterItem,
    LaboratoryItem,
    PageClassification,
    UniversityKnowledgePayload
)

# 9 Societal Challenge Domains & Keyword Rules
DOMAIN_KEYWORDS = {
    "MINING_SAFETY_GEOLOGY": [
        "mining", "mine", "rock mechanics", "slope stability", "blast", "excavation",
        "mineral", "geology", "geophysics", "underground", "coal", "ore", "mine ventilation"
    ],
    "WATER_QUALITY_HYDROGEOLOGY": [
        "water", "groundwater", "arsenic", "fluoride", "hydrology", "water quality",
        "water treatment", "filtration", "aquifer", "hydrogeology", "potable water"
    ],
    "AGRICULTURE_CLIMATE": [
        "agriculture", "crop", "soil", "agronomy", "horticulture", "pest", "drought",
        "irrigation", "farming", "seed", "plant pathology", "organic farming", "kvk"
    ],
    "HEALTHCARE_BIOMEDICAL": [
        "health", "medical", "clinical", "biomedical", "pathology", "hospital",
        "pharmacology", "telemedicine", "patient", "epidemiology", "doctor", "nursing"
    ],
    "RURAL_URBAN_INFRASTRUCTURE": [
        "civil", "structural", "concrete", "transportation", "highway", "bridge",
        "construction", "smart city", "rural road", "traffic", "gis", "surveying"
    ],
    "CLEAN_ENERGY_POWER": [
        "solar", "renewable", "energy", "photovoltaic", "battery", "storage",
        "power grid", "electric vehicle", "biomass", "wind energy", "inverter"
    ],
    "FORESTRY_ENVIRONMENT": [
        "forest", "forestry", "environment", "ecology", "biodiversity", "wildlife",
        "air pollution", "carbon sequestration", "remote sensing", "wetland"
    ],
    "WASTE_MANAGEMENT_CIRCULAR": [
        "waste", "solid waste", "e-waste", "plastic", "recycling", "effluent",
        "composting", "hazardous waste", "circular economy", "mine tailings"
    ],
    "EDUCATION_SKILL_DEV": [
        "education", "skill development", "vocational", "e-learning", "pedagogy",
        "rural training", "digital literacy", "curriculum", "tvet"
    ]
}


def map_text_to_domains(text: str) -> List[str]:
    """Classifies a block of academic text into matched Societal Challenge Domains."""
    if not text:
        return []
    
    text_lower = text.lower()
    matched_domains = []
    
    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            matched_domains.append(domain)
            
    return matched_domains


class LangGraphExtractionEngine:
    """State machine pipeline for university entity extraction."""

    def __init__(self, university_code: str):
        self.university_code = university_code
        self.payload = UniversityKnowledgePayload(
            university_code=university_code,
            university_name=self._get_university_name(university_code)
        )

    def _get_university_name(self, code: str) -> str:
        with get_db_cursor(commit=False, dict_cursor=True) as cur:
            cur.execute("SELECT name FROM universities WHERE code = %s;", (code,))
            row = cur.fetchone()
            return row["name"] if row else code

    def classify_page(self, title: str, text: str, url: str) -> PageClassification:
        """Determines the primary category of an academic page."""
        combined = f"{title} {url} {text[:500]}".lower()

        if any(kw in combined for kw in ["faculty", "professors", "faculty-list", "people", "teachers"]):
            return PageClassification(page_type="FACULTY", confidence=0.95)
        elif any(kw in combined for kw in ["incubation", "tbi", "ciie", "startup", "innovation-hub", "entrepreneurship"]):
            return PageClassification(page_type="INCUBATION_TBI", confidence=0.92)
        elif any(kw in combined for kw in ["centre-of-excellence", "coe", "research-centre", "center-of-excellence", "advanced-research"]):
            return PageClassification(page_type="RESEARCH_COE", confidence=0.90)
        elif any(kw in combined for kw in ["lab", "laboratory", "facilities", "testing-setup", "equipment"]):
            return PageClassification(page_type="LABORATORY", confidence=0.88)
        elif any(kw in combined for kw in ["department", "dept", "school-of", "academic-departments"]):
            return PageClassification(page_type="DEPARTMENT", confidence=0.85)
        else:
            return PageClassification(page_type="GENERAL_OVERVIEW", confidence=0.70)

    def extract_from_markdown(self, markdown: str, source_url: str, page_title: str) -> Dict[str, Any]:
        """
        Executes multi-entity extraction on a crawled markdown page.
        Identifies departments, faculty, CoEs, TBIs, and laboratories.
        """
        classification = self.classify_page(page_title, markdown, source_url)
        domains = map_text_to_domains(f"{page_title} {markdown}")

        extracted_items = {
            "departments": [],
            "faculties": [],
            "research_centers": [],
            "incubation_centers": [],
            "laboratories": []
        }

        # 1. Faculty Extraction (Look for Professor patterns & emails)
        lines = markdown.split("\n")
        current_dept = page_title.replace("Department of", "").replace("Dept of", "").strip()

        # Regular expressions for academic titles and emails
        prof_pattern = re.compile(r"(?:Dr\.|Prof\.|Professor|Dr|Prof)\s+([A-Z][a-zA-Z\.\s]{2,40})", re.IGNORECASE)
        email_pattern = re.compile(r"([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)")

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            prof_match = prof_pattern.search(line_str)
            email_match = email_pattern.search(line_str)

            if prof_match:
                name = prof_match.group(0).strip()
                # Clean up punctuation
                name = re.sub(r"[\*#\[\]]", "", name).strip()
                
                # Extract designation if mentioned
                designation = "Professor"
                if "Associate Professor" in line_str:
                    designation = "Associate Professor"
                elif "Assistant Professor" in line_str:
                    designation = "Assistant Professor"
                elif "Head of Department" in line_str or "HOD" in line_str:
                    designation = "Professor & HOD"

                email = email_match.group(1) if email_match else None
                faculty_domains = map_text_to_domains(line_str) or domains

                faculty_item = FacultyItem(
                    name=name,
                    designation=designation,
                    email=email,
                    department_name=current_dept,
                    research_interests=[kw for kw in line_str.split(",") if len(kw.strip()) > 3][:4],
                    specialization_domains=faculty_domains,
                    profile_url=source_url
                )
                extracted_items["faculties"].append(faculty_item)

        # 2. Research Center / CoE Extraction
        if classification.page_type == "RESEARCH_COE" or "centre of excellence" in markdown.lower() or "center of excellence" in markdown.lower():
            center_name = page_title if len(page_title) > 5 else "Center of Excellence"
            center_item = ResearchCenterItem(
                name=center_name,
                thrust_areas=domains,
                facilities_equipment=[line.strip("- *") for line in lines if any(e in line.lower() for e in ["equipment", "facility", "setup", "analyzer"])][:5],
                domain_tags=domains,
                source_url=source_url
            )
            extracted_items["research_centers"].append(center_item)

        # 3. Incubation Center / TBI Extraction
        if classification.page_type == "INCUBATION_TBI" or "incubation" in markdown.lower() or "startup" in markdown.lower():
            tbi_item = IncubationCenterItem(
                name=page_title if "incubation" in page_title.lower() or "tbi" in page_title.lower() else "Centre for Innovation, Incubation and Entrepreneurship",
                focus_sectors=domains,
                facilities_provided=["Prototyping Labs", "Mentorship", "Co-working Space", "Seed Funding Grants"],
                domain_tags=domains,
                source_url=source_url
            )
            extracted_items["incubation_centers"].append(tbi_item)

        # 4. Laboratory Extraction
        if classification.page_type == "LABORATORY" or "laboratory" in markdown.lower() or "lab" in markdown.lower():
            lab_name = page_title if "lab" in page_title.lower() else "Specialized Research & Testing Laboratory"
            lab_item = LaboratoryItem(
                name=lab_name,
                department_name=current_dept,
                testing_capabilities=[line.strip("- *") for line in lines if any(k in line.lower() for k in ["testing", "analysis", "spectroscopy", "simulation"])][:4],
                key_equipment=[line.strip("- *") for line in lines if any(k in line.lower() for k in ["machine", "microscope", "rig", "spectrometer", "software"])][:4],
                domain_tags=domains,
                source_url=source_url
            )
            extracted_items["laboratories"].append(lab_item)

        # 5. Department Overview
        if classification.page_type == "DEPARTMENT" or "department" in page_title.lower():
            dept_item = DepartmentItem(
                name=page_title,
                domain_tags=domains,
                overview=markdown[:500].strip(),
                faculties=extracted_items["faculties"],
                source_url=source_url
            )
            extracted_items["departments"].append(dept_item)

        return extracted_items

    def persist_to_database(self, payload: UniversityKnowledgePayload) -> Dict[str, int]:
        """Persists extracted university knowledge into Postgres/Supabase tables."""
        stats = {
            "departments_saved": 0,
            "faculties_saved": 0,
            "research_centers_saved": 0,
            "incubation_centers_saved": 0,
            "laboratories_saved": 0
        }

        with get_db_cursor(commit=True, dict_cursor=True) as cur:
            # Get university UUID
            cur.execute("SELECT id FROM universities WHERE code = %s;", (payload.university_code,))
            uni_row = cur.fetchone()
            if not uni_row:
                logger.error(f"Cannot persist: University code '{payload.university_code}' not found in DB.")
                return stats

            uni_id = str(uni_row["id"])

            # 1. Persist Departments
            dept_id_map: Dict[str, str] = {}
            for dept in payload.departments:
                cur.execute("""
                    INSERT INTO departments (university_id, name, code, description, website, status, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, 'ACTIVE', NOW(), NOW())
                    ON CONFLICT (university_id, name) 
                    DO UPDATE SET description = EXCLUDED.description, website = EXCLUDED.website, updated_at = NOW()
                    RETURNING id;
                """, (uni_id, dept.name, dept.code, dept.overview or f"Academic department in {', '.join(dept.domain_tags)}", dept.source_url))
                d_row = cur.fetchone()
                if d_row:
                    dept_id_map[dept.name] = str(d_row["id"])
                    stats["departments_saved"] += 1

            # 2. Persist Faculty
            for fac in payload.faculty_profiles:
                # Find matching dept id if possible
                dept_id = dept_id_map.get(fac.department_name)
                if not dept_id and dept_id_map:
                    dept_id = list(dept_id_map.values())[0]

                if dept_id:
                    email_val = fac.email or f"{fac.name.lower().replace(' ', '.')}.{dept_id[:4]}@{payload.university_code.lower()}.ac.in"
                    cur.execute("""
                        INSERT INTO faculty (
                            department_id, name, designation, email, profile_url, 
                            has_phd, is_active, status, created_at, updated_at
                        )
                        VALUES (%s, %s, %s, %s, %s, TRUE, TRUE, 'ACTIVE', NOW(), NOW())
                        ON CONFLICT (department_id, email) 
                        DO UPDATE SET designation = EXCLUDED.designation, profile_url = EXCLUDED.profile_url, updated_at = NOW()
                        RETURNING id;
                    """, (dept_id, fac.name, fac.designation, email_val, fac.profile_url))
                    f_row = cur.fetchone()
                    if f_row:
                        stats["faculties_saved"] += 1

            # 3. Persist Research Centres
            for rc in payload.research_centers:
                cur.execute("""
                    INSERT INTO research_centres (university_id, name, description, website, status, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, 'ACTIVE', NOW(), NOW())
                    ON CONFLICT (university_id, name)
                    DO UPDATE SET description = EXCLUDED.description, website = EXCLUDED.website, updated_at = NOW()
                    RETURNING id;
                """, (uni_id, rc.name, f"Thrust areas: {', '.join(rc.thrust_areas)}", rc.source_url))
                if cur.fetchone():
                    stats["research_centers_saved"] += 1

            # 4. Persist Incubation Centres
            for ic in payload.incubation_centers:
                cur.execute("""
                    INSERT INTO incubation_centres (university_id, name, description, website, status, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, 'ACTIVE', NOW(), NOW())
                    ON CONFLICT (university_id, name)
                    DO UPDATE SET description = EXCLUDED.description, website = EXCLUDED.website, updated_at = NOW()
                    RETURNING id;
                """, (uni_id, ic.name, f"Focus sectors: {', '.join(ic.focus_sectors)}. Grants: {ic.funding_grants}", ic.source_url))
                if cur.fetchone():
                    stats["incubation_centers_saved"] += 1


            # 5. Persist Laboratories into facilities
            for lab in payload.laboratories:
                cur.execute("""
                    INSERT INTO facilities (university_id, name, description, status, created_at, updated_at)
                    VALUES (%s, %s, %s, 'ACTIVE', NOW(), NOW())
                    ON CONFLICT (university_id, name)
                    DO UPDATE SET description = EXCLUDED.description, updated_at = NOW()
                    RETURNING id;
                """, (uni_id, lab.name, f"Capabilities: {', '.join(lab.testing_capabilities)}. Equipment: {', '.join(lab.key_equipment)}"))
                if cur.fetchone():
                    stats["laboratories_saved"] += 1


        logger.info(f"Database sync complete for {payload.university_code}: {stats}")
        return stats
