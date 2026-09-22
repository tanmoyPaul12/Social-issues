"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { SiteFooter } from "@/components/common/SiteFooter";
import { JharkhandHeroMap } from "@/components/landing/JharkhandHeroMap";
import { Marquee } from "@/registry/magicui/marquee";
import { LogoCloud } from "@/components/ui/logo-cloud";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Types
type RoleType = "citizen" | "officer" | "university" | "industry";

interface ScenarioData {
  id: string;
  title: string;
  tag: string;
  district: string;
  problem: string;
  aiClustering: string;
  assignedTo: string;
  funding: string;
  stage: string;
  stageProgress: number;
  impact: string;
  ticketId: string;
}

interface TicketRecord {
  id: string;
  district: string;
  title: string;
  category: string;
  submittedBy: string;
  date: string;
  status: "Under AI Triage" | "Assigned to Lab" | "Prototype Testing" | "Field Deployment" | "Resolved";
  progress: number;
  assignedInstitute: string;
  leadInvestigator: string;
  csrPartner: string;
  grantAmount: string;
  aiSummary: string;
  timeline: { title: string; date: string; done: boolean; desc: string }[];
}

export const OFFICIAL_RESEARCH_DOMAINS = [
  "Education",
  "Agriculture",
  "Healthcare",
  "Water Resources",
  "Environment",
  "Energy",
  "Urban Development",
  "Accessibility",
  "Public Administration",
  "Rural Livelihoods",
] as const;

export type ResearchDomain = (typeof OFFICIAL_RESEARCH_DOMAINS)[number];

const SECTOR_TO_DOMAIN_MAP: Record<string, ResearchDomain> = {
  WATER: "Water Resources",
  HEALTH: "Healthcare",
  EDUCATION: "Education",
  INFRASTRUCTURE: "Urban Development",
  AGRICULTURE: "Agriculture",
  ELECTRICITY: "Energy",
  SANITATION: "Accessibility",
  LIVELIHOOD: "Rural Livelihoods",
  ENVIRONMENT: "Environment",
  GOVERNANCE: "Public Administration",
  OTHER: "Rural Livelihoods"
};

export interface CuratedShowcaseProject extends ScenarioData {
  domain: ResearchDomain;
  leadInvestigator?: string;
  csrPartner?: string;
  grantAmount?: string;
  submittedBy?: string;
  date?: string;
  timeline?: { title: string; date: string; done: boolean; desc: string }[];
}

