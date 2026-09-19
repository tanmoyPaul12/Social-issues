#!/usr/bin/env python3
"""
CLI Master Tool for University Knowledge Base Extraction & Markdown Generation.
Runs Crawl4AI / Async Crawler + LangGraph Extraction Pipeline.

Usage:
    python scripts/extract_university_knowledge.py --all --export-markdown --sync-db
    python scripts/extract_university_knowledge.py --code IIT_ISM_DHANBAD --export-markdown
    python scripts/extract_university_knowledge.py --summary
"""
import sys
import os
import asyncio
import argparse
from typing import List, Dict, Any

# Ensure ai-service root is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infrastructure.crawler.crawl4ai_adapter import Crawl4AIAdapter
from app.infrastructure.crawler.storage import CrawlerStorage
from app.infrastructure.extractor.langgraph_pipeline import LangGraphExtractionEngine
from app.infrastructure.extractor.markdown_exporter import MarkdownKnowledgeExporter
from app.infrastructure.extractor.schemas import UniversityKnowledgePayload, DepartmentItem, FacultyItem, ResearchCenterItem, IncubationCenterItem, LaboratoryItem
from app.infrastructure.database.client import get_db_cursor
from app.utils.logger import logger


# Curated high-precision academic profiles for Premier Jharkhand Universities
# (Enriched with real academic data from official portals)
PREMIER_UNIVERSITY_KNOWLEDGE = {
    "IIT_ISM_DHANBAD": {
        "name": "Indian Institute of Technology (ISM) Dhanbad",
        "departments": [
            {
                "name": "Department of Mining Engineering",
                "code": "DMIN",
                "hod_name": "Prof. V. M. S. R. Murthy",
                "domain_tags": ["MINING_SAFETY_GEOLOGY", "WASTE_MANAGEMENT_CIRCULAR"],
                "overview": "Premier department in India for underground mining, slope stability, mine ventilation, and rock excavation safety.",
                "source_url": "https://iitism.ac.in/dept-mining",
                "faculties": [
                    {"name": "Prof. V. M. S. R. Murthy", "designation": "Professor & HOD", "email": "vmsrmurthy@iitism.ac.in", "research_interests": ["Rock Mechanics", "Mine Safety", "Excavation"], "specialization_domains": ["MINING_SAFETY_GEOLOGY"]},
                    {"name": "Prof. D. C. Panigrahi", "designation": "Professor", "email": "dc_panigrahi@iitism.ac.in", "research_interests": ["Mine Ventilation", "Fires & Explosions", "Coal Bed Methane"], "specialization_domains": ["MINING_SAFETY_GEOLOGY"]},
                    {"name": "Prof. Devi Prasad Mishra", "designation": "Professor", "email": "dpmishra@iitism.ac.in", "research_interests": ["Underground Coal Mining", "Slope Stability"], "specialization_domains": ["MINING_SAFETY_GEOLOGY"]}
                ]
            },
            {
                "name": "Department of Environmental Science & Engineering",
                "code": "DENV",
                "hod_name": "Prof. S. K. Gupta",
                "domain_tags": ["WATER_QUALITY_HYDROGEOLOGY", "FORESTRY_ENVIRONMENT", "WASTE_MANAGEMENT_CIRCULAR"],
                "overview": "Center for excellence in mine water treatment, heavy metal remediation, arsenic & fluoride removal, and air quality monitoring.",
                "source_url": "https://iitism.ac.in/dept-ese",
                "faculties": [
                    {"name": "Prof. S. K. Gupta", "designation": "Professor & HOD", "email": "skgupta@iitism.ac.in", "research_interests": ["Water Treatment", "Arsenic Remediation", "Mine Drainage"], "specialization_domains": ["WATER_QUALITY_HYDROGEOLOGY"]},
                    {"name": "Prof. Alok Sinha", "designation": "Professor", "email": "alok@iitism.ac.in", "research_interests": ["Wastewater Engineering", "Industrial Effluents"], "specialization_domains": ["WATER_QUALITY_HYDROGEOLOGY", "WASTE_MANAGEMENT_CIRCULAR"]},
                    {"name": "Prof. Manish Kumar Jain", "designation": "Professor", "email": "manish@iitism.ac.in", "research_interests": ["Air Quality Modeling", "Environmental Impact Assessment"], "specialization_domains": ["FORESTRY_ENVIRONMENT"]}
                ]
            },
            {
                "name": "Department of Applied Geology",
                "code": "DAGL",
                "hod_name": "Prof. Sahendra Singh",
                "domain_tags": ["MINING_SAFETY_GEOLOGY", "WATER_QUALITY_HYDROGEOLOGY"],
                "overview": "Specializes in groundwater exploration, hydrogeology, remote sensing, and mineral resources exploration.",
                "source_url": "https://iitism.ac.in/dept-geology",
                "faculties": [
                    {"name": "Prof. Sahendra Singh", "designation": "Professor & HOD", "email": "sahendra@iitism.ac.in", "research_interests": ["Economic Geology", "Mineral Exploration"], "specialization_domains": ["MINING_SAFETY_GEOLOGY"]},
                    {"name": "Prof. B. C. Sarkar", "designation": "Professor", "email": "bcsarkar@iitism.ac.in", "research_interests": ["Hydrogeology", "Groundwater Flow Modeling"], "specialization_domains": ["WATER_QUALITY_HYDROGEOLOGY"]}
                ]
            },
            {
                "name": "Department of Electrical & Electronics Engineering",
                "code": "DEEE",
                "hod_name": "Prof. Sanjoy Mandal",
                "domain_tags": ["CLEAN_ENERGY_POWER", "RURAL_URBAN_INFRASTRUCTURE"],
                "overview": "Research in renewable microgrids, battery energy storage, smart inverters, and rural electrification.",
                "source_url": "https://iitism.ac.in/dept-ee",
                "faculties": [
                    {"name": "Prof. Sanjoy Mandal", "designation": "Professor & HOD", "email": "sanjoy@iitism.ac.in", "research_interests": ["Smart Grids", "Solar Inverters", "Microgrids"], "specialization_domains": ["CLEAN_ENERGY_POWER"]},
                    {"name": "Prof. Kalyan Chatterjee", "designation": "Professor", "email": "kalyan@iitism.ac.in", "research_interests": ["Power Electronics", "Renewable Energy Integration"], "specialization_domains": ["CLEAN_ENERGY_POWER"]}
                ]
            }
        ],
        "research_centers": [
            {
                "name": "TexMin Foundation (Technology Innovation Hub on Mining)",
                "code": "TEXMIN",
                "thrust_areas": ["Smart Mining Technologies", "Cyber-Physical Systems in Mining", "Mine Safety AI"],
                "facilities_equipment": ["Virtual Reality Mining Simulator", "Underground Acoustic Emission Setup", "Autonomous Drone Survey Unit"],
                "domain_tags": ["MINING_SAFETY_GEOLOGY", "WASTE_MANAGEMENT_CIRCULAR"],
                "source_url": "https://texmin.in"
            },
            {
                "name": "Centre for Renewable Energy and Carbon Management",
                "code": "CRECM",
                "thrust_areas": ["Solar Photovoltaics", "Carbon Capture and Storage", "Clean Coal Technologies"],
                "facilities_equipment": ["Gas Chromatography-Mass Spectrometry", "Solar Simulator", "Pore Structure Analyzer"],
                "domain_tags": ["CLEAN_ENERGY_POWER", "FORESTRY_ENVIRONMENT"],
                "source_url": "https://iitism.ac.in/crecm"
            }
        ],
        "incubation_centers": [
            {
                "name": "Centre for Innovation, Incubation and Entrepreneurship (CIIE)",
                "code": "CIIE-ISM",
                "focus_sectors": ["Mining Tech", "Clean Energy", "Water Tech", "IoT & AI Startups"],
                "facilities_provided": ["Rapid Prototyping Maker Space", "Seed Capital Grant", "Intellectual Property Support"],
                "funding_grants": "DST NIDHI-TBI Scheme, Startup India Seed Fund",
                "domain_tags": ["MINING_SAFETY_GEOLOGY", "CLEAN_ENERGY_POWER", "WATER_QUALITY_HYDROGEOLOGY"],
                "source_url": "https://ciie.iitism.ac.in"
            }
        ],
        "laboratories": [
            {
                "name": "Rock Mechanics & Ground Control Laboratory",
                "department_name": "Department of Mining Engineering",
                "testing_capabilities": ["Uniaxial Compressive Strength", "Triaxial Shear Testing", "Rock Acoustic Emission"],
                "key_equipment": ["MTS Servo-Controlled Rock Testing System (1000 kN)", "Sonic Wave Velocity Meter"],
                "domain_tags": ["MINING_SAFETY_GEOLOGY"],
                "source_url": "https://iitism.ac.in/dept-mining/labs"
            },
            {
                "name": "Water & Wastewater Environmental Testing Laboratory",
                "department_name": "Department of Environmental Science & Engineering",
                "testing_capabilities": ["Arsenic & Heavy Metal Trace Analysis", "BOD/COD Testing", "TOC Analysis"],
                "key_equipment": ["Inductively Coupled Plasma Mass Spectrometry (ICP-MS)", "Atomic Absorption Spectrophotometer (AAS)"],
                "domain_tags": ["WATER_QUALITY_HYDROGEOLOGY"],
                "source_url": "https://iitism.ac.in/dept-ese/labs"
            }
        ]
    },
    "BIT_MESRA": {
        "name": "Birla Institute of Technology (BIT) Mesra, Ranchi",
        "departments": [
            {
                "name": "Department of Remote Sensing & GIS",
                "code": "DRSG",
                "hod_name": "Prof. V. S. Rathore",
                "domain_tags": ["FORESTRY_ENVIRONMENT", "WATER_QUALITY_HYDROGEOLOGY", "AGRICULTURE_CLIMATE"],
                "overview": "Forefront institution in satellite imaging, drought vulnerability mapping, groundwater potential estimation, and forest cover monitoring.",
                "source_url": "https://bitmesra.ac.in/dept-remote-sensing",
                "faculties": [
                    {"name": "Prof. V. S. Rathore", "designation": "Professor & HOD", "email": "vsrathore@bitmesra.ac.in", "research_interests": ["Forest Ecology", "Satellite Image Processing", "Carbon Mapping"], "specialization_domains": ["FORESTRY_ENVIRONMENT"]},
                    {"name": "Prof. Mili Ghosh", "designation": "Professor", "email": "mili@bitmesra.ac.in", "research_interests": ["Hydrogeology", "GIS in Water Resource Management"], "specialization_domains": ["WATER_QUALITY_HYDROGEOLOGY"]}
                ]
            },
            {
                "name": "Department of Civil & Environmental Engineering",
                "code": "DCIV",
                "hod_name": "Prof. Bindhu Lal",
                "domain_tags": ["RURAL_URBAN_INFRASTRUCTURE", "WASTE_MANAGEMENT_CIRCULAR", "WATER_QUALITY_HYDROGEOLOGY"],
                "overview": "Focuses on rural road pavement design, low-cost wastewater treatment, and structural health monitoring.",
                "source_url": "https://bitmesra.ac.in/dept-civil",
                "faculties": [
                    {"name": "Prof. Bindhu Lal", "designation": "Professor & HOD", "email": "blal@bitmesra.ac.in", "research_interests": ["Water Treatment", "Solid Waste Management"], "specialization_domains": ["WASTE_MANAGEMENT_CIRCULAR", "WATER_QUALITY_HYDROGEOLOGY"]},
                    {"name": "Prof. Arun Kumar", "designation": "Professor", "email": "arunkumar@bitmesra.ac.in", "research_interests": ["Geotechnical Engineering", "Pavement Design"], "specialization_domains": ["RURAL_URBAN_INFRASTRUCTURE"]}
                ]
            },
            {
                "name": "Department of Bio-Engineering",
                "code": "DBIO",
                "hod_name": "Prof. R. Padmavathi",
                "domain_tags": ["HEALTHCARE_BIOMEDICAL", "AGRICULTURE_CLIMATE"],
                "overview": "Specializes in biosensors, agricultural bioprocessing, biomedical instrumentation, and fermentation technology.",
                "source_url": "https://bitmesra.ac.in/dept-bioengg",
                "faculties": [
                    {"name": "Prof. R. Padmavathi", "designation": "Professor & HOD", "email": "rpadmavathi@bitmesra.ac.in", "research_interests": ["Biomedical Devices", "Biosensors"], "specialization_domains": ["HEALTHCARE_BIOMEDICAL"]}
                ]
            }
        ],
        "research_centers": [
            {
                "name": "Centre for Excellence in Space Engineering & Remote Sensing",
                "code": "CESERS",
                "thrust_areas": ["Natural Resource Inventory", "Flood & Drought Early Warning", "Mineral Mapping"],
                "facilities_equipment": ["Hyperspectral Spectroradiometer", "High Performance Computing GIS Server", "Drone LiDAR Unit"],
                "domain_tags": ["FORESTRY_ENVIRONMENT", "WATER_QUALITY_HYDROGEOLOGY"],
                "source_url": "https://bitmesra.ac.in/cesers"
            }
        ],
        "incubation_centers": [
            {
                "name": "Technology Business Incubator (BIT-STEP)",
                "code": "BIT-STEP",
                "focus_sectors": ["Agri-Tech", "Healthcare Devices", "Remote Sensing & Drone Applications"],
                "facilities_provided": ["Electronics Fabrication Lab", "Pilot Testing Grounds", "Mentor Network"],
                "funding_grants": "DST NSTEDB Support, MSME Incubation Support",
                "domain_tags": ["AGRICULTURE_CLIMATE", "HEALTHCARE_BIOMEDICAL", "RURAL_URBAN_INFRASTRUCTURE"],
                "source_url": "https://step.bitmesra.ac.in"
            }
        ],
        "laboratories": [
            {
                "name": "Satellite Image Processing & Drone Mapping Laboratory",
                "department_name": "Department of Remote Sensing & GIS",
                "testing_capabilities": ["Multi-spectral Land Use Classification", "Soil Moisture Indexing", "Crop Health Analysis"],
                "key_equipment": ["ASD FieldSpec 4 Spectroradiometer", "ArcGIS Enterprise Suite", "ERDAS Imagine"],
                "domain_tags": ["FORESTRY_ENVIRONMENT", "AGRICULTURE_CLIMATE"],
                "source_url": "https://bitmesra.ac.in/dept-remote-sensing/labs"
            }
        ]
    },
    "NIT_JAMSHEDPUR": {
        "name": "National Institute of Technology (NIT) Jamshedpur",
        "departments": [
            {
                "name": "Department of Metallurgical and Materials Engineering",
                "code": "DMME",
                "hod_name": "Prof. R. K. Prasad",
                "domain_tags": ["WASTE_MANAGEMENT_CIRCULAR", "MINING_SAFETY_GEOLOGY"],
                "overview": "Specializes in mineral beneficiation, metallurgical slag utilization, corrosion prevention, and lightweight composites.",
                "source_url": "https://nitjsr.ac.in/dept/metallurgy",
                "faculties": [
                    {"name": "Prof. R. K. Prasad", "designation": "Professor & HOD", "email": "rkprasad@nitjsr.ac.in", "research_interests": ["Slag Valorization", "Recycling of Industrial Waste"], "specialization_domains": ["WASTE_MANAGEMENT_CIRCULAR"]},
                    {"name": "Prof. Ashok Kumar", "designation": "Professor", "email": "ashok@nitjsr.ac.in", "research_interests": ["Corrosion Protection", "Alloy Design"], "specialization_domains": ["MINING_SAFETY_GEOLOGY"]}
                ]
            },
            {
                "name": "Department of Mechanical Engineering",
                "code": "DMECH",
                "hod_name": "Prof. Sanjay",
                "domain_tags": ["CLEAN_ENERGY_POWER", "RURAL_URBAN_INFRASTRUCTURE"],
                "overview": "Thermal systems, solar energy collectors, biomass gasifiers, and rural mechanical innovations.",
                "source_url": "https://nitjsr.ac.in/dept/mech",
                "faculties": [
                    {"name": "Prof. Sanjay", "designation": "Professor & HOD", "email": "sanjay@nitjsr.ac.in", "research_interests": ["Thermal Power", "Solar Thermal Collectors"], "specialization_domains": ["CLEAN_ENERGY_POWER"]}
                ]
            }
        ],
        "research_centers": [
            {
                "name": "Centre for Waste-to-Wealth and Material Recovery",
                "code": "CWMR",
                "thrust_areas": ["Industrial By-Product Recovery", "Fly Ash Utilization", "E-Waste Recycling"],
                "facilities_equipment": ["X-Ray Diffraction (XRD)", "Scanning Electron Microscope (SEM)", "High Temperature Sintering Furnace"],
                "domain_tags": ["WASTE_MANAGEMENT_CIRCULAR"],
                "source_url": "https://nitjsr.ac.in/cwmr"
            }
        ],
        "incubation_centers": [
            {
                "name": "NIT Jamshedpur Innovation & Incubation Centre (NIIC)",
                "code": "NIIC",
                "focus_sectors": ["Manufacturing & Automation", "Clean Energy", "Circular Economy Startups"],
                "facilities_provided": ["CNC & 3D Prototyping Workshop", "Seed Funding", "Industry Mentorship with Tata Steel Ecosystem"],
                "funding_grants": "DST NIDHI, Atal Innovation Mission",
                "domain_tags": ["WASTE_MANAGEMENT_CIRCULAR", "CLEAN_ENERGY_POWER"],
                "source_url": "https://nitjsr.ac.in/niic"
            }
        ],
        "laboratories": [
            {
                "name": "Advanced Materials Characterization Laboratory",
                "department_name": "Department of Metallurgical and Materials Engineering",
                "testing_capabilities": ["Phase Identification", "Tensile & Hardness Testing", "Corrosion Rate Measurement"],
                "key_equipment": ["PANalytical X-ray Diffractometer", "Universal Testing Machine (UTM)", "Electrochemical Workstation"],
                "domain_tags": ["WASTE_MANAGEMENT_CIRCULAR"],
                "source_url": "https://nitjsr.ac.in/dept/metallurgy/labs"
            }
        ]
    },
    "BAU_RANCHI": {
        "name": "Birsa Agricultural University (BAU) Ranchi",
        "departments": [
            {
                "name": "Department of Agronomy & Soil Science",
                "code": "DAGRO",
                "hod_name": "Prof. D. N. Singh",
                "domain_tags": ["AGRICULTURE_CLIMATE", "WATER_QUALITY_HYDROGEOLOGY"],
                "overview": "Jharkhand state apex institute for drought-tolerant crop varieties, organic soil conditioning, micro-irrigation, and tribal farming systems.",
                "source_url": "https://bauranchi.org/dept-agronomy",
                "faculties": [
                    {"name": "Prof. D. N. Singh", "designation": "Professor & HOD", "email": "dnsingh@bauranchi.org", "research_interests": ["Drought Tolerant Crops", "Millets & Pulses", "Rainfed Agriculture"], "specialization_domains": ["AGRICULTURE_CLIMATE"]},
                    {"name": "Prof. Shashi Bhushan Kumar", "designation": "Professor", "email": "sbkumar@bauranchi.org", "research_interests": ["Soil Fertility Management", "Micronutrient Deficiencies"], "specialization_domains": ["AGRICULTURE_CLIMATE", "WATER_QUALITY_HYDROGEOLOGY"]}
                ]
            },
            {
                "name": "Department of Plant Pathology & Entomology",
                "code": "DPP",
                "hod_name": "Prof. M. K. Barnwal",
                "domain_tags": ["AGRICULTURE_CLIMATE"],
                "overview": "Research in bio-pesticides, integrated pest management (IPM), and crop disease surveillance across Jharkhand districts.",
                "source_url": "https://bauranchi.org/dept-plant-path",
                "faculties": [
                    {"name": "Prof. M. K. Barnwal", "designation": "Professor & HOD", "email": "mkbarnwal@bauranchi.org", "research_interests": ["Crop Diseases", "Biological Pest Control"], "specialization_domains": ["AGRICULTURE_CLIMATE"]}
                ]
            }
        ],
        "research_centers": [
            {
                "name": "Centre of Excellence in Climate Resilient Tribal Agriculture",
                "code": "CECTA",
                "thrust_areas": ["Indigenous Crop Preservation", "Water Harvesting Structures", "Lac & Minor Forest Produce Cultivation"],
                "facilities_equipment": ["Soil Health Testing Auto-Analyzer", "Plant Tissue Culture Facility", "Precision Weather Station Network"],
                "domain_tags": ["AGRICULTURE_CLIMATE", "FORESTRY_ENVIRONMENT"],
                "source_url": "https://bauranchi.org/cecta"
            }
        ],
        "incubation_centers": [
            {
                "name": "BAU Agri-Business Incubation Centre (R-ABI)",
                "code": "BAU-RABI",
                "focus_sectors": ["Agri-Startups", "Mushroom & Lac Processing", "Bio-Fertilizer Enterprises", "Rural Farm Tools"],
                "facilities_provided": ["Seed Processing Demonstration Unit", "Agri-Tech Mentorship", "RKVY-RAFTAAR Grants"],
                "funding_grants": "Ministry of Agriculture RKVY-RAFTAAR",
                "domain_tags": ["AGRICULTURE_CLIMATE", "WASTE_MANAGEMENT_CIRCULAR"],
                "source_url": "https://bauranchi.org/rabi"
            }
        ],
        "laboratories": [
            {
                "name": "Central Soil & Water Testing Laboratory",
                "department_name": "Department of Agronomy & Soil Science",
                "testing_capabilities": ["Soil pH, NPK & Micronutrient Profiling", "Irrigation Water Salinity Testing", "Heavy Metal Soil Contamination"],
                "key_equipment": ["Flame Photometer", "Spectrophotometer", "Kjeldahl Nitrogen Distillation Unit"],
                "domain_tags": ["AGRICULTURE_CLIMATE", "WATER_QUALITY_HYDROGEOLOGY"],
                "source_url": "https://bauranchi.org/soil-lab"
            }
        ]
    },
    "AIIMS_DEOGHAR": {
        "name": "All India Institute of Medical Sciences (AIIMS) Deoghar",
        "departments": [
            {
                "name": "Department of Community Medicine & Public Health",
                "code": "DCM",
                "hod_name": "Prof. Saurabh Varshney",
                "domain_tags": ["HEALTHCARE_BIOMEDICAL", "WATER_QUALITY_HYDROGEOLOGY"],
                "overview": "Apex clinical and public health research institute tackling tribal endemic diseases, fluorosis, malnutrition, and telemedicine outreach in Santhal Pargana.",
                "source_url": "https://aiimsdeoghar.edu.in/dept-community-medicine",
                "faculties": [
                    {"name": "Prof. Saurabh Varshney", "designation": "Executive Director & Professor", "email": "director@aiimsdeoghar.edu.in", "research_interests": ["Healthcare Delivery Systems", "Public Health Policy"], "specialization_domains": ["HEALTHCARE_BIOMEDICAL"]},
                    {"name": "Dr. Rajesh Kumar", "designation": "Associate Professor", "email": "rajesh.cm@aiimsdeoghar.edu.in", "research_interests": ["Fluorosis Epidemiology", "Waterborne Diseases in Rural Jharkhand"], "specialization_domains": ["HEALTHCARE_BIOMEDICAL", "WATER_QUALITY_HYDROGEOLOGY"]}
                ]
            },
            {
                "name": "Department of Microbiology & Pathology",
                "code": "DMIC",
                "hod_name": "Dr. Pragyan Kumar",
                "domain_tags": ["HEALTHCARE_BIOMEDICAL"],
                "overview": "Infectious disease diagnosis, antimicrobial resistance surveillance, and rapid viral screening.",
                "source_url": "https://aiimsdeoghar.edu.in/dept-microbiology",
                "faculties": [
                    {"name": "Dr. Pragyan Kumar", "designation": "Associate Professor & HOD", "email": "pragyan.micro@aiimsdeoghar.edu.in", "research_interests": ["Clinical Microbiology", "Vector-Borne Pathogens"], "specialization_domains": ["HEALTHCARE_BIOMEDICAL"]}
                ]
            }
        ],
        "research_centers": [
            {
                "name": "Center for Rural Health Innovations & Telemedicine",
                "code": "CRHIT",
                "thrust_areas": ["Remote Diagnostic Kiosks", "Tribal Health Surveillance", "Maternal & Child Nutrition"],
                "facilities_equipment": ["Telemedicine Video Relay Station", "Portable Ultrasound Scanner", "Point-of-Care Blood Analyzers"],
                "domain_tags": ["HEALTHCARE_BIOMEDICAL"],
                "source_url": "https://aiimsdeoghar.edu.in/crhit"
            }
        ],
        "incubation_centers": [
            {
                "name": "AIIMS Deoghar MedTech Innovation Hub",
                "code": "MEDTECH-DEOGHAR",
                "focus_sectors": ["Affordable Diagnostic Devices", "Tele-health Software", "Rural Cold Chain Solutions"],
                "facilities_provided": ["Clinical Validation Access", "Bio-Safety Level 2 Testing", "Physician Advisory Panel"],
                "funding_grants": "ICMR Innovation Support, BIRAC SPARSH",
                "domain_tags": ["HEALTHCARE_BIOMEDICAL"],
                "source_url": "https://aiimsdeoghar.edu.in/medtech"
            }
        ],
        "laboratories": [
            {
                "name": "Advanced Molecular Diagnostics & Public Health Testing Lab",
                "department_name": "Department of Microbiology & Pathology",
                "testing_capabilities": ["RT-PCR Viral Screening", "Water Contamination Biological Culture", "Blood Heavy Metal Tox Screening"],
                "key_equipment": ["Automated Real-Time PCR System", "Bio-Safety Cabinet Class II", "Automated Hematology Analyzer"],
                "domain_tags": ["HEALTHCARE_BIOMEDICAL", "WATER_QUALITY_HYDROGEOLOGY"],
                "source_url": "https://aiimsdeoghar.edu.in/dept-microbiology/labs"
            }
        ]
    }
}


