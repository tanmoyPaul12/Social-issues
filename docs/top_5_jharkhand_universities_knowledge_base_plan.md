# 🏛️ Top 5 Jharkhand Universities Knowledge Base & Crawler Blueprint

This document details the targeted execution plan for building the **Knowledge Base & Capability Graph** for the **Top 5 Premier Higher Education Institutions in Jharkhand** for the SIH Societal Innovation & University Routing Engine.

---

## 🎯 1. The Top 5 Institutions & Core Capability Focus

```
                       ┌─────────────────────────────────────────────────────────┐
                       │  TOP 5 PREMIER UNIVERSITIES IN JHARKHAND                │
                       └─────────────────────────────────────────────────────────┘
                                                    │
         ┌──────────────────┬───────────────────────┼──────────────────────┬──────────────────┐
         ▼                  ▼                       ▼                      ▼                  ▼
┌──────────────────┐ ┌──────────────┐      ┌─────────────────┐    ┌─────────────────┐ ┌──────────────┐
│  IIT ISM Dhanbad │ │  BIT Mesra   │      │ NIT Jamshedpur  │    │   BAU Ranchi    │ │ AIIMS Deoghar│
│ (Mining/Earth/Env│ │(Water/Bio/CS)│      │(Mfg/Civil/Met)  │    │ (Agro/Soil/Irr) │ │(Health/Diag) │
└──────────────────┘ └──────────────┘      └─────────────────┘    └─────────────────┘ └──────────────┘
```

| Institution | Code | Location | Critical Domain Focus | Official Portal | Key Focus Areas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IIT (ISM) Dhanbad** | `IIT_ISM_DHANBAD` | Dhanbad | Mining, Environmental Engg, Earth Sciences, Robotics | `https://www.iitism.ac.in` | Environmental Science, Mining Machineries, Geosciences, Clean Coal Tech, Water Remediation |
| **BIT Mesra** | `BIT_MESRA` | Ranchi | Water Resources, Biotechnology, Remote Sensing, Space Engg | `https://www.bitmesra.ac.in` | CEE (Water Resource Testing), Remote Sensing & GIS, Pharmaceutical Science, Central Instrumentation Facility |
| **NIT Jamshedpur** | `NIT_JAMSHEDPUR` | Jamshedpur | Manufacturing, Metallurgical, Structural & Civil Engg | `https://www.nitjsr.ac.in` | Heavy Engineering, Materials Testing, Renewable Energy Hub, Structural Diagnostics |
| **Birsa Agricultural University** | `BAU_RANCHI` | Ranchi | Agronomy, Soil Science, Micro-Irrigation, Horticulture | `https://www.bauranchi.org` | Soil Chemistry, Drought-resistant crops, Watershed Management, Farm Mechanization |
| **AIIMS Deoghar** | `AIIMS_DEOGHAR` | Deoghar | Rural Healthcare, Clinical Diagnostics, Community Health | `https://www.aiimsdeoghar.edu.in` | Telemedicine, Epidemiological Studies, Water-borne Pathogen Analysis, Community Medicine |

---

## 🔍 2. Detailed Target Map & High-Value URL Patterns per University

### 2.1 Institution 1: IIT (ISM) Dhanbad
- **Base Domain:** `https://www.iitism.ac.in`
- **Target Departments:**
  - Dept of Environmental Science & Engineering (`/depts/ese`)
  - Dept of Civil Engineering (`/depts/civil`)
  - Dept of Mining Engineering (`/depts/mining`)
  - Centre of Excellence in Water Resources (`/centres/water-centre`)
- **Key Labs to Ingest:** Environmental Pollution Testing Lab, Mine Safety & Air Quality Lab, Remote Sensing Center.
- **Inclusion Regex:** `^https://www\.iitism\.ac\.in/(depts|faculty|research|centres|facilities)/.*$`
- **Exclusion Regex:** `^.*(admission|fee|placement|tender|hall-ticket|convocation|alumni-giving).*$`