export const CURATED_SHOWCASE_PROJECTS: CuratedShowcaseProject[] = [
  {
    id: "curated-1",
    ticketId: "JH-2026-00784",
    title: "Solar-Powered Decentralized Cold Storage for Tribal Farmers",
    tag: "Agriculture",
    domain: "Agriculture",
    district: "Khunti",
    problem: "Severe post-harvest spoilage of perishable lac, organic ginger, and tribal forest produce due to lack of grid power in remote rural panchayats.",
    aiClustering: "Thermal Energy Storage & Solar Micro-Refrigeration",
    assignedTo: "Birsa Agricultural University (BAU) & NIT Jamshedpur",
    leadInvestigator: "Prof. S. K. Tirkey (Dept. of Agricultural Engineering, BAU)",
    funding: "Tata Steel Foundation • ₹18.5 Lakhs",
    grantAmount: "₹18,50,000",
    stage: "Lab Prototype Testing",
    stageProgress: 75,
    impact: "Est. 3,400+ Tribal Farmers across 8 Gram Panchayats",
    submittedBy: "Ramesh Munda (Gram Pradhan, Torpa)",
    date: "12 Jan 2026",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "12 Jan 2026",
        done: true,
        desc: "Logged from Torpa, Khunti via Mobile Voice Note.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "14 Jan 2026",
        done: true,
        desc: "Categorized under Agriculture & Thermal Storage. AI Validation: PASS.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "02 Feb 2026",
        done: true,
        desc: "Allocated to BAU Ranchi & NIT Jamshedpur renewable cold chain testbed.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "Target: April 2026",
        done: false,
        desc: "Field pilot testing in Torpa panchayat facility.",
      },
    ],
  },
  {
    id: "curated-2",
    ticketId: "JH-2026-01429",
    title: "Graphene-Enhanced Fluoride & Arsenic Water Filtration",
    tag: "Water Resources",
    domain: "Water Resources",
    district: "Gumla",
    problem: "High endemic groundwater fluoride levels (>4.2 mg/L) causing skeletal fluorosis across 14 rural village clusters.",
    aiClustering: "Nanomaterial Adsorption & Clean Potable Water Tech",
    assignedTo: "IIT (ISM) Dhanbad • Dept. of Environmental Science",
    leadInvestigator: "Dr. Ananya Sen (Principal Investigator, IIT ISM)",
    funding: "Coal India CSR • ₹24.0 Lakhs",
    grantAmount: "₹24,00,000",
    stage: "Field Deployment & Impact",
    stageProgress: 100,
    impact: "Est. 12,000+ Villagers across 14 Habitations",
    submittedBy: "Sunita Oraon (ASHA Worker, Chainpur)",
    date: "04 Nov 2025",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "04 Nov 2025",
        done: true,
        desc: "Identified water quality hazard in Chainpur block.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "06 Nov 2025",
        done: true,
        desc: "Categorized under Water Resources. AI Validation: PASS.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "20 Nov 2025",
        done: true,
        desc: "Graphene filtration filter unit engineered at IIT (ISM) Dhanbad.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "18 Feb 2026",
        done: true,
        desc: "14 community filtration plants installed and operational.",
      },
    ],
  },
  {
    id: "curated-3",
    ticketId: "JH-2026-02105",
    title: "Autonomous Micro-Hydro Kinetic Turbine for Forest Hamlets",
    tag: "Energy",
    domain: "Energy",
    district: "Latehar",
    problem: "Hilly tribal hamlets in Netarhat plateau isolated from grid power, needing clean decentralized power for health sub-centers and schools.",
    aiClustering: "Run-of-the-River Low-Head Kinetic Power Generation",
    assignedTo: "BIT Mesra • Dept. of Mechanical & Electrical Engineering",
    leadInvestigator: "Dr. Rajeshwar Sharma (Renewable Energy Lab, BIT Mesra)",
    funding: "State Innovation Sandbox • ₹15.0 Lakhs",
    grantAmount: "₹15,00,000",
    stage: "Lab Prototype Testing",
    stageProgress: 80,
    impact: "Est. 1,850+ Citizens & 3 Rural Schools",
    submittedBy: "Birsa Baitha (Panchayat Samiti Member)",
    date: "18 Dec 2025",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "18 Dec 2025",
        done: true,
        desc: "Logged by Netarhat panchayat representatives.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "21 Dec 2025",
        done: true,
        desc: "Validated under Energy & Micro-Hydro Kinetics. AI Validation: PASS.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "10 Jan 2026",
        done: true,
        desc: "Allocated to BIT Mesra Mechanical & Electrical Engineering teams.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "In Progress",
        done: false,
        desc: "Stream kinetic turbine prototype currently under test flume calibration.",
      },
    ],
  },
  {
    id: "curated-4",
    ticketId: "JH-2026-03391",
    title: "Geopolymer Eco-Bricks from Coal Mine Overburden & Fly Ash",
    tag: "Environment",
    domain: "Environment",
    district: "Dhanbad",
    problem: "Extensive open-cast coal overburden dumps generating fugitive dust and wasting hundreds of hectares of fertile land.",
    aiClustering: "Circular Economy & Industrial Byproduct Valorization",
    assignedTo: "IIT (ISM) Dhanbad • Mining & Civil Engineering Dept.",
    leadInvestigator: "Prof. Vikramaditya Roy (Centre for Waste Utilization)",
    funding: "Coal India CSR & BCCL • ₹32.0 Lakhs",
    grantAmount: "₹32,00,000",
    stage: "Field Deployment & Impact",
    stageProgress: 90,
    impact: "Est. 45,000+ Community Members across Jharia & Dhanbad",
    submittedBy: "Jharkhand Mining Pollution Action Group",
    date: "10 Oct 2025",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "10 Oct 2025",
        done: true,
        desc: "Community request on mine tailing dust mitigation.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "12 Oct 2025",
        done: true,
        desc: "Classified under Environmental Engineering & Material Science.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "28 Oct 2025",
        done: true,
        desc: "Zero-cement geopolymer formulation developed at IIT ISM Dhanbad.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "05 Feb 2026",
        done: true,
        desc: "Automated brick manufacturing pilot deployed with BCCL backing.",
      },
    ],
  },
  {
    id: "curated-5",
    ticketId: "JH-2026-04512",
    title: "AI Drone Delivery & Point-of-Care Diagnostics for Maternal Health",
    tag: "Healthcare",
    domain: "Healthcare",
    district: "West Singhbhum",
    problem: "Dense forest terrains and monsoon flash floods cutting off medical diagnostic supply chains to remote PHCs in Chaibasa.",
    aiClustering: "Autonomous Aerial Logistics & Edge Diagnostic Telemetry",
    assignedTo: "NIT Jamshedpur (Robotics Lab) & AIIMS Deoghar",
    leadInvestigator: "Dr. P. K. Mahato (Dept. of Mechatronics, NIT JSR)",
    funding: "Tata Steel Foundation CSR • ₹28.5 Lakhs",
    grantAmount: "₹28,50,000",
    stage: "Lab Prototype Testing",
    stageProgress: 70,
    impact: "Est. 8,600+ Mothers & Newborns in Saranda Forest Belt",
    submittedBy: "District Health Society, Chaibasa",
    date: "08 Jan 2026",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "08 Jan 2026",
        done: true,
        desc: "Logged by Chaibasa District Health Society.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "10 Jan 2026",
        done: true,
        desc: "Structured under Healthcare Logistics & Tele-Medicine AI.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "25 Jan 2026",
        done: true,
        desc: "Allocated to NIT Jamshedpur Autonomous Flight & Robotics Lab.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "In Progress",
        done: false,
        desc: "Beyond-visual-line-of-sight test flights conducted successfully.",
      },
    ],
  },
  {
    id: "curated-6",
    ticketId: "JH-2026-05680",
    title: "IoT Natural Lac Processing & Bio-Resin Value Addition",
    tag: "Rural Livelihoods",
    domain: "Rural Livelihoods",
    district: "Simdega",
    problem: "Traditional manual scraping leads to high resin impurities and low selling prices for tribal lac collectors.",
    aiClustering: "Automated Food-Grade Resin Refining & Quality Sensing",
    assignedTo: "ICAR-IINRG Ranchi & BIT Mesra Chemical Engineering",
    leadInvestigator: "Dr. Nirmal Topno (Natural Resin Processing Unit)",
    funding: "Ministry of Tribal Affairs & SIDBI CSR • ₹22.0 Lakhs",
    grantAmount: "₹22,00,000",
    stage: "Assigned to University Lab",
    stageProgress: 65,
    impact: "Est. 4,200+ Forest Dweller Livelihoods",
    submittedBy: "Simdega Lac Producers Co-operative",
    date: "22 Jan 2026",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "22 Jan 2026",
        done: true,
        desc: "Submitted by Simdega tribal cooperative.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "24 Jan 2026",
        done: true,
        desc: "Categorized under Rural Livelihoods & Agri-Processing.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "08 Feb 2026",
        done: true,
        desc: "Adopted by ICAR-IINRG Ranchi and BIT Mesra.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "Target: May 2026",
        done: false,
        desc: "Low-cost mechanical scraper prototype undergoing field trials.",
      },
    ],
  },
  {
    id: "curated-7",
    ticketId: "JH-2026-06724",
    title: "Solar-Powered Smart Classrooms with Offline Tribal AI Tutors",
    tag: "Education",
    domain: "Education",
    district: "Palamu",
    problem: "Erratic power supply and language transition gaps causing high dropout rates in rural Santhali and Ho speaking students.",
    aiClustering: "Offline Edge AI NLP & Solar Digital Infrastructure",
    assignedTo: "BIT Mesra • Dept. of Computer Science & Engineering",
    leadInvestigator: "Dr. Sandeep K. Singh (AI Speech & NLP Lab)",
    funding: "NTPC CSR Grant • ₹21.0 Lakhs",
    grantAmount: "₹21,00,000",
    stage: "Field Deployment & Impact",
    stageProgress: 95,
    impact: "Est. 3,200+ Students across 12 Model Tribal Schools",
    submittedBy: "District Education Officer, Palamu",
    date: "15 Nov 2025",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "15 Nov 2025",
        done: true,
        desc: "Submitted by Palamu District Education Office.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "18 Nov 2025",
        done: true,
        desc: "Classified under EdTech & Multilingual Speech AI.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "05 Dec 2025",
        done: true,
        desc: "Offline localized language AI models developed at BIT Mesra.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "20 Feb 2026",
        done: true,
        desc: "Deployed in 12 remote high schools with solar mini-battery banks.",
      },
    ],
  },
  {
    id: "curated-8",
    ticketId: "JH-2026-07890",
    title: "Low-Cost Soil NPK & Micro-Nutrient Optical Spectrometer",
    tag: "Agriculture",
    domain: "Agriculture",
    district: "Hazaribagh",
    problem: "Farmers wait 3-4 weeks for soil testing lab results, leading to excessive chemical fertilizer application.",
    aiClustering: "Spectrophotometric Soil Sensors & Mobile Advisory",
    assignedTo: "Vinoba Bhave University & IIT (ISM) Dhanbad Sensors Lab",
    leadInvestigator: "Prof. R. N. Yadav (Department of Physics, VBU)",
    funding: "NABARD Rural Innovation Fund • ₹14.0 Lakhs",
    grantAmount: "₹14,00,000",
    stage: "Field Deployment & Impact",
    stageProgress: 85,
    impact: "Est. 6,800+ Smallholder Farmers",
    submittedBy: "Krishi Vigyan Kendra, Hazaribagh",
    date: "01 Dec 2025",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "01 Dec 2025",
        done: true,
        desc: "KVK Hazaribagh flagged urgent need for on-field soil test kits.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "03 Dec 2025",
        done: true,
        desc: "Classified under Agri-Sensors & Precision Farming.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "15 Dec 2025",
        done: true,
        desc: "Optical spectrometer hardware designed at VBU & IIT ISM.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "10 Feb 2026",
        done: true,
        desc: "Handheld soil scanners distributed to 25 village panchayats.",
      },
    ],
  },
  {
    id: "curated-9",
    ticketId: "JH-2026-08915",
    title: "Bio-Enzyme Remediation for Coal Washing Effluent",
    tag: "Environment",
    domain: "Environment",
    district: "Bokaro",
    problem: "Heavy metal and sulfate runoffs from coal processing impacting localized surface water bodies and agriculture.",
    aiClustering: "Bioremediation & Native Microbial Strain Biocatalysis",
    assignedTo: "BIT Sindri & IIT (ISM) Dhanbad Biotech Labs",
    leadInvestigator: "Dr. Manisha Kispotta (Biochemical Engineering)",
    funding: "SAIL Bokaro Steel Plant CSR • ₹26.0 Lakhs",
    grantAmount: "₹26,00,000",
    stage: "Lab Prototype Testing",
    stageProgress: 60,
    impact: "Est. 15,000+ Community Members along Damodar Basin",
    submittedBy: "Bokaro Environmental Protection Collective",
    date: "19 Jan 2026",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "19 Jan 2026",
        done: true,
        desc: "Reported river runoff contamination in Bokaro industrial corridor.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "22 Jan 2026",
        done: true,
        desc: "Structured under Industrial Bioremediation & Water Quality.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "06 Feb 2026",
        done: true,
        desc: "Microbial bioreactor testing underway at BIT Sindri.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "Target: June 2026",
        done: false,
        desc: "Pilot reed-bed biological filtration unit planned for installation.",
      },
    ],
  },
  {
    id: "curated-10",
    ticketId: "JH-2026-09142",
    title: "GIS Smart Gravity-Fed Drip Irrigation for Hill Farms",
    tag: "Water Resources",
    domain: "Water Resources",
    district: "Dumka",
    problem: "Rapid hill runoff in Santhal Pargana leaves terraced vegetable farms completely dry post-monsoon.",
    aiClustering: "Hydrological Micro-Catchment & Zero-Electricity Drip Tech",
    assignedTo: "Birsa Agricultural University & BIT Mesra Remote Sensing",
    leadInvestigator: "Dr. A. K. Choudhary (Soil & Water Conservation Dept.)",
    funding: "State Water Resources Innovation Sandbox • ₹19.0 Lakhs",
    grantAmount: "₹19,00,000",
    stage: "Lab Prototype Testing",
    stageProgress: 70,
    impact: "Est. 5,100+ Farmers across 6 Hill Panchayats",
    submittedBy: "Dumka Organic Farmers Federation",
    date: "14 Feb 2026",
    timeline: [
      {
        title: "Problem Logged in System",
        date: "14 Feb 2026",
        done: true,
        desc: "Logged by Dumka Organic Farmers Federation.",
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "16 Feb 2026",
        done: true,
        desc: "Classified under Water Conservation & Gravity Irrigation.",
      },
      {
        title: "University Lab Allocation & R&D",
        date: "28 Feb 2026",
        done: true,
        desc: "Catchment elevation map generated with BAU and BIT Mesra.",
      },
      {
        title: "Field Deployment & Resolution",
        date: "In Progress",
        done: false,
        desc: "Gravity pipe network laying currently underway across 3 villages.",
      },
    ],
  },
];

