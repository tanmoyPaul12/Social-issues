# 🏛️ Comprehensive University Crawling & Multi-Domain Capability Mapping

**Document:** Complete Ingestion & Multi-Domain Capability Blueprint  
**Specification Reference:** [`project.md`](file:///home/bappaditya/coding/2026%20Projects/sih%20project/Social-issues/project.md) (Lines 13, 19–25)  
**Target Scope:** Comprehensive Multi-Domain Crawling across the Top 5 Jharkhand Universities  

---

## 🧭 1. Problem Statement Alignment & Thematic Domains

In [`project.md`](file:///home/bappaditya/coding/2026%20Projects/sih%20project/Social-issues/project.md), the platform requires routing citizen and government problems across **9 core societal domains**:

```
                              ┌─────────────────────────────────────────────────────────┐
                              │     9 THEMATIC SOCIETAL DOMAINS (project.md)            │
                              └─────────────────────────────────────────────────────────┘
                                                           │
        ┌───────────────┬───────────────┬──────────────────┼──────────────────┬───────────────┬───────────────┐
        ▼               ▼               ▼                  ▼                  ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│1. Water      │ │2. Agriculture│ │3. Healthcare │ │4. Environment│ │5. Energy     │ │6. Urban      │ │7. Mining &   │
│   Resources  │ │   & Livelihood│ │   & Health   │ │   & Pollution│ │   & Solar    │ │   & Civil Infra│ │   Metallurgy │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        │                                                                                             │
        └─────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                          ┌──────────────────┐                  ┌──────────────────┐
                          │8. Public Policy  │                  │9. Accessibility  │
                          │   & Logistics    │                  │   & Assistive Tec│
                          └──────────────────┘                  └──────────────────┘
```

---

## 🎯 2. The Comprehensive 5-University Selection & Domain Matrix

Instead of restricting a university to a single domain, **we crawl all departments, faculties, labs, and incubators across every domain present at that institution**:

| Institution | Code | Location | Multi-Disciplinary Excellence Spanning All Domains | Official Portal |
| :--- | :--- | :--- | :--- | :--- |
| **IIT (ISM) Dhanbad** | `IIT_ISM_DHANBAD` | Dhanbad | **Water:** Centre of Excellence in Water Resources<br>**Environment:** Environmental Science & Engg (ESE)<br>**Mining & Geology:** Mining Engg, Mineral Dressing, Earth Sciences<br>**Energy:** Clean Coal & Petroleum Engg, Solar Energy<br>**Civil & Robotics:** Civil Engg, Mechanical & Robotics Lab<br>**Incubation:** Centre for Innovation, Incubation & Entrepreneurship (CIIE) | `https://www.iitism.ac.in` |
| **BIT Mesra, Ranchi** | `BIT_MESRA` | Ranchi | **Water & Civil:** Civil & Environmental Engg (Water Quality Lab)<br>**Biotech & Health:** Bio-Engineering, Pharmaceutical Science, Cancer Genomics<br>**Space & GIS:** Remote Sensing, Drone GIS Watershed Mapping<br>**Computer Science & AI:** AI/ML, Cloud Computing<br>**Incubation:** Technology Business Incubator (BIT-TBI) & CIF | `https://www.bitmesra.ac.in` |
| **NIT Jamshedpur** | `NIT_JAMSHEDPUR` | Jamshedpur | **Civil & Infrastructure:** Structural Engg, Soil Mechanics, Geotechnical Lab<br>**Metallurgy & Materials:** Metallurgy & Materials, Corrosion Testing<br>**Energy & Electrical:** Renewable Energy Research Centre, Microgrids<br>**Manufacturing:** Advanced Manufacturing, Welding Technology<br>**Incubation:** Industry-Academia Innovation & EDC Cell | `https://www.nitjsr.ac.in` |
| **Birsa Agricultural University** | `BAU_RANCHI` | Ranchi | **Agriculture & Soil:** Soil Science & Agri Chemistry (SSAC), Agronomy<br>**Irrigation & Water:** Agricultural Engineering, Micro-Irrigation<br>**Biotech & Forestry:** Plant Breeding, Forestry, Horticulture<br>**Animal Health:** Veterinary Science, Livestock Disease Diagnostics<br>**Rural Extension:** 16 Krishi Vigyan Kendras (KVKs) across districts | `https://www.bauranchi.org` |
| **AIIMS Deoghar** | `AIIMS_DEOGHAR` | Deoghar | **Healthcare & Diagnostics:** Community Medicine, Clinical Microbiology<br>**Water Pathogens:** Waterborne Disease & Fluorosis Surveillance<br>**Telemedicine:** Regional Telemedicine & E-Sanjeevani Hub<br>**Rural Health:** Maternal & Child Health Taskforces, Epidemiology Unit | `https://www.aiimsdeoghar.edu.in` |

---

## 🔍 3. The 5 Core Institutional Capability Dimensions (Line 21 of `project.md`)

When crawling each university, the ingestion engine extracts data across the **5 mandatory criteria**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │     5 CRITERIA EXTRACTED PER UNIVERSITY (project.md)    │
                       └────────────────────────────────────────────────────────┘
                                                    │
         ┌──────────────────┬───────────────────────┼──────────────────────┬──────────────────┐
         ▼                  ▼                       ▼                      ▼                  ▼
┌──────────────────┐ ┌──────────────┐      ┌─────────────────┐    ┌─────────────────┐ ┌──────────────┐
│ 1. Academic      │ │ 2. Research  │      │ 3. Innovation   │    │ 4. Incubation   │ │ 5. Faculty & │
│    Disciplines   │ │    Centres   │      │    Centres      │    │    Facilities   │ │ Specialization│
│   (departments)  │ │ (research_cen│      │ (innovation_cen)│    │ (incubation_cen)│ │(faculty_exp) │
└──────────────────┘ └──────────────┘      └─────────────────┘    └─────────────────┘ └──────────────┘
```

1. **Academic Disciplines (`departments` table):**
   - Department name, academic code, description, official webpage, head of department.
2. **Research Expertise & Centres (`research_centres` & `facilities` tables):**
   - Specialized research centres (e.g., Water Resources Centre, Remote Sensing Hub).
   - Laboratory instrumentation facilities (e.g., Atomic Absorption Spectrophotometer, XRD, Water Testing Lab).
3. **Innovation Centres (`innovation_centres` table):**
   - Makerspaces, design labs, prototyping hubs, student innovation councils.
4. **Incubation Facilities (`incubation_centres` table):**
   - Technology Business Incubators (TBIs), Atal Incubation Centres, E-Cells, prototype-to-product commercialization units.
5. **Faculty & Specializations (`faculty` & `faculty_expertise` tables):**
   - Professor roster: Name, designation, verified academic email, PhD status, specific research interest keywords, patents, and recent publications.

---

## ⚙️ 4. University-by-University Crawl Strategy & Seed Paths

### 4.1 IIT (ISM) Dhanbad
- **Base Domain:** `https://www.iitism.ac.in`
- **Crawl Target Seed Paths:**
  - Academic Departments: `/depts/ese`, `/depts/civil`, `/depts/mining`, `/depts/mech`, `/depts/chem`, `/depts/cse`
  - Research & Lab Facilities: `/centres/water-centre`, `/research/centres`, `/facilities/central-research-facility`
  - Innovation & Incubation: `/innovation/ciie`, `/tbi`
  - Faculty Directories: `/faculty/browse-by-department`

### 4.2 BIT Mesra, Ranchi
- **Base Domain:** `https://www.bitmesra.ac.in`
- **Crawl Target Seed Paths:**
  - Academic Departments: `/cee` (Civil/Water), `/biotech` (Bio-Engg), `/remote-sensing` (GIS), `/cse`, `/pharmacy`
  - Research & Facilities: `/facilities/cif` (Central Instrumentation Facility), `/research/labs`
  - Innovation & Incubation: `/tbi` (BIT Technology Business Incubator), `/edc`
  - Faculty Directories: `/faculty-list`

### 4.3 NIT Jamshedpur
- **Base Domain:** `https://www.nitjsr.ac.in`
- **Crawl Target Seed Paths:**
  - Academic Departments: `/department/civil-engineering`, `/department/metallurgical-and-materials-engineering`, `/department/mechanical-engineering`, `/department/electrical-engineering`
  - Research Centres: `/research/centres/renewable-energy`, `/facilities/central-computing-and-testing`
  - Incubation Hub: `/industry-academia-relations`, `/tbi`

### 4.4 Birsa Agricultural University (BAU), Ranchi
- **Base Domain:** `https://www.bauranchi.org`
- **Crawl Target Seed Paths:**
  - Academic Departments: `/ssac` (Soil Science), `/agronomy`, `/agri-engg` (Micro-irrigation), `/plant-breeding`, `/veterinary`
  - Research & Lab Facilities: `/research-stations`, `/facilities/soil-testing-lab`
  - Extension Hubs: `/kvk-directory` (16 district centers)

### 4.5 AIIMS Deoghar
- **Base Domain:** `https://www.aiimsdeoghar.edu.in`
- **Crawl Target Seed Paths:**
  - Academic Departments: `/departments/community-medicine`, `/departments/microbiology`, `/departments/pathology`, `/departments/pharmacology`
  - Research & Facilities: `/facilities/telemedicine-hub`, `/research/epidemiology-unit`

---

## 🛠️ 5. Crawler Technical Stack & Production Safety

```
                                 ┌────────────────────────┐
                                 │   Target Seed URL      │
                                 └────────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │ 1. SSRF & DNS Guard    │  <-- Blocks 127.0.0.1, 10.0.0.0/8, 169.254.169.254
                                 └────────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │ 2. robots.txt & Delay  │  <-- 2-sec delay per origin, respects Disallow
                                 └────────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │ 3. Async HTTPX Client  │  <-- Handles retries, gzip, TLS 1.3, User-Agent
                                 └────────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │ 4. Trafilatura Cleaner │  <-- Extracts clean markdown, strips navbars/ads
                                 └────────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │ 5. SHA-256 Delta Hash  │  <-- Compares with previous crawl hash
                                 └────────────────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
                 [ UNCHANGED ]                                   [ CHANGED ]
                       │                                             │
             (Skip LLM extraction)                       (Save snapshot & trigger
                                                          LangGraph Entity Extractor)
```

### Crawl Inclusion vs Exclusion Regex:
- **Inclusion:** `^https?://(www\.)?[a-zA-Z0-9.-]+/(faculty|department|research|facilities|centres|tbi|incubation|laboratories|kvk|projects)/?.*$`
- **Exclusion:** `^.*(tender|admission|fee|fee-structure|result|hall-ticket|sports|placement-record|convocation|login|register|alumni-donation|\.pdf|\.jpg|\.png).*$`

---

## 🧠 6. Vector Embedding Strategy in Supabase (`pgvector`)

Each crawled and extracted entity is converted into a **rich semantic chunk** and embedded using **BAAI/bge-m3** (1024 dimensions):

### Chunk Example 1: Faculty Capability Chunk
```text
[ENTITY: FACULTY]
Name: Dr. X
University: IIT (ISM) Dhanbad | Department: Environmental Science & Engineering
Specializations: Groundwater Arsenic Remediation, Heavy Metal Contamination, Membrane Filtration
Research & Equipment: Atomic Absorption Spectrometer, Industrial Effluent Remediation
Publications: "Arsenic removal kinetics from groundwater in Eastern India aquifers"
Source URL: https://www.iitism.ac.in/depts/ese/faculty/dr-x
```

### Chunk Example 2: Laboratory Facility Chunk
```text
[ENTITY: FACILITY]
Name: Water Quality Analytical Laboratory
University: BIT Mesra | Research Centre: Centre for Water Resource Management
Testing Capabilities: Total Dissolved Solids (TDS), Fluoride Ion Chromatography, Bacterial Pathogen Count
Equipment: ICP-MS, Gas Chromatograph, Multi-parameter Water Testing Kit
Source URL: https://www.bitmesra.ac.in/facilities/water-lab
```

---

## 🎯 7. The End-to-End Recommendation Experience

When a citizen submits an issue (e.g., *"Bokaro rural handpump water has toxic fluoride/arsenic contamination and high turbidity"*):

1. **AI Microservice Categorizes:** `Water Resources -> Groundwater -> Arsenic & Fluoride Remediation`.
2. **Hybrid Retrieval (Vector + Graph):**
   - Query embedded via BGE-M3 $\to$ matched in `pgvector` against Faculty & Facility chunks.
   - Graph traversal in PostgreSQL queries `departments`, `facilities`, and `evidence_claims`.
3. **Multi-Factor Scoring:**
   - **IIT (ISM) Dhanbad (Score: 94.8%):** Dept of ESE (Heavy metal lab + Dr. X specialization + 42 km distance).
   - **BIT Mesra (Score: 88.2%):** Dept of CEE (Water Quality Analytical Lab + Bio-Tech testing + 95 km distance).
   - **AIIMS Deoghar (Score: 81.5%):** Community Medicine (Waterborne disease surveillance).
4. **Output Dossier:** Includes matched department, professors, specific lab equipment, and clickable evidence links (`evidence_claims.source_url`).