### 2.2 Institution 2: BIT Mesra, Ranchi
- **Base Domain:** `https://www.bitmesra.ac.in`
- **Target Departments:**
  - Dept of Civil and Environmental Engineering (`/cee`)
  - Dept of Bio-Engineering and Biotechnology (`/biotech`)
  - Dept of Remote Sensing (`/remote-sensing`)
  - Technology Business Incubator (BIT-TBI) (`/tbi`)
- **Key Labs to Ingest:** Water Quality Testing Lab, Environmental Engineering Research Lab, Central Instrumentation Facility (CIF).
- **Inclusion Regex:** `^https://(www\.)?bitmesra\.ac\.in/(department|faculty|research|tbi|facilities)/.*$`

### 2.3 Institution 3: NIT Jamshedpur
- **Base Domain:** `https://www.nitjsr.ac.in`
- **Target Departments:**
  - Dept of Civil Engineering (`/department/civil-engineering`)
  - Dept of Metallurgical and Materials Engineering (`/department/meta`)
  - Centre for Renewable Energy and Sustainability (`/research/centres`)
- **Key Labs to Ingest:** Soil Mechanics & Foundation Lab, Environmental Geotechnology Lab, Advanced Materials Characterization Hub.
- **Inclusion Regex:** `^https://(www\.)?nitjsr\.ac\.in/(department|faculty|research|facilities)/.*$`

### 2.4 Institution 4: Birsa Agricultural University (BAU), Ranchi
- **Base Domain:** `https://www.bauranchi.org`
- **Target Departments:**
  - Dept of Soil Science and Agricultural Chemistry (`/ssac`)
  - Dept of Agronomy & Crop Physiology (`/agronomy`)
  - Dept of Agricultural Engineering & Micro-Irrigation (`/agri-engg`)
  - Krishi Vigyan Kendra (KVK) Extension Research Centers (`/kvk`)
- **Key Labs to Ingest:** Soil Testing Lab, Water Management Testing Bed, Bio-fertilizer Testing Unit.
- **Inclusion Regex:** `^https://(www\.)?bauranchi\.org/(faculty|departments|research|facilities|kvk)/.*$`

### 2.5 Institution 5: AIIMS Deoghar
- **Base Domain:** `https://www.aiimsdeoghar.edu.in`
- **Target Departments:**
  - Dept of Community Medicine & Public Health (`/departments/community-medicine`)
  - Dept of Microbiology & Pathogen Surveillance (`/departments/microbiology`)
  - Diagnostic & Telemedicine Hub (`/facilities/telemedicine`)
- **Key Labs to Ingest:** Water-borne Disease Surveillance Lab, Clinical Epidemiology Lab.
- **Inclusion Regex:** `^https://(www\.)?aiimsdeoghar\.edu\.in/(faculty|department|research|facilities)/.*$`

---

## ⚙️ 3. Execution Pipeline (The 4-Step Crawl & Knowledge Builder)

```
[ Crawl Targets (Top 5 Univs) ]
               │
               ▼
   [ 1. Safe Async Crawler ] ──(Rate Limit: 2s, SSRF Guard, Trafilatura)
               │
               ▼
     [ 2. Supabase DB ] ──────(crawled_pages: clean markdown + SHA-256 hash)
               │
               ▼
 [ 3. LangGraph Extractor ] ──(PydanticAI / Instructor Agent)
               │
               ├──► faculty table (Dr. X, Designation, Research Focus)
               ├──► facilities table (Lab capabilities, heavy metal analysis)
               ├──► faculty_expertise / facility_expertise (Taxonomy Node Linkage)
               └──► evidence_claims (Provenance URL, Confidence 0.95+, Verified)
               │
               ▼
 [ 4. BGE-M3 Embeddings ] ───(pgvector embeddings_store for Vector Routing)
```

---

## 🗄️ 4. Seed Data Schema Definition for Top 5 (`crawl_configuration_seed.py`)

Each university entry defines exact limits, crawler rules, and high-priority starting seeds:

```python
TOP_5_JHARKHAND_CONFIGS = [
    {
        "university_code": "IIT_ISM_DHANBAD",
        "name": "Indian Institute of Technology (ISM) Dhanbad",
        "base_url": "https://www.iitism.ac.in",
        "district": "Dhanbad",
        "allowed_domains": ["iitism.ac.in", "www.iitism.ac.in"],
        "max_depth": 3,
        "crawl_delay_seconds": 2,
        "max_pages": 400,
        "target_seeds": [
            "https://www.iitism.ac.in/depts/environmental-science",
            "https://www.iitism.ac.in/depts/civil",
            "https://www.iitism.ac.in/centres/water-centre"
        ]
    },
    {
        "university_code": "BIT_MESRA",
        "name": "Birla Institute of Technology (BIT) Mesra",
        "base_url": "https://www.bitmesra.ac.in",
        "district": "Ranchi",
        "allowed_domains": ["bitmesra.ac.in", "www.bitmesra.ac.in"],
        "max_depth": 3,
        "crawl_delay_seconds": 2,
        "max_pages": 400,
        "target_seeds": [
            "https://www.bitmesra.ac.in/cee",
            "https://www.bitmesra.ac.in/biotech",
            "https://www.bitmesra.ac.in/facilities"
        ]
    },
    {
        "university_code": "NIT_JAMSHEDPUR",
        "name": "National Institute of Technology (NIT) Jamshedpur",
        "base_url": "https://www.nitjsr.ac.in",
        "district": "East Singhbhum",
        "allowed_domains": ["nitjsr.ac.in", "www.nitjsr.ac.in"],
        "max_depth": 3,
        "crawl_delay_seconds": 2,
        "max_pages": 300,
        "target_seeds": [
            "https://www.nitjsr.ac.in/department/civil-engineering",
            "https://www.nitjsr.ac.in/department/metallurgical-and-materials-engineering"
        ]
    },
    {
        "university_code": "BAU_RANCHI",
        "name": "Birsa Agricultural University",
        "base_url": "https://www.bauranchi.org",
        "district": "Ranchi",
        "allowed_domains": ["bauranchi.org", "www.bauranchi.org"],
        "max_depth": 3,
        "crawl_delay_seconds": 2,
        "max_pages": 300,
        "target_seeds": [
            "https://www.bauranchi.org/ssac",
            "https://www.bauranchi.org/agronomy",
            "https://www.bauranchi.org/agri-engg"
        ]
    },
    {
        "university_code": "AIIMS_DEOGHAR",
        "name": "All India Institute of Medical Sciences (AIIMS) Deoghar",
        "base_url": "https://www.aiimsdeoghar.edu.in",
        "district": "Deoghar",
        "allowed_domains": ["aiimsdeoghar.edu.in", "www.aiimsdeoghar.edu.in"],
        "max_depth": 3,
        "crawl_delay_seconds": 2,
        "max_pages": 250,
        "target_seeds": [
            "https://www.aiimsdeoghar.edu.in/departments/community-medicine",
            "https://www.aiimsdeoghar.edu.in/facilities"
        ]
    }
]
```

---

## 💡 5. Issue-to-University Routing Example (Bokaro Handpump Arsenic Contamination)

When a citizen reports **"Groundwater arsenic contamination and waterborne disease outbreak in Bokaro"**:

```
Issue Analysis:
├── Domain: Water Resources & Environmental Engineering
├── Sub-domain: Groundwater Systems & Hydrogeology
└── Specialization: Arsenic & Fluoride Remediation, Water Pathogen Testing

Knowledge Graph Resolution:
1. IIT ISM Dhanbad (Dept of ESE):
   └── Dr. X (Groundwater Heavy Metal Remediation) [Confidence: 0.98, Verified]
   └── Environmental Testing Lab (Atomic Absorption Spectrometry) [Verified]
   └── Distance to Bokaro: 42 km (Regional Proximity Bonus)

2. BIT Mesra (Dept of CEE):
   └── Water Quality Analytical Laboratory [Verified]
   └── Distance to Bokaro: 95 km

3. AIIMS Deoghar (Community Medicine):
   └── Waterborne Pathogen & Epidemiology Taskforce [Verified]

Routing Score:
IIT ISM Dhanbad = 96.4% Match (Top Recommendation)
BIT Mesra = 89.1% Match (Secondary Testing Hub)
```