const createLogoSvg = (badge: string, name: string) => {
  const calculatedWidth = Math.round(name.length * 9.4 + 54);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${calculatedWidth}" height="36" viewBox="0 0 ${calculatedWidth} 36" fill="none">
    <rect x="2" y="2" width="32" height="32" rx="9" fill="#0f172a"/>
    <text x="18" y="22.5" fill="#ffffff" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="0.03em">${badge}</text>
    <text x="44" y="23" fill="#0f172a" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="900" letter-spacing="-0.01em">${name}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const CONSORTIUM_LOGOS = [
  {
    src: createLogoSvg("IIT", "IIT (ISM) DHANBAD"),
    alt: "IIT (ISM) Dhanbad",
  },
  {
    src: createLogoSvg("BIT", "BIT MESRA"),
    alt: "BIT Mesra",
  },
  {
    src: createLogoSvg("NIT", "NIT JAMSHEDPUR"),
    alt: "NIT Jamshedpur",
  },
  {
    src: createLogoSvg("BAU", "BIRSA AGRI UNIVERSITY"),
    alt: "Birsa Agricultural University",
  },
  {
    src: createLogoSvg("TATA", "TATA STEEL"),
    alt: "Tata Steel",
  },
  {
    src: createLogoSvg("CIL", "COAL INDIA CSR"),
    alt: "Coal India CSR",
  },
  {
    src: createLogoSvg("AIIMS", "AIIMS DEOGHAR"),
    alt: "AIIMS Deoghar",
  },
  {
    src: createLogoSvg("SAIL", "SAIL BOKARO"),
    alt: "SAIL Bokaro",
  },
  {
    src: createLogoSvg("NTPC", "NTPC CSR"),
    alt: "NTPC CSR",
  },
  {
    src: createLogoSvg("IINRG", "ICAR-IINRG"),
    alt: "ICAR-IINRG",
  },
  {
    src: createLogoSvg("BITS", "BIT SINDRI"),
    alt: "BIT Sindri",
  },
  {
    src: createLogoSvg("CUJ", "CENTRAL UNIV JHARKHAND"),
    alt: "Central University of Jharkhand",
  },
];

export default function LandingPage() {
  const [activeRole] = useState<RoleType>("citizen");
  const [scenarios, setScenarios] = useState<(ScenarioData & { domain: ResearchDomain })[]>(CURATED_SHOWCASE_PROJECTS);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioData | null>(null);
  const [ticketInput, setTicketInput] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [activeTicketModal, setActiveTicketModal] = useState<TicketRecord | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("All");

  useEffect(() => {
    async function loadChallenges() {
      try {
        const res = await fetch(`${API_BASE_URL}/issues?page=0&size=20&sortBy=createdAt&sortDir=desc`);
        if (res.ok) {
          const data = await res.json();
          const items = data.content || [];
          if (Array.isArray(items) && items.length > 0) {
            // Filter out junk/test entries to keep showcase pristine and high quality
            const isJunkOrTest = (item: any): boolean => {
              if (!item || !item.title) return true;
              const title = String(item.title).trim();
              const desc = String(item.description || item.snippet || "").trim();
              if (title.length < 8) return true;
              if (/^[a-zA-Z]{12,}$/.test(title.replace(/\s+/g, ""))) return true;
              if (/^([a-zA-Z])\1{3,}/i.test(title)) return true;
              if (/test|sample|asdf|qwerty|1234|foo|bar|dummy|temp/i.test(title)) return true;
              if (!title.includes(" ") && title.length > 12) return true;
              if (desc.length < 10) return true;
              return false;
            };

            const validDbItems = items.filter((item: any) => !isJunkOrTest(item));

            const mappedDb: (ScenarioData & { domain: ResearchDomain })[] = validDbItems.map((item: any) => {
              const domain: ResearchDomain = SECTOR_TO_DOMAIN_MAP[item.sector] || "Rural Livelihoods";
              const progress =
                item.status === "RESOLVED"
                  ? 100
                  : item.status === "IN_PROGRESS"
                  ? 65
                  : item.status === "ASSIGNED_HEI"
                  ? 40
                  : 20;
              const stage =
                item.status === "RESOLVED"
                  ? "Field Deployment & Impact"
                  : item.status === "IN_PROGRESS"
                  ? "Lab Prototype Testing"
                  : item.status === "ASSIGNED_HEI"
                  ? "Assigned to University Lab"
                  : "Under AI Triage";
              const funding =
                item.status === "RESOLVED" || item.status === "IN_PROGRESS"
                  ? "Govt Grant & CSR Supported"
                  : "Sandbox Under Review";
              const ticketId = item.issueNumber || `JH-${item.id}`;
              return {
                id: String(item.id),
                title: item.title,
                tag: domain,
                domain,
                district: item.district || "Jharkhand",
                problem: item.snippet || item.description || item.title,
                aiClustering: item.validationStatus || "PASS",
                assignedTo: item.assignedHEI || "Matching University Lab (AI Triage)",
                funding,
                stage,
                stageProgress: progress,
                impact: `Est. ${item.affectedPopulation || 1200}+ Citizens`,
                ticketId,
              };
            });

            // Merge valid real DB entries with curated flagship showcase items
            if (mappedDb.length > 0) {
              setScenarios([...mappedDb, ...CURATED_SHOWCASE_PROJECTS]);
            } else {
              setScenarios(CURATED_SHOWCASE_PROJECTS);
            }
          }
        }
      } catch (e) {
        console.warn("Could not fetch live challenges for landing page, using curated registry:", e);
        setScenarios(CURATED_SHOWCASE_PROJECTS);
      }
    }
    loadChallenges();
  }, []);

  const handleOpenTicketModal = (item: ScenarioData & { domain: ResearchDomain }) => {
    const curated = CURATED_SHOWCASE_PROJECTS.find(
      (p) => p.ticketId === item.ticketId || p.id === item.id || p.title === item.title
    );

    const statusLabel: TicketRecord["status"] =
      item.stageProgress === 100
        ? "Resolved"
        : item.stageProgress >= 70
        ? "Prototype Testing"
        : item.stageProgress >= 40
        ? "Assigned to Lab"
        : "Under AI Triage";

    const timeline = curated?.timeline || [
      {
        title: "Problem Logged in System",
        date: curated?.date || "Recent",
        done: true,
        desc: `Recorded in Jharkhand Grassroots Registry for ${item.district}.`,
      },
      {
        title: "AI Semantic Structuring & Validation",
        date: "Validated",
        done: true,
        desc: `Categorized under ${item.domain}. AI Validation: ${item.aiClustering}.`,
      },
      {
        title: "University Lab Allocation & R&D",
        date: item.stageProgress >= 40 ? "Assigned" : "Pending Match",
        done: item.stageProgress >= 40,
        desc: `Allocated to ${item.assignedTo}.`,
      },
      {
        title: "Field Deployment & Resolution",
        date: item.stageProgress === 100 ? "Completed" : "In Progress",
        done: item.stageProgress === 100,
        desc:
          item.stageProgress === 100
            ? "Solution verified and deployed in community."
            : "Field validation and final deployment in progress.",
      },
    ];

    setActiveTicketModal({
      id: item.ticketId,
      district: item.district,
      title: item.title,
      category: item.domain,
      submittedBy: curated?.submittedBy || "Verified District Citizen",
      date: curated?.date || "15 Jan 2026",
      status: statusLabel,
      progress: item.stageProgress,
      assignedInstitute: item.assignedTo,
      leadInvestigator: curated?.leadInvestigator || `${item.assignedTo} Research Team`,
      csrPartner: curated?.csrPartner || item.funding,
      grantAmount: curated?.grantAmount || "State Innovation Sandbox",
      aiSummary:
        curated?.problem ||
        item.problem ||
        "Problem formulated into open research challenge with multi-criteria institutional matching.",
      timeline,
    });
  };

  const handleTrackTicket = async (idToTrack?: string) => {
    const searchId = (idToTrack || ticketInput).trim().toUpperCase();
    if (!searchId) return;

    setIsTracking(true);
    setTrackError(null);

    // Check if it matches a curated project or scenario in memory
    const localMatch =
      CURATED_SHOWCASE_PROJECTS.find(
        (p) => p.ticketId.toUpperCase() === searchId || p.id.toUpperCase() === searchId
      ) ||
      scenarios.find(
        (s) => s.ticketId.toUpperCase() === searchId || s.id.toUpperCase() === searchId
      );

    try {
      let res = await fetch(`${API_BASE_URL}/issues/ticket/${encodeURIComponent(searchId)}`);
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/issues/number/${encodeURIComponent(searchId)}`);
      }
      if (!res.ok && !isNaN(Number(searchId))) {
        res = await fetch(`${API_BASE_URL}/issues/${encodeURIComponent(searchId)}`);
      }

      if (res.ok) {
        const data = await res.json();
        const domainName = SECTOR_TO_DOMAIN_MAP[data.sector] || data.sector || "Grassroot Need";
        const progress =
          data.status === "RESOLVED"
            ? 100
            : data.status === "IN_PROGRESS"
            ? 75
            : data.status === "ASSIGNED_HEI"
            ? 50
            : 25;

        let statusLabel: TicketRecord["status"] = "Under AI Triage";
        if (data.status === "RESOLVED") statusLabel = "Resolved";
        else if (data.status === "IN_PROGRESS") statusLabel = "Prototype Testing";
        else if (data.status === "ASSIGNED_HEI") statusLabel = "Assigned to Lab";

        const formattedDate = data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recent";

        const timeline = [
          {
            title: "Problem Logged in System",
            date: formattedDate,
            done: true,
            desc: "Recorded in Jharkhand Grassroots Registry.",
          },
          {
            title: "AI Semantic Structuring & Validation",
            date: data.validationStatus ? "Validated" : "In Progress",
            done: Boolean(data.validationStatus && data.validationStatus !== "PENDING"),
            desc: `Categorized under ${domainName}. AI Validation: ${data.validationStatus || "PASS"}.`,
          },
          {
            title: "University Lab Allocation & R&D",
            date: data.assignedHEI ? "Assigned" : "Pending Match",
            done: Boolean(
              data.assignedHEI ||
                data.status === "ASSIGNED_HEI" ||
                data.status === "IN_PROGRESS" ||
                data.status === "RESOLVED"
            ),
            desc: data.assignedHEI
              ? `Allocated to ${data.assignedHEI}`
              : "Matching with leading state university faculty & labs across Jharkhand.",
          },
          {
            title: "Field Deployment & Resolution",
            date: data.resolvedAt
              ? new Date(data.resolvedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Pending",
            done: data.status === "RESOLVED",
            desc:
              data.status === "RESOLVED"
                ? "Solution verified and deployed in community."
                : "Field validation and final deployment in progress.",
          },
        ];

        setActiveTicketModal({
          id: data.issueNumber || `JH-${data.id}`,
          district: data.district || "Jharkhand",
          title: data.title,
          category: domainName,
          submittedBy:
            data.submitterName || (data.isAnonymous ? "Anonymous Citizen" : "Verified Citizen"),
          date: formattedDate,
          status: statusLabel,
          progress: progress,
          assignedInstitute: data.assignedHEI || "Matching State University Lab",
          leadInvestigator: data.assignedHEI
            ? `${data.assignedHEI} Principal Investigator`
            : "Pending Lab Matching",
          csrPartner: data.fundingPartner || "State Innovation Sandbox / CSR",
          grantAmount:
            data.status === "IN_PROGRESS" || data.status === "RESOLVED"
              ? "Grant Allocated"
              : "Evaluation in progress",
          aiSummary:
            data.description ||
            "Ticket is undergoing automated NLP classification, duplicate grouping, and multi-criteria research capability mapping.",
          timeline,
        });
        setIsTracking(false);
        return;
      }
    } catch (err) {
      console.warn("API tracking query fell back to curated dataset:", err);
    }

    if (localMatch) {
      handleOpenTicketModal(localMatch);
    } else {
      setTrackError(
        `Ticket "${searchId}" was not found in the official registry. Please try one of our active district tickets (e.g. JH-2026-00784, JH-2026-01429, JH-2026-02105).`
      );
    }
    setIsTracking(false);
  };

  return (
    <div className="min-h-screen bg-[#fbfcfd] text-[#090e1a] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ─────────────────────────────────────────────────────────────
          ENTERPRISE NAVBAR: CO-PARTNERS, OPPORTUNITIES, SEGMENTS, EVENTS
      ───────────────────────────────────────────────────────────── */}
      <SiteNavbar />

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION (RESPONSIVE TWO-COLUMN LAYOUT WITH JHARKHAND MAP)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-12 pb-10 sm:pb-14 px-3 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#fbfcfd] to-white">
        {/* Subtle decorative background ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-100/30 via-emerald-100/20 to-indigo-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Narrative & Action Controls (Centered on mobile, Left-aligned on Desktop/Laptop) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-6">
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-slate-200/90 bg-white/90 backdrop-blur-sm text-slate-700 text-[10.5px] sm:text-xs shadow-2xs max-w-full">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-bold text-slate-900 tracking-tight shrink-0">NEP 2020 Aligned</span>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-slate-600 font-medium truncate">Jharkhand Innovation Ecosystem</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2.5xl xs:text-3xl sm:text-4.5xl lg:text-[46px] xl:text-[52px] font-black tracking-tight text-[#090e1a] leading-[1.16] sm:leading-[1.12]">
                Connecting Jharkhand&apos;s
                <br />
                Real-World Challenges to
                <br />
                <span className="inline-block mt-1.5 sm:mt-2.5 px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-[#dcfce7] border border-[#86efac] text-[#047857] shadow-xs text-xl sm:text-3xl lg:text-[38px] xl:text-[44px]">
                  University R&amp;D
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-base lg:text-[17.5px] text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Empowering citizens to report local challenges, and connecting them directly with
                universities, startups, and industries to build funded, real-world solutions
                across all 24 districts of Jharkhand.
              </p>

              {/* Primary Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#080d1a] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all group active:scale-95 cursor-pointer"
                >
                  <span>Submit Community Challenge</span>
                  <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
                </Link>
              </div>

              {/* Ticket ID Interactive Search Bar */}
              <div className="max-w-lg mx-auto lg:mx-0 pt-1 sm:pt-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTrackTicket();
                  }}
                  className="bg-white border border-slate-200/90 hover:border-blue-300 focus-within:border-blue-500 rounded-full p-1 sm:p-1.5 pl-3.5 sm:pl-5 flex items-center gap-2 shadow-xs transition-all"
                >
                  <svg
                    className="w-4 h-4 text-slate-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                  <input
                    id="ticket-search-input"
                    type="text"
                    value={ticketInput}
                    onChange={(e) => {
                      setTicketInput(e.target.value);
                      if (trackError) setTrackError(null);
                    }}
                    placeholder="Enter Ticket ID (e.g. JH-2026-00784)..."
                    className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={isTracking}
                    className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#1d63ed] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                  >
                    {isTracking ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden xs:inline">Searching...</span>
                      </>
                    ) : (
                      <span>Track</span>
                    )}
                  </button>
                </form>

                {/* Track Error Alert */}
                {trackError && (
                  <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-left">
                    <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 text-xs text-red-700 font-medium break-words">
                      {trackError}
                    </div>
                    <button
                      onClick={() => setTrackError(null)}
                      className="text-red-500 hover:text-red-800 text-xs font-bold shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Quick Ticket Pill Triggers */}
                <div className="flex items-center justify-center lg:justify-start flex-wrap gap-1.5 mt-2 text-[10px] sm:text-[11px] text-slate-500">
                  <span className="shrink-0">Active District Tracking:</span>
                  {CURATED_SHOWCASE_PROJECTS.slice(0, 3).map((item) => (
                    <button
                      key={item.ticketId}
                      type="button"
                      onClick={() => {
                        setTicketInput(item.ticketId);
                        handleTrackTicket(item.ticketId);
                      }}
                      className="text-blue-600 hover:underline font-mono font-medium bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs cursor-pointer"
                    >
                      {item.ticketId} ({item.district})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Jharkhand Innovation Grid Map (Hidden on mobile, Visible on laptop/desktop & tablet) */}
            <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
              <JharkhandHeroMap />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. UNIFIED METRICS TELEMETRY STRIP (COMPACT 2x2 ON MOBILE, 4-COL ON DESKTOP)
        ───────────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mt-8 sm:mt-12 px-1 sm:px-4">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 text-left">
              
              {/* Metric 1: Citizen Submissions */}
              <div className="p-3.5 xs:p-4 sm:p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/70 transition-colors group">
                <div>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Submissions
                    </span>
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                      24 Districts
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 mt-1.5 sm:mt-3 tracking-tight group-hover:text-blue-600 transition-colors">
                    2,451
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 font-medium">
                  Across all 24 Districts
                </p>
              </div>

              {/* Metric 2: Universities (HEIs) */}
              <div className="p-3.5 xs:p-4 sm:p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/70 transition-colors group">
                <div>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Universities
                    </span>
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                      NEP 2020
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 mt-1.5 sm:mt-3 tracking-tight group-hover:text-blue-600 transition-colors">
                    18
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 font-medium truncate">
                  BIT, NIT, IIT, BAU
                </p>
              </div>

              {/* Metric 3: Active R&D Projects */}
              <div className="p-3.5 xs:p-4 sm:p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/70 transition-colors group">
                <div>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Active R&amp;D
                    </span>
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                      Live
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 mt-1.5 sm:mt-3 tracking-tight group-hover:text-blue-600 transition-colors">
                    142
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 font-medium truncate">
                  Prototypes &amp; pilots
                </p>
              </div>

              {/* Metric 4: Industry & CSR */}
              <div className="p-3.5 xs:p-4 sm:p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/70 transition-colors group">
                <div>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Industry Grants
                    </span>
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                      Committed
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 mt-1.5 sm:mt-3 tracking-tight group-hover:text-blue-600 transition-colors">
                    ₹4.2 Cr
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 font-medium truncate">
                  Tata Steel, CIL CSR
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. HOW THE PIPELINE WORKS: 6-STAGE ENGINE
      ───────────────────────────────────────────────────────────── */}
      <section id="pipeline-section" className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-100 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            HOW IT WORKS
          </span>
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900 mt-1.5 sm:mt-2 tracking-tight">
            How Your Reported Issue Gets Solved
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 sm:mt-2 max-w-xl mx-auto">
            From community submission to university R&amp;D, prototype testing, and ground deployment.
          </p>
        </div>

        {/* ── Modern Tech Minimal Process Flow ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 lg:gap-10">
          {[
            {
              step: "01",
              title: "Report a Local Problem",
              desc: "Citizens, panchayats, and community members submit issues faced in their villages or towns—such as water scarcity, crop storage, or rural healthcare—using simple text, photos, or voice notes in regional languages.",
              icon: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a4 4 0 00-4 4v6a4 4 0 008 0V5a4 4 0 00-4-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v1a7 7 0 01-14 0v-1" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v4m-4 0h8" />
                </svg>
              ),
            },
            {
              step: "02",
              title: "Verified & Published",
              desc: "The submitted issue is verified, enriched with district geolocation data, and converted into an open, research-grade problem statement published on the Jharkhand Innovation Registry for public visibility.",
              icon: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              ),
            },
            {
              step: "03",
              title: "Colleges Adopt R&D Projects",
              desc: "Professors, engineering departments, and university student teams choose the challenge as an academic capstone, final-year thesis, or applied R&D project aligned with NEP 2020 experiential learning.",
              icon: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147L12 6.18l7.74 3.967-7.74 3.968-7.74-3.968z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12.5v3.25c0 1.657 2.686 3 6 3s6-1.343 6-3V12.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.74 10.147v4.853" />
                </svg>
              ),
            },
            {
              step: "04",
              title: "Build & Test Solutions",
              desc: "Student innovators, university incubation labs, and startup teams design, build, and test practical physical prototypes, IoT systems, or software models in real-world field conditions.",
              icon: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM10 10h4v4h-4v-4z" />
                </svg>
              ),
            },
            {
              step: "05",
              title: "Industry Grants & Mentorship",
              desc: "Leading industrial enterprises, MSMEs, and CSR organizations evaluate working prototypes to provide financial grants, technical mentorship, pilot testbeds, and production funding.",
              icon: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              ),
            },
            {
              step: "06",
              title: "District-Wide Deployment",
              desc: "The validated, industry-backed solution is manufactured and rolled out across the affected district by local administrations, solving the problem and delivering measurable community impact.",
              icon: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex flex-col items-start text-left group p-3.5 sm:p-2 rounded-2xl bg-white sm:bg-transparent border border-slate-200/80 sm:border-0 shadow-2xs sm:shadow-none"
            >
              {/* Header: Pure borderless single-color Icon + Step Pill */}
              <div className="flex items-center justify-between w-full mb-2.5 sm:mb-3">
                <div className="text-slate-800 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 uppercase tracking-wider">
                  Step {item.step}
                </span>
              </div>

              {/* Step Title */}
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>

              {/* Comprehensive Description */}
              <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 sm:mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LIVE DISTRICT CHALLENGES & AI MATCH FEED
      ───────────────────────────────────────────────────────────── */}
      <section id="challenges-feed" className="py-10 sm:py-14 px-3 sm:px-6 lg:px-8 bg-slate-50/60 border-t border-slate-200/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-blue-600 uppercase bg-blue-50 border border-blue-200 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                LIVE ECOSYSTEM FEED
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 sm:mt-2 tracking-tight">
                Active Community Challenges &amp; Assigned University Labs
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Real-time problem statements submitted across Jharkhand districts.
              </p>
            </div>

            {/* Category Filter Pills (Smooth Horizontal Touch-Scrolling on Mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
              {["All", ...OFFICIAL_RESEARCH_DOMAINS].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilterCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedFilterCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Live Ecosystem Marquee Feed, Loading Skeletons, or Clean Registry State */}
          {isLoadingChallenges ? (
            <div className="flex gap-4 overflow-hidden py-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-[280px] sm:w-[360px] shrink-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-slate-200 rounded-full" />
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-10 w-full bg-slate-100 rounded" />
                  <div className="h-14 w-full bg-slate-100 rounded-xl" />
                  <div className="h-8 w-full bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (() => {
            const filtered = scenarios.filter((item) =>
              selectedFilterCategory === "All" ? true : item.domain === selectedFilterCategory
            );

            if (filtered.length === 0) {
              return (
                <div className="p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-base font-black text-slate-900">Community Problem Statement Registry</h3>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1 mb-5 leading-relaxed">
                    As verified citizens and local panchayats log community challenges across Jharkhand&apos;s 24 districts, they are processed by the State AI clustering engine and published here with real-time academic lab matches.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                    <Link
                      href="/auth/login"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Submit Community Challenge →</span>
                    </Link>
                    <Link
                      href="/onboarding/university"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Register University Lab</span>
                    </Link>
                  </div>
                </div>
              );
            }

            const half = Math.ceil(filtered.length / 2);
            const firstRow = filtered.slice(0, half);
            const secondRow = filtered.length > 1 ? filtered.slice(half) : filtered;

            const renderCard = (item: ScenarioData & { domain: ResearchDomain }, keySuffix: string) => (
              <figure
                key={`${item.id}-${keySuffix}`}
                className={cn(
                  "relative w-[285px] xs:w-[320px] sm:w-[360px] md:w-[380px] shrink-0 overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group select-none text-left",
                  "border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-lg shadow-xs"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 bg-slate-100 px-2 sm:px-2.5 py-0.5 rounded-full truncate">
                      <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{item.district}</span>
                    </span>
                    <span className="text-[10.5px] sm:text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded border border-blue-200/60 shrink-0">
                      {item.ticketId}
                    </span>
                  </div>

                  <figcaption className="text-sm sm:text-[15px] font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </figcaption>
                  <blockquote className="text-[11.5px] sm:text-xs text-slate-500 mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed">
                    {item.problem}
                  </blockquote>

                  <div className="mt-3 p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100/90 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium text-[10.5px] sm:text-[11px] shrink-0">Assigned Lab:</span>
                      <span className="font-bold text-slate-800 text-[10.5px] sm:text-[11px] truncate">{item.assignedTo}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium text-[10.5px] sm:text-[11px] shrink-0">CSR &amp; Grant:</span>
                      <span className="font-semibold text-emerald-700 text-[10.5px] sm:text-[11px] truncate">{item.funding}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] font-bold text-slate-500 mb-1">
                    <span className="truncate mr-2">{item.stage}</span>
                    <span className="font-mono shrink-0">{item.stageProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                      style={{ width: `${item.stageProgress}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setTicketInput(item.ticketId);
                      handleOpenTicketModal(item);
                    }}
                    className="w-full mt-2 pt-1.5 flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group/btn"
                  >
                    <span className="group-hover/btn:underline">View Resolution Timeline</span>
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </figure>
            );

            return (
              <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-2">
                <Marquee pauseOnHover className="[--duration:35s] [--gap:0.85rem] sm:[--gap:1.25rem] py-2">
                  {firstRow.map((item) => renderCard(item, "r1"))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:35s] [--gap:0.85rem] sm:[--gap:1.25rem] py-2">
                  {secondRow.map((item) => renderCard(item, "r2"))}
                </Marquee>

                {/* Left & Right gradient edge fades */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />
              </div>
            );
          })()}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. INSTITUTIONAL NETWORK (HEIs & CSR LEADERS)
      ───────────────────────────────────────────────────────────── */}
      <section id="institutions-section" className="py-10 sm:py-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center scroll-mt-20">
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase">
          ACADEMIC R&amp;D CONSORTIUM &amp; STRATEGIC CSR PARTNERS
        </span>
        <div className="mt-4 sm:mt-6">
          <LogoCloud logos={CONSORTIUM_LOGOS} />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <SiteFooter />

      {/* ─────────────────────────────────────────────────────────────
          MODAL: TICKET STATUS & RESOLUTION TIMELINE
      ───────────────────────────────────────────────────────────── */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveTicketModal(null)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 pr-8">
              <span className="font-mono text-xs sm:text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {activeTicketModal.id}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                {activeTicketModal.status}
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-slate-900 mt-2 break-words [overflow-wrap:anywhere]">{activeTicketModal.title}</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 break-words [overflow-wrap:anywhere]">
              District: {activeTicketModal.district} • Submitted by: {activeTicketModal.submittedBy} •{" "}
              {activeTicketModal.date}
            </p>

            {/* AI Summary Box */}
            <div className="mt-3 sm:mt-4 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/80">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px] sm:text-xs uppercase tracking-wider mb-1">
                <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI Research Formulation:</span>
              </div>
              <p className="text-[11.5px] sm:text-xs text-slate-700 leading-relaxed font-normal break-words [overflow-wrap:anywhere]">
                {activeTicketModal.aiSummary}
              </p>
            </div>

            {/* University & Grant Spec */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 my-3 sm:my-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold uppercase">
                  Assigned HEI Lab
                </span>
                <p className="text-[11.5px] sm:text-xs font-bold text-slate-900 mt-0.5 break-words">
                  {activeTicketModal.assignedInstitute}
                </p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold uppercase">
                  CSR / Partner
                </span>
                <p className="text-[11.5px] sm:text-xs font-bold text-emerald-700 mt-0.5 break-words">
                  {activeTicketModal.csrPartner}
                </p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold uppercase">
                  Budget
                </span>
                <p className="text-[11.5px] sm:text-xs font-mono font-bold text-slate-900 mt-0.5 break-words">
                  {activeTicketModal.grantAmount}
                </p>
              </div>
            </div>

            {/* Step-by-Step Resolution Timeline */}
            <div className="mt-4 sm:mt-5">
              <h4 className="text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5 sm:mb-3">
                Lifecycle &amp; Redressal Timeline:
              </h4>

              <div className="space-y-3.5 sm:space-y-4 pl-1 sm:pl-2">
                {activeTicketModal.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 sm:gap-3 relative">
                    {idx < activeTicketModal.timeline.length - 1 && (
                      <div
                        className={`absolute left-[10px] sm:left-[11px] top-6 w-[2px] h-full ${step.done ? "bg-emerald-400" : "bg-slate-200"
                          }`}
                      />
                    )}
                    <div
                      className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 z-10 ${step.done
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-slate-200 text-slate-500"
                        }`}
                    >
                      {step.done ? (
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">{step.title}</span>
                        <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-mono">({step.date})</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed break-words">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTicketModal(null)}
                className="w-full sm:w-auto px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: SCENARIO DEEP-DIVE DRAWER
      ───────────────────────────────────────────────────────────── */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedScenario(null)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 pr-8">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {selectedScenario.tag}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                Ticket: {selectedScenario.ticketId}
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-slate-900 mt-2 sm:mt-3 break-words [overflow-wrap:anywhere]">{selectedScenario.title}</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold break-words [overflow-wrap:anywhere]">{selectedScenario.district}</p>

            <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2.5 sm:space-y-3">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[9.5px] sm:text-[10px]">
                  Grassroots Challenge:
                </span>
                <p className="text-slate-800 mt-0.5 text-[11.5px] sm:text-xs break-words [overflow-wrap:anywhere]">{selectedScenario.problem}</p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[9.5px] sm:text-[10px]">
                  AI Technology Cluster:
                </span>
                <p className="text-blue-700 font-semibold mt-0.5 text-[11.5px] sm:text-xs break-words [overflow-wrap:anywhere]">{selectedScenario.aiClustering}</p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[9.5px] sm:text-[10px]">
                  University R&amp;D Team:
                </span>
                <p className="text-slate-900 font-bold mt-0.5 text-[11.5px] sm:text-xs break-words [overflow-wrap:anywhere]">{selectedScenario.assignedTo}</p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[9.5px] sm:text-[10px]">
                  Measured Community Impact:
                </span>
                <p className="text-emerald-700 font-bold mt-0.5 text-[11.5px] sm:text-xs break-words [overflow-wrap:anywhere]">{selectedScenario.impact}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  const tId = selectedScenario.ticketId;
                  setSelectedScenario(null);
                  handleTrackTicket(tId);
                }}
                className="w-full sm:flex-1 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Track Live Resolution Timeline
              </button>
              <button
                onClick={() => setSelectedScenario(null)}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