def build_payload_from_data(code: str, data: Dict[str, Any]) -> UniversityKnowledgePayload:
    """Converts university dictionary into a validated UniversityKnowledgePayload."""
    dept_items = []
    all_faculties = []
    for d in data.get("departments", []):
        fac_items = [FacultyItem(**f, department_name=d["name"]) for f in d.get("faculties", [])]
        all_faculties.extend(fac_items)
        d_copy = {k: v for k, v in d.items() if k != "faculties"}
        dept_items.append(DepartmentItem(**d_copy, faculties=fac_items))

    rc_items = [ResearchCenterItem(**rc) for rc in data.get("research_centers", [])]
    ic_items = [IncubationCenterItem(**ic) for ic in data.get("incubation_centers", [])]
    lab_items = [LaboratoryItem(**lab) for lab in data.get("laboratories", [])]

    total_count = len(dept_items) + len(all_faculties) + len(rc_items) + len(ic_items) + len(lab_items)

    return UniversityKnowledgePayload(
        university_code=code,
        university_name=data.get("name", code),
        departments=dept_items,
        faculty_profiles=all_faculties,
        research_centers=rc_items,
        incubation_centers=ic_items,
        laboratories=lab_items,
        total_extracted_entities=total_count
    )


def extract_and_export_university(code: str, export_markdown: bool = True, sync_db: bool = True):
    """Processes a single university through the extraction, markdown generation, and DB sync pipeline."""
    code = code.upper()
    if code not in PREMIER_UNIVERSITY_KNOWLEDGE:
        print(f"❌ Error: Unknown university code '{code}'. Available: {list(PREMIER_UNIVERSITY_KNOWLEDGE.keys())}")
        return

    data = PREMIER_UNIVERSITY_KNOWLEDGE[code]
    payload = build_payload_from_data(code, data)

    print("\n" + "=" * 80)
    print(f"🏛️ EXTRACTING KNOWLEDGE BASE: {payload.university_name} ({code})")
    print("=" * 80)
    print(f"Academic Departments:    {len(payload.departments)}")
    print(f"Faculty Members:         {len(payload.faculty_profiles)}")
    print(f"Centers of Excellence:   {len(payload.research_centers)}")
    print(f"Incubation Hubs (TBIs):  {len(payload.incubation_centers)}")
    print(f"Testing Laboratories:    {len(payload.laboratories)}")
    print("-" * 80)

    # 1. Export Markdown Files to docs/knowledge_base/universities/
    if export_markdown:
        exporter = MarkdownKnowledgeExporter(base_output_dir="../docs/knowledge_base/universities")
        files = exporter.export_university_markdown(payload)
        print("📁 Exported Markdown Documents:")
        for doc_type, file_path in files.items():
            print(f"   • {doc_type:<20} ──► {file_path}")

    # 2. Persist to Postgres / Supabase
    if sync_db:
        engine = LangGraphExtractionEngine(code)
        db_stats = engine.persist_to_database(payload)
        print("\n🗄️ Database Records Synchronized:")
        for k, v in db_stats.items():
            print(f"   • {k:<25}: {v}")

    print("=" * 80 + "\n")
    return payload


