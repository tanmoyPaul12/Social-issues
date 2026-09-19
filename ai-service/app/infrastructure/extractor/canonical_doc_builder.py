"""
Canonical Knowledge Document Builder Module.
Transforms structured university entities (Faculty, Departments, Labs, Research Centres, TBIs) into
standardized, granular, highly dense semantic Markdown text passages optimized for E5 dense vector retrieval.
Implements hierarchical multi-passage chunking per entity (Profile, Publications, Patents, Sponsored Projects, Equipment).
"""
from typing import Dict, Any, List
from app.infrastructure.extractor.schemas import (
    FacultyItem, DepartmentItem, ResearchCenterItem,
    IncubationCenterItem, LaboratoryItem, UniversityKnowledgePayload,
    PublicationItem, PatentItem, ProjectItem, LabEquipmentItem
)


class CanonicalDocBuilder:
    """Formats structured entity objects into multi-passage canonical search chunks."""

    def build_faculty_passages(self, faculty: FacultyItem, uni_name: str, uni_code: str) -> List[Dict[str, Any]]:
        """Generates hierarchical search passages for a faculty member."""
        passages = []

        # 1. Profile Overview Passage
        interests_str = ", ".join(faculty.raw_research_interests) if faculty.raw_research_interests else "N/A"
        domains_str = ", ".join(faculty.specialization_domains) if faculty.specialization_domains else "N/A"
        teaching_str = ", ".join(faculty.teaching) if faculty.teaching else "N/A"
        awards_str = "; ".join(faculty.awards[:5]) if faculty.awards else "N/A"

        profile_text = (
            f"passage: University: {uni_name} ({uni_code})\n"
            f"Entity Type: FACULTY / PROFESSOR PROFILE\n"
            f"Faculty Name: {faculty.name}\n"
            f"Designation: {faculty.designation or 'Professor'}\n"
            f"Department: {faculty.department_name or 'Academic Department'}\n"
            f"Email: {faculty.email or 'N/A'}\n"
            f"Research Interests & Expertise: {interests_str}\n"
            f"Specialization Domains: {domains_str}\n"
            f"Teaching Subjects: {teaching_str}\n"
            f"Awards & Honors: {awards_str}\n"
            f"Profile URL: {faculty.profile_url or 'N/A'}"
        )
        passages.append({
            "chunk_type": "PROFILE",
            "passage_text": profile_text,
            "metadata": {
                "email": faculty.email,
                "department": faculty.department_name,
                "domains": faculty.specialization_domains,
                "profile_url": faculty.profile_url
            }
        })

        # 2. Publications Passage(s) - Clusters of 5-8 papers
        if faculty.publications:
            pub_items = faculty.publications
            chunk_size = 6
            for idx in range(0, len(pub_items), chunk_size):
                cluster = pub_items[idx:idx + chunk_size]
                pub_lines = []
                for p_idx, p in enumerate(cluster, 1):
                    if isinstance(p, str):
                        line = f"{p_idx}. Title: {p}"
                    else:
                        line = f"{p_idx}. Title: {p.title} | Journal/Publisher: {p.journal_or_publisher or 'Journal'} | Year: {p.year or 'N/A'}"
                        if p.doi_or_url:
                            line += f" | DOI: {p.doi_or_url}"
                    pub_lines.append(line)
                pub_text_block = "\n".join(pub_lines)

                pub_passage = (
                    f"passage: Research Publications & Journal Papers of {faculty.name} ({faculty.department_name or 'Faculty'}, {uni_name}):\n"
                    f"Specialization Domains: {domains_str}\n"
                    f"Published Papers Cluster {idx // chunk_size + 1}:\n"
                    f"{pub_text_block}\n"
                    f"Faculty Profile URL: {faculty.profile_url or 'N/A'}"
                )
                passages.append({
                    "chunk_type": "PUBLICATIONS",
                    "passage_text": pub_passage,
                    "metadata": {
                        "email": faculty.email,
                        "department": faculty.department_name,
                        "domains": faculty.specialization_domains,
                        "profile_url": faculty.profile_url
                    }
                })

        # 3. Patents Passage
        if faculty.patents:
            pat_lines = []
            for p_idx, pat in enumerate(faculty.patents, 1):
                if isinstance(pat, str):
                    line = f"{p_idx}. Patent: {pat}"
                else:
                    line = f"{p_idx}. Patent Title: {pat.title} | Status: {pat.status}"
                    if pat.patent_number:
                        line += f" | Patent No: {pat.patent_number}"
                pat_lines.append(line)
            pat_text_block = "\n".join(pat_lines)

            patent_passage = (
                f"passage: Granted & Filed Patents / Innovations of {faculty.name} ({faculty.department_name or 'Faculty'}, {uni_name}):\n"
                f"Specialization Domains: {domains_str}\n"
                f"{pat_text_block}\n"
                f"Faculty Profile URL: {faculty.profile_url or 'N/A'}"
            )
            passages.append({
                "chunk_type": "PATENTS",
                "passage_text": patent_passage,
                "metadata": {
                    "email": faculty.email,
                    "department": faculty.department_name,
                    "domains": faculty.specialization_domains,
                    "profile_url": faculty.profile_url
                }
            })

        # 4. Sponsored R&D Projects Passage
        if faculty.sponsored_projects:
            proj_lines = []
            for pr_idx, pr in enumerate(faculty.sponsored_projects, 1):
                if isinstance(pr, str):
                    line = f"{pr_idx}. Project: {pr}"
                else:
                    line = f"{pr_idx}. Project: {pr.project_name} | Sponsoring Agency: {pr.funding_agency or 'Funding Agency'}"
                    if pr.pi_name:
                        line += f" | PI: {pr.pi_name}"
                proj_lines.append(line)
            proj_text_block = "\n".join(proj_lines)

            project_passage = (
                f"passage: Sponsored R&D Grants & Funded Projects of {faculty.name} ({faculty.department_name or 'Faculty'}, {uni_name}):\n"
                f"Specialization Domains: {domains_str}\n"
                f"{proj_text_block}\n"
                f"Faculty Profile URL: {faculty.profile_url or 'N/A'}"
            )
            passages.append({
                "chunk_type": "PROJECTS",
                "passage_text": project_passage,
                "metadata": {
                    "email": faculty.email,
                    "department": faculty.department_name,
                    "domains": faculty.specialization_domains,
                    "profile_url": faculty.profile_url
                }
            })

        return passages

    def build_department_passages(self, dept: DepartmentItem, uni_name: str, uni_code: str) -> List[Dict[str, Any]]:
        """Generates search passages for an academic department."""
        passages = []
        domains_str = ", ".join(dept.domain_tags) if dept.domain_tags else "N/A"

        dept_text = (
            f"passage: University: {uni_name} ({uni_code})\n"
            f"Entity Type: ACADEMIC_DEPARTMENT\n"
            f"Department Name: {dept.name} ({dept.code or 'DEPT'})\n"
            f"Overview: {dept.overview or 'Academic Department'}\n"
            f"Associated Challenge Domains: {domains_str}\n"
            f"Source URL: {dept.source_url or 'N/A'}"
        )
        passages.append({
            "chunk_type": "DEPARTMENT_OVERVIEW",
            "passage_text": dept_text,
            "metadata": {
                "code": dept.code,
                "domains": dept.domain_tags,
                "source_url": dept.source_url
            }
        })

        if dept.ongoing_projects:
            proj_lines = []
            for p_idx, pr in enumerate(dept.ongoing_projects, 1):
                if isinstance(pr, str):
                    line = f"{p_idx}. Project: {pr}"
                else:
                    line = f"{p_idx}. Project: {pr.project_name} | Sponsoring Agency: {pr.funding_agency or 'Agency'}"
                    if pr.pi_name:
                        line += f" | PI: {pr.pi_name}"
                proj_lines.append(line)
            proj_text_block = "\n".join(proj_lines)

            proj_passage = (
                f"passage: Ongoing R&D Projects in Department {dept.name} ({uni_name}):\n"
                f"Associated Domains: {domains_str}\n"
                f"{proj_text_block}\n"
                f"Source URL: {dept.source_url or 'N/A'}"
            )
            passages.append({
                "chunk_type": "DEPARTMENT_PROJECTS",
                "passage_text": proj_passage,
                "metadata": {
                    "code": dept.code,
                    "domains": dept.domain_tags,
                    "source_url": dept.source_url
                }
            })

        return passages

    def build_research_center_passages(self, rc: ResearchCenterItem, uni_name: str, uni_code: str) -> List[Dict[str, Any]]:
        """Generates search passages for a research centre / CoE."""
        passages = []
        thrust_str = ", ".join(rc.thrust_areas) if rc.thrust_areas else "N/A"
        facilities_str = ", ".join(rc.facilities_equipment) if rc.facilities_equipment else "N/A"
        domains_str = ", ".join(rc.domain_tags) if rc.domain_tags else "N/A"

        rc_text = (
            f"passage: University: {uni_name} ({uni_code})\n"
            f"Entity Type: RESEARCH_CENTRE / CENTER_OF_EXCELLENCE\n"
            f"Center Name: {rc.name} ({rc.code or 'CoE'})\n"
            f"Lead Coordinator: {rc.lead_name or 'N/A'}\n"
            f"Thrust Research Areas: {thrust_str}\n"
            f"Facilities & Equipment Available: {facilities_str}\n"
            f"Associated Challenge Domains: {domains_str}\n"
            f"Source URL: {rc.source_url or 'N/A'}"
        )
        passages.append({
            "chunk_type": "COE_OVERVIEW",
            "passage_text": rc_text,
            "metadata": {
                "code": rc.code,
                "domains": rc.domain_tags,
                "source_url": rc.source_url
            }
        })

        if rc.projects:
            proj_lines = []
            for i, pr in enumerate(rc.projects, 1):
                if isinstance(pr, str):
                    proj_lines.append(f"{i}. {pr}")
                else:
                    proj_lines.append(f"{i}. {pr.project_name} | Agency: {pr.funding_agency}")
            proj_text = "\n".join(proj_lines)

            proj_passage = (
                f"passage: Research Projects at {rc.name} ({uni_name}):\n"
                f"Associated Domains: {domains_str}\n"
                f"{proj_text}\n"
                f"Source URL: {rc.source_url or 'N/A'}"
            )
            passages.append({
                "chunk_type": "COE_PROJECTS",
                "passage_text": proj_passage,
                "metadata": {
                    "code": rc.code,
                    "domains": rc.domain_tags,
                    "source_url": rc.source_url
                }
            })

        return passages

    def build_laboratory_passages(self, lab: LaboratoryItem, uni_name: str, uni_code: str) -> List[Dict[str, Any]]:
        """Generates search passages for a testing laboratory."""
        passages = []
        cap_str = ", ".join(lab.testing_capabilities) if lab.testing_capabilities else "N/A"
        equip_names = []
        for eq in lab.key_equipment:
            if isinstance(eq, str):
                equip_names.append(eq)
            else:
                equip_names.append(eq.name)
        equip_str = ", ".join(equip_names) if equip_names else "N/A"
        domains_str = ", ".join(lab.domain_tags) if lab.domain_tags else "N/A"

        lab_text = (
            f"passage: University: {uni_name} ({uni_code})\n"
            f"Entity Type: LABORATORY / TESTING_FACILITY\n"
            f"Lab Name: {lab.name}\n"
            f"Department: {lab.department_name or 'N/A'}\n"
            f"Testing Capabilities: {cap_str}\n"
            f"Key Analytical Equipment: {equip_str}\n"
            f"Societal Impact Application: {lab.societal_applicability or 'N/A'}\n"
            f"Associated Challenge Domains: {domains_str}\n"
            f"Source URL: {lab.source_url or 'N/A'}"
        )
        passages.append({
            "chunk_type": "LAB_OVERVIEW",
            "passage_text": lab_text,
            "metadata": {
                "department": lab.department_name,
                "domains": lab.domain_tags,
                "source_url": lab.source_url
            }
        })
        return passages

    def build_incubation_passages(self, ic: IncubationCenterItem, uni_name: str, uni_code: str) -> List[Dict[str, Any]]:
        """Generates search passages for an incubation centre / TBI."""
        passages = []
        sectors_str = ", ".join(ic.focus_sectors) if ic.focus_sectors else "N/A"
        facil_str = ", ".join(ic.facilities_provided) if ic.facilities_provided else "N/A"
        domains_str = ", ".join(ic.domain_tags) if ic.domain_tags else "N/A"
        portfolio_str = "; ".join(ic.portfolio_startups[:5]) if ic.portfolio_startups else "N/A"

        ic_text = (
            f"passage: University: {uni_name} ({uni_code})\n"
            f"Entity Type: INCUBATION_CENTRE / TBI\n"
            f"Incubator Name: {ic.name} ({ic.code or 'TBI'})\n"
            f"Supported Sectors: {sectors_str}\n"
            f"Prototyping & Grants Provided: {facil_str}\n"
            f"Funding Programs: {ic.funding_grants or 'N/A'}\n"
            f"Incubated Startups / Projects: {portfolio_str}\n"
            f"Associated Challenge Domains: {domains_str}\n"
            f"Source URL: {ic.source_url or 'N/A'}"
        )
        passages.append({
            "chunk_type": "TBI_OVERVIEW",
            "passage_text": ic_text,
            "metadata": {
                "code": ic.code,
                "grants": ic.funding_grants,
                "domains": ic.domain_tags,
                "source_url": ic.source_url
            }
        })
        return passages


doc_builder = CanonicalDocBuilder()