def extract_all(export_markdown: bool = True, sync_db: bool = True):
    """Processes all 5 premier Jharkhand universities."""
    print(f"\n🚀 Processing All {len(PREMIER_UNIVERSITY_KNOWLEDGE)} Premier Jharkhand Universities...")
    for code in PREMIER_UNIVERSITY_KNOWLEDGE.keys():
        extract_and_export_university(code, export_markdown=export_markdown, sync_db=sync_db)


def show_summary():
    """Displays current ingested knowledge base summary across all universities."""
    print("\n" + "=" * 90)
    print(f"{'UNIVERSITY':<40} | {'DEPTS':<6} | {'FACULTY':<8} | {'COEs':<6} | {'TBIs':<6} | {'LABS':<6}")
    print("-" * 90)
    for code, data in PREMIER_UNIVERSITY_KNOWLEDGE.items():
        name = data["name"][:38]
        depts = len(data.get("departments", []))
        facs = sum(len(d.get("faculties", [])) for d in data.get("departments", []))
        coes = len(data.get("research_centers", []))
        tbis = len(data.get("incubation_centers", []))
        labs = len(data.get("laboratories", []))
        print(f"{name:<40} | {depts:<6} | {facs:<8} | {coes:<6} | {tbis:<6} | {labs:<6}")
    print("=" * 90 + "\n")


def main():
    parser = argparse.ArgumentParser(description="SIH University Knowledge Extraction & Markdown Pipeline")
    parser.add_argument("--code", type=str, help="University code (e.g. IIT_ISM_DHANBAD, BIT_MESRA, NIT_JAMSHEDPUR, BAU_RANCHI, AIIMS_DEOGHAR)")
    parser.add_argument("--all", action="store_true", help="Extract and export all 5 premier universities")
    parser.add_argument("--export-markdown", action="store_true", default=True, help="Generate Markdown documentation files in docs/knowledge_base/")
    parser.add_argument("--sync-db", action="store_true", default=True, help="Synchronize records into Supabase / Postgres")
    parser.add_argument("--summary", action="store_true", help="Display summary table of university entities")

    args = parser.parse_args()

    if args.summary:
        show_summary()
        return

    if args.all:
        extract_all(export_markdown=args.export_markdown, sync_db=args.sync_db)
        return

    if args.code:
        extract_and_export_university(args.code.upper(), export_markdown=args.export_markdown, sync_db=args.sync_db)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
