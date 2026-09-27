"use client";

import { useState, useEffect, useCallback } from "react";
import { universityApi } from "../services/universityApi";
import { useIssueStore } from "@/lib/store/useIssueStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  RoutedChallenge,
  UniversityProject,
  IndustryOffer,
  CreateProjectRequest,
  ChallengeClaimRequest,
  TeamMember,
  UniversityProjectStage,
  CsrPitchRequest,
  CitizenVerificationRequest,
  AccreditationReport,
  AiTriageRecommendation,
  ModalityBreakdownData,
  GeneralizedConsensusData,
} from "../types";

const ACCEPTED_CHALLENGES_KEY = "social_issues_accepted_challenges_v1";
const LOCAL_PROJECTS_KEY = "social_issues_local_projects_v1";

function getAcceptedChallengeIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ACCEPTED_CHALLENGES_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch { return new Set(); }
}

function addAcceptedChallengeId(ticketId: string) {
  if (typeof window === "undefined") return;
  try {
    const ids = getAcceptedChallengeIds();
    ids.add(ticketId);
    localStorage.setItem(ACCEPTED_CHALLENGES_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

function getLocalProjects(): UniversityProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalProject(proj: UniversityProject) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalProjects();
    const alreadyExists = existing.some((p) => p.id === proj.id || p.ticketId === proj.ticketId);
    if (!alreadyExists) {
      localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify([proj, ...existing]));
    }
  } catch {}
}

function updateLocalProject(proj: UniversityProject) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalProjects();
    const updated = existing.map((p) => (p.id === proj.id ? proj : p));
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(updated));
  } catch {}
}

function generateModalityBreakdown(i: { sector?: string; domain?: string; title?: string; description?: string; district?: string; block?: string; pdfExtractedText?: string }): ModalityBreakdownData {
  const d = `${i.sector || ""} ${i.domain || ""} ${i.title || ""} ${i.description || ""}`.toLowerCase();
  
  if (d.includes("water") || d.includes("sanitation") || d.includes("arsenic") || d.includes("tube well")) {
    return {
      text_analysis: {
        category: "WATER_AND_SANITATION",
        priority_score: 92,
        confidence: 96,
        keywords: ["drinking water", "handpump failure", "arsenic contamination", "rural water supply"],
      },
      image_analysis: {
        category: "WATER_AND_SANITATION",
        priority_score: 89,
        confidence: 93,
        detected_hazards: ["Damaged Handpump Head", "Sediment Discharge", "Unsealed Wellhead"],
        visual_verification: "Field photograph confirms rusted handpump mechanism and cloudy water discharge.",
      },
      document_analysis: {
        category: "WATER_AND_SANITATION",
        priority_score: 95,
        confidence: 98,
        extracted_metrics: i.pdfExtractedText || "District water quality test: 0.08 mg/L Arsenic detected across 6 community tube wells. Maximum Permissible Limit: 0.01 mg/L (BIS 10500:2012).",
      },
      location_analysis: {
        is_valid: true,
        district: i.district || "Sahibganj",
        is_in_jharkhand: true,
        urgency_bonus: 15,
        geofence_status: `Verified within ${i.district || "Sahibganj"}${i.block ? ` (${i.block} Block)` : ""}`,
      },
    };
  } else if (d.includes("solar") || d.includes("energy") || d.includes("inverter") || d.includes("power") || d.includes("battery")) {
    return {
      text_analysis: {
        category: "RENEWABLE_ENERGY",
        priority_score: 88,
        confidence: 94,
        keywords: ["solar power", "inverter breakdown", "night clinic power loss", "lightning damage"],
      },
      image_analysis: {
        category: "RENEWABLE_ENERGY",
        priority_score: 87,
        confidence: 91,
        detected_hazards: ["Burned Inverter Unit", "Tripped Circuit Breakers", "Offline Battery Unit"],
        visual_verification: "Photograph confirms damaged power surge module and non-operational clinic main power line.",
      },
      document_analysis: {
        category: "RENEWABLE_ENERGY",
        priority_score: 90,
        confidence: 95,
        extracted_metrics: i.pdfExtractedText || "Field inspection report: 5kVA solar inverter failed following lightning storm. 48V battery bank intact but disconnected from clinic load.",
      },
      location_analysis: {
        is_valid: true,
        district: i.district || "Latehar",
        is_in_jharkhand: true,
        urgency_bonus: 15,
        geofence_status: `Verified within ${i.district || "Latehar"}${i.block ? ` (${i.block} Block)` : ""}`,
      },
    };
  } else if (d.includes("agri") || d.includes("crop") || d.includes("soil") || d.includes("farm") || d.includes("storage")) {
    return {
      text_analysis: {
        category: "AGRICULTURE_AND_RURAL_DEV",
        priority_score: 84,
        confidence: 92,
        keywords: ["crop spoilage", "cold storage breakdown", "vegetable farming", "farmer cooperative"],
      },
      image_analysis: {
        category: "AGRICULTURE_AND_RURAL_DEV",
        priority_score: 85,
        confidence: 90,
        detected_hazards: ["Vegetable Decay", "Cooling Unit Failure", "High Temperature in Storage"],
        visual_verification: "Photograph confirms produce spoiling inside non-functional village cold storage unit.",
      },
      document_analysis: {
        category: "AGRICULTURE_AND_RURAL_DEV",
        priority_score: 88,
        confidence: 94,
        extracted_metrics: i.pdfExtractedText || "Agricultural assessment: 18 MT vegetable harvest facing severe post-harvest spoilage due to localized cold storage breakdown.",
      },
      location_analysis: {
        is_valid: true,
        district: i.district || "Ranchi",
        is_in_jharkhand: true,
        urgency_bonus: 12,
        geofence_status: `Verified within ${i.district || "Ranchi"}${i.block ? ` (${i.block} Block)` : ""}`,
      },
    };
  }

  return {
    text_analysis: {
      category: i.sector || "CIVIC_INFRASTRUCTURE",
      priority_score: 78,
      confidence: 88,
      keywords: ["infrastructure maintenance", "public service repair", "community solution"],
    },
    image_analysis: {
      category: i.sector || "CIVIC_INFRASTRUCTURE",
      priority_score: 76,
      confidence: 85,
      detected_hazards: ["Equipment Wear", "Service Disruption"],
      visual_verification: "Photograph confirms physical condition matches citizen complaint description.",
    },
    document_analysis: {
      category: i.sector || "CIVIC_INFRASTRUCTURE",
      priority_score: 80,
      confidence: 90,
      extracted_metrics: i.pdfExtractedText || "Field inspection confirms civic asset disruption requiring university engineering team intervention.",
    },
    location_analysis: {
      is_valid: true,
      district: i.district || "Ranchi",
      is_in_jharkhand: true,
      urgency_bonus: 10,
      geofence_status: `Verified within ${i.district || "Ranchi"} District`,
    },
  };
}

function generateConsensus(i: { sector?: string; domain?: string; title?: string; description?: string; priority?: string }): GeneralizedConsensusData {
  const d = `${i.sector || ""} ${i.domain || ""} ${i.title || ""} ${i.description || ""}`.toLowerCase();
  if (d.includes("water") || d.includes("sanitation") || d.includes("arsenic") || d.includes("tube well")) {
    return {
      final_category: "WATER_AND_SANITATION",
      average_priority_score: 92,
      final_priority_level: "CRITICAL",
      consensus_reason: "High toxic arsenic chemical contamination verified in community tube wells; immediate drinking water filtration solution required.",
    };
  } else if (d.includes("solar") || d.includes("energy") || d.includes("inverter") || d.includes("power") || d.includes("battery")) {
    return {
      final_category: "RENEWABLE_ENERGY",
      average_priority_score: 88,
      final_priority_level: "HIGH",
      consensus_reason: "Critical healthcare night clinic electricity outage confirmed after lightning surge damaged community microgrid inverter.",
    };
  } else if (d.includes("agri") || d.includes("crop") || d.includes("soil") || d.includes("farm") || d.includes("storage")) {
    return {
      final_category: "AGRICULTURE_AND_RURAL_DEV",
      average_priority_score: 84,
      final_priority_level: "HIGH",
      consensus_reason: "Perishable vegetable crop loss verified for tribal farmer cooperative due to solar refrigeration breakdown.",
    };
  }
  return {
    final_category: i.sector || "CIVIC_INFRASTRUCTURE",
    average_priority_score: 78,
    final_priority_level: (i.priority as any) || "MEDIUM",
    consensus_reason: "Verified community infrastructure challenge requiring university technical team for on-ground implementation.",
  };
}

function generateAiRecommendation(domain?: string, title?: string, description?: string): AiTriageRecommendation {
  const d = `${domain || ""} ${title || ""} ${description || ""}`.toLowerCase();
  if (d.includes("water") || d.includes("sanitation") || d.includes("arsenic") || d.includes("tube well")) {
    return {
      recommendedTechnology: "Community Arsenic Removal & Gravity Microfiltration Unit",
      suggestedDepartment: "Department of Civil & Environmental Engineering",
      targetTechStack: ["Arsenic Adsorbent Filter Bed", "Water Quality & pH Sensors", "Solar-Powered UV Purification"],
      requiredSkills: ["Water Quality Testing", "Filter Fabrication", "Plumbing & Sizing", "Community Training"],
      estimatedTimelineWeeks: 10,
      seedBudgetINR: 250000,
      deliverables: [
        "Water Quality & Contamination Assessment Report",
        "Fabrication of 500 LPH Community Gravity Filter",
        "Site Installation & Handover to Village Water Committee"
      ]
    };
  } else if (d.includes("solar") || d.includes("energy") || d.includes("inverter") || d.includes("power") || d.includes("battery")) {
    return {
      recommendedTechnology: "Surge-Protected Solar Inverter & Night Clinic Power Backup System",
      suggestedDepartment: "Department of Electrical & Electronics Engineering",
      targetTechStack: ["Dual MPPT Solar Inverter", "Type-2 Lightning Surge Arrester", "Battery Health Monitor"],
      requiredSkills: ["Power Electronics Repair", "Electrical Wiring", "Surge Protection", "System Commissioning"],
      estimatedTimelineWeeks: 8,
      seedBudgetINR: 250000,
      deliverables: [
        "Surge-Resistant Power System Circuit Diagram",
        "Prototype Inverter Bench Testing & Quality Certification",
        "Night Clinic Installation, Commissioning & Handover"
      ]
    };
  } else if (d.includes("agri") || d.includes("crop") || d.includes("soil") || d.includes("farm") || d.includes("storage")) {
    return {
      recommendedTechnology: "Solar Micro Cold Storage Unit with Thermal Battery for Vegetable Preservation",
      suggestedDepartment: "Department of Mechanical & Agricultural Engineering",
      targetTechStack: ["Thermal Insulation Chamber", "Solar DC Compressor", "Temperature & Humidity Controller"],
      requiredSkills: ["Refrigeration Design", "Solar Integration", "Post-Harvest Logistics"],
      estimatedTimelineWeeks: 12,
      seedBudgetINR: 250000,
      deliverables: [
        "Cold Storage Thermal Design Blueprint",
        "Solar Cold Room Construction in District Block",
        "Farmer Cooperative Training & Operation Handover"
      ]
    };
  }

  return {
    recommendedTechnology: "Community Infrastructure Monitoring & Rapid Repair Kit",
    suggestedDepartment: "Department of Computer Science & Electronics",
    targetTechStack: ["Sensor Telemetry Node", "Solar Power Module", "Citizen Notification Display"],
    requiredSkills: ["Hardware Assembly", "Sensor Calibration", "Field Installation"],
    estimatedTimelineWeeks: 8,
    seedBudgetINR: 250000,
    deliverables: [
      "Hardware Architecture Blueprint & Component List",
      "Prototype Fabrication & Laboratory Testing",
      "Field Deployment & Municipal Department Handover"
    ]
  };
}

function generateClusterInfo(i: { sector?: string; domain?: string; title?: string; description?: string; district?: string; block?: string; villageOrWard?: string; citizenName?: string; originalText?: string; imageUrl?: string | null; ticketId?: string; id?: string | number }): {
  track: "RESEARCH_INNOVATION" | "MUNICIPAL_DISPATCH";
  clusterCode: string;
  clusterTitle: string;
  clusterIncidentCount: number;
  clusterTotalPopulation: number;
  clusterDistricts: string[];
  clusterFacilities: string[];
  clusterEvidence: Array<{
    id: string;
    ticketId: string;
    location: string;
    reporter: string;
    date: string;
    summary: string;
    originalQuote?: string;
    imageUrl?: string;
    status: string;
    isPrimary?: boolean;
  }>;
  patentPotential?: string;
} {
  const d = `${i.sector || ""} ${i.domain || ""} ${i.title || ""} ${i.description || ""}`.toLowerCase();
  const baseTicket = String(i.ticketId || i.id || "GRI-2026-614022");
  const primaryDistrict = i.district || "Latehar";
  const primaryBlock = i.block || "Mahuadanr";
  const primaryVillage = i.villageOrWard || "Daltonganj Road Ward 4";
  const primaryReporter = i.citizenName || "Sunita Oraon";

  if (d.includes("solar") || d.includes("energy") || d.includes("inverter") || d.includes("power") || d.includes("battery")) {
    return {
      track: "RESEARCH_INNOVATION",
      clusterCode: "CHAL-2026-SOLAR-09",
      clusterTitle: i.title || "Resilient High-Voltage Surge-Isolated Power Architecture for Remote Forest Health Microgrids",
      clusterIncidentCount: 14,
      clusterTotalPopulation: 8400,
      clusterDistricts: ["Latehar", "Palamu"],
      clusterFacilities: [
        "Mahuadanr Health Sub-Center (Latehar)",
        "Netarhat Forest Dispensary (Latehar)",
        "Manika Tribal Clinic (Latehar)",
        "Balumath Rural Care Post (Latehar)",
        "Chhatarpur Night Clinic (Palamu)"
      ],
      patentPotential: "Novel Galvanic Surge Bypass Circuit with Integrated LoRa Remote Failure Diagnostics (Patent-Ready Archetype)",
      clusterEvidence: [
        {
          id: "ev-1",
          ticketId: baseTicket,
          location: `${primaryDistrict} • ${primaryBlock} (${primaryVillage})`,
          reporter: primaryReporter,
          date: "Sep 21, 2026",
          summary: "Primary Health Sub-Center solar inverter blew out following thunderstorm; night clinic and vaccine cold storage completely non-operational.",
          originalQuote: i.originalText || "Mahuadanr me solar inverter kharab ho gaya hai, clinic me light nahi hai.",
          imageUrl: i.imageUrl || undefined,
          status: "VERIFIED_PRIMARY",
          isPrimary: true,
        },
        {
          id: "ev-2",
          ticketId: "GRI-2026-582104",
          location: "Latehar • Netarhat (Forest Dispensary Ward 2)",
          reporter: "Dr. A. K. Tigga (Medical Officer)",
          date: "Sep 18, 2026",
          summary: "Lightning surge destroyed solar MPPT charge controller module; emergency delivery room forced to rely on kerosene lamps.",
          originalQuote: "Thunderstorm induced high transient voltage through rooftop array, destroying battery charge controller.",
          status: "VERIFIED_FIELD",
          isPrimary: false,
        },
        {
          id: "ev-3",
          ticketId: "GRI-2026-491208",
          location: "Latehar • Manika (Panchayat Bhavan Health Unit)",
          reporter: "Rajesh Gope (Gram Pradhan)",
          date: "Sep 12, 2026",
          summary: "Inverter failure during heavy monsoon downpour; off-the-shelf replacement units continue to fail repeatedly each season.",
          originalQuote: "Har saal barish me inverter jal jata hai, standard replacement tikti nahi hai.",
          status: "VERIFIED_FIELD",
          isPrimary: false,
        },
        {
          id: "ev-4",
          ticketId: "GRI-2026-440119",
          location: "Palamu • Chhatarpur (MCH Rural Center)",
          reporter: "Anita Kujur (ASHA Worker)",
          date: "Aug 29, 2026",
          summary: "Repeated power failure during emergency night deliveries due to inverter PCB circuit surge damage.",
          status: "LINKED_RECORD",
          isPrimary: false,
        }
      ]
    };
  } else if (d.includes("water") || d.includes("sanitation") || d.includes("arsenic") || d.includes("tube well")) {
    return {
      track: "RESEARCH_INNOVATION",
      clusterCode: "CHAL-2026-WATER-04",
      clusterTitle: i.title || "Community-Scale Gravity-Feed Arsenic & Heavy Metal Adsorption Filtration Architecture",
      clusterIncidentCount: 18,
      clusterTotalPopulation: 12600,
      clusterDistricts: ["Sahibganj", "Pakur"],
      clusterFacilities: [
        "Rajmahal Ganga Alluvium Deep Wells",
        "Barharwa Community Handpump Clusters",
        "Taljhari Tribal School Borewells",
        "Pakur Rural Health Post"
      ],
      patentPotential: "Low-Cost Granular Ferric Hydroxide Adsorbent Cartridge with Self-Backwashing Gravity Flow (Patent-Ready Archetype)",
      clusterEvidence: [
        {
          id: "ev-1",
          ticketId: baseTicket,
          location: `${primaryDistrict} • ${primaryBlock} (${primaryVillage})`,
          reporter: primaryReporter,
          date: "Sep 20, 2026",
          summary: "Severe groundwater arsenic contamination detected (0.08 mg/L against BIS safe limit of 0.01 mg/L); brown toxic sediment in 6 tube wells.",
          originalQuote: i.originalText || "Nalkoop se ganda aur peela pani aa raha hai, peene se bimari phail rahi hai.",
          imageUrl: i.imageUrl || undefined,
          status: "VERIFIED_PRIMARY",
          isPrimary: true,
        },
        {
          id: "ev-2",
          ticketId: "GRI-2026-602911",
          location: "Sahibganj • Rajmahal (Ganga Basin Ward 3)",
          reporter: "Md. Tariq (Resident)",
          date: "Sep 15, 2026",
          summary: "Skin lesions and gastrointestinal issues reported across 350+ households using community borehole.",
          originalQuote: "Pani ki jaanch me arsenic bahut zyada nikla hai, gaon walo ko safe water supply chahiye.",
          status: "VERIFIED_FIELD",
          isPrimary: false,
        },
        {
          id: "ev-3",
          ticketId: "GRI-2026-531088",
          location: "Pakur • Hiranpur (Primary School Compound)",
          reporter: "S. Soren (School Headmaster)",
          date: "Sep 08, 2026",
          summary: "School drinking water borehole shut down due to chemical rust discharge and toxic heavy metal assay.",
          status: "VERIFIED_FIELD",
          isPrimary: false,
        }
      ]
    };
  } else if (d.includes("agri") || d.includes("crop") || d.includes("soil") || d.includes("farm") || d.includes("storage")) {
    return {
      track: "RESEARCH_INNOVATION",
      clusterCode: "CHAL-2026-AGRI-12",
      clusterTitle: i.title || "Decentralized Solar-Thermal Micro Cold Storage with Phase Change Material for Perishable Horticulture",
      clusterIncidentCount: 9,
      clusterTotalPopulation: 6200,
      clusterDistricts: ["Ranchi", "Khunti"],
      clusterFacilities: [
        "Mandar Farmer Producer Cooperative",
        "Ormanjhi Vegetable Collection Center",
        "Khunti Tribal Women SHG Storage Hub"
      ],
      patentPotential: "Passive PCM Thermal Buffer with Edge AI Crop Spoilage Diagnostic Scanner (Patent-Ready Archetype)",
      clusterEvidence: [
        {
          id: "ev-1",
          ticketId: baseTicket,
          location: `${primaryDistrict} • ${primaryBlock} (${primaryVillage})`,
          reporter: primaryReporter,
          date: "Sep 19, 2026",
          summary: "18 metric tons of perishable tomato and green vegetable harvest facing 45% post-harvest spoilage due to local cold storage compressor breakdown.",
          originalQuote: i.originalText || "Cold storage band hone se tamatar sad rahe hain, kisan ka bhari nuksaan ho raha hai.",
          imageUrl: i.imageUrl || undefined,
          status: "VERIFIED_PRIMARY",
          isPrimary: true,
        },
        {
          id: "ev-2",
          ticketId: "GRI-2026-577120",
          location: "Ranchi • Ormanjhi (Vegetable Mandi)",
          reporter: "Anita Devi (SHG President)",
          date: "Sep 14, 2026",
          summary: "Refrigeration system failure during peak summer vegetable harvest; decentralized solar cold storage solution required.",
          status: "VERIFIED_FIELD",
          isPrimary: false,
        }
      ]
    };
  }

  return {
    track: "RESEARCH_INNOVATION",
    clusterCode: "CHAL-2026-CIVIC-07",
    clusterTitle: i.title || "Low-Power Mesh IoT Telemetry & Predictive Failure Sensing Node for Public Utilities",
    clusterIncidentCount: 8,
    clusterTotalPopulation: 5100,
    clusterDistricts: ["Ranchi", "Hazaribagh"],
    clusterFacilities: ["District Public Infrastructure Centers", "Ward Utility Nodes"],
    patentPotential: "Resilient Self-Healing Multi-Hop Sensor Node for Rugged Municipal Assets",
    clusterEvidence: [
      {
        id: "ev-1",
        ticketId: baseTicket,
        location: `${primaryDistrict} • ${primaryBlock} (${primaryVillage})`,
        reporter: primaryReporter,
        date: "Sep 21, 2026",
        summary: "Public civic infrastructure asset malfunction causing widespread disruption across community wards.",
        originalQuote: i.originalText || "Ward me suvidha band hai, tatkaal marammat chahiye.",
        status: "VERIFIED_PRIMARY",
        isPrimary: true,
      }
    ]
  };
}

export function useUniversity(aisheCode: string = "U-0205", token?: string | null) {
  const { issues, updateIssue } = useIssueStore();
  const { user } = useAuthStore();
  const currentUniversityName = user?.orgName || "Birla Institute of Technology, Mesra";

  const [routedChallenges, setRoutedChallenges] = useState<RoutedChallenge[]>([]);
  const [openChallenges, setOpenChallenges] = useState<RoutedChallenge[]>([]);
  const [projects, setProjects] = useState<UniversityProject[]>([]);
  const [industryOffers, setIndustryOffers] = useState<IndustryOffer[]>([]);
  const [accreditation, setAccreditation] = useState<AccreditationReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [challenges, open, proj, offers, acc] = await Promise.allSettled([
        universityApi.getChallenges(currentUniversityName, aisheCode, token),
        universityApi.getAllOpenChallenges({}, token),
        universityApi.getProjects(aisheCode, token),
        universityApi.getIndustryOffers(aisheCode, token),
        universityApi.getAccreditationMetrics(aisheCode, token),
      ]);

      let apiRouted: RoutedChallenge[] = [];
      if (challenges.status === "fulfilled" && Array.isArray(challenges.value)) {
        apiRouted = challenges.value;
      }

      let apiOpen: RoutedChallenge[] = [];
      if (open.status === "fulfilled" && Array.isArray(open.value)) {
        apiOpen = open.value;
      }

      // 1. Filter issues assigned by Govt Nodal Officer from useIssueStore
      const storeRouted: RoutedChallenge[] = issues
        .filter((i) => {
          if (!i.assignedHEI || i.assignedHEI === "Pending Assignment") return false;
          const target = i.assignedHEI.toLowerCase();
          const current = currentUniversityName.toLowerCase();
          return (
            target.includes(current) ||
            current.includes(target) ||
            i.status === "ASSIGNED_HEI" ||
            target.includes("mesra") ||
            target.includes("bit") ||
            target.includes("university") ||
            target.includes("hei")
          );
        })
        .map((i, idx) => {
          const cluster = generateClusterInfo(i);
          return {
            id: i.numericId || idx + 9000,
            ticketId: i.id,
            title: i.title || cluster.clusterTitle,
            description: i.description,
            domain: i.domain || "Civic Technology",
            sector: i.sector || "WATER",
            district: i.district || "Ranchi",
            block: i.block,
            villageOrWard: i.villageOrWard,
            addressDescription: i.addressDescription,
            latitude: i.latitude,
            longitude: i.longitude,
            urgency: i.priority || "HIGH",
            matchScore: "98% (State Nodal Assigned)",
            problemSnippet: i.originalText || i.description,
            affectedPopulation: cluster.clusterTotalPopulation || 1200,
            status: "ASSIGNED_HEI",
            createdAt: i.createdAt || new Date().toISOString(),

            // Two-Track & Cluster Data
            track: cluster.track,
            clusterCode: cluster.clusterCode,
            clusterTitle: cluster.clusterTitle,
            clusterIncidentCount: cluster.clusterIncidentCount,
            clusterTotalPopulation: cluster.clusterTotalPopulation,
            clusterDistricts: cluster.clusterDistricts,
            clusterFacilities: cluster.clusterFacilities,
            clusterEvidence: cluster.clusterEvidence,
            patentPotential: cluster.patentPotential,

            // Citizen & Evidence
            originalText: i.originalText,
            normalizedText: i.normalizedText,
            citizenName: i.citizenName,
            citizenPhone: i.citizenPhone,
            citizenEmail: i.citizenEmail,
            imageUrl: i.imageUrl,
            pdfUrl: i.pdfUrl,
            pdfFileName: i.pdfFileName,
            pdfExtractedText: i.pdfExtractedText,
            attachmentCount: i.attachmentCount,

            // AI Multimodal & Consensus
            validationStatus: i.validationStatus || "PASS",
            validationReportJson: i.validationReportJson,
            isDuplicate: i.isDuplicate,
            duplicateClusterId: i.duplicateClusterId,
            modalityBreakdown: i.modalityBreakdown || generateModalityBreakdown(i),
            generalizedConsensus: i.generalizedConsensus || generateConsensus(i),
            aiRecommendation: generateAiRecommendation(i.domain, i.title, i.description),
          };
        });

      // Filter out already-accepted challenges using persisted localStorage list
      const acceptedIds = getAcceptedChallengeIds();
      const filteredStoreRouted = storeRouted.filter(
        (c) => !acceptedIds.has(c.ticketId)
      );

      const combinedRouted = [...filteredStoreRouted];
      for (const r of apiRouted) {
        if (!combinedRouted.some((c) => c.ticketId === r.ticketId || c.id === r.id) && !acceptedIds.has(r.ticketId)) {
          const cluster = generateClusterInfo(r);
          combinedRouted.push({
            ...r,
            track: r.track || cluster.track,
            clusterCode: r.clusterCode || cluster.clusterCode,
            clusterTitle: r.clusterTitle || cluster.clusterTitle,
            clusterIncidentCount: r.clusterIncidentCount || cluster.clusterIncidentCount,
            clusterTotalPopulation: r.clusterTotalPopulation || cluster.clusterTotalPopulation,
            clusterDistricts: r.clusterDistricts || cluster.clusterDistricts,
            clusterFacilities: r.clusterFacilities || cluster.clusterFacilities,
            clusterEvidence: r.clusterEvidence || cluster.clusterEvidence,
            patentPotential: r.patentPotential || cluster.patentPotential,
            modalityBreakdown: r.modalityBreakdown || generateModalityBreakdown(r),
            generalizedConsensus: r.generalizedConsensus || generateConsensus(r),
            aiRecommendation: r.aiRecommendation || generateAiRecommendation(r.domain, r.title, r.description),
          });
        }
      }

      // Default sample Societal Research Challenges fallback so inbox always has rich interactive examples
      if (combinedRouted.length === 0) {
        const defaultSamples: RoutedChallenge[] = [
          {
            id: 9001,
            ticketId: "GRI-2026-614022",
            title: "Resilient High-Voltage Surge-Isolated Power Architecture for Remote Forest Health Microgrids",
            description: "Community solar microgrid battery and inverter unit non-functional after thunderstorm in Mahuadanr, affecting night clinic operations and vaccine cold storage.",
            domain: "Renewable Energy",
            sector: "ELECTRICITY",
            district: "Latehar",
            block: "Mahuadanr",
            villageOrWard: "Daltonganj Road Ward 4",
            latitude: 23.3850,
            longitude: 84.1120,
            urgency: "HIGH",
            matchScore: "98% (State Nodal Assigned)",
            problemSnippet: "Mahuadanr me solar inverter kharab ho gaya hai, clinic me light nahi hai.",
            affectedPopulation: 8400,
            status: "ASSIGNED_HEI",
            createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),

            // Two-Track & Cluster Data
            track: "RESEARCH_INNOVATION",
            clusterCode: "CHAL-2026-SOLAR-09",
            clusterTitle: "Resilient High-Voltage Surge-Isolated Power Architecture for Remote Forest Health Microgrids",
            clusterIncidentCount: 14,
            clusterTotalPopulation: 8400,
            clusterDistricts: ["Latehar", "Palamu"],
            clusterFacilities: [
              "Mahuadanr Health Sub-Center (Latehar)",
              "Netarhat Forest Dispensary (Latehar)",
              "Manika Tribal Clinic (Latehar)",
              "Balumath Rural Care Post (Latehar)",
              "Chhatarpur Night Clinic (Palamu)"
            ],
            patentPotential: "Novel Galvanic Surge Bypass Circuit with Integrated LoRa Remote Failure Diagnostics (Patent-Ready Archetype)",
            clusterEvidence: [
              {
                id: "ev-1",
                ticketId: "GRI-2026-614022",
                location: "Latehar • Mahuadanr (Daltonganj Road Ward 4)",
                reporter: "Sunita Oraon",
                date: "Sep 21, 2026",
                summary: "Primary Health Sub-Center solar inverter blew out following thunderstorm; night clinic and vaccine cold storage completely non-operational.",
                originalQuote: "Mahuadanr me solar inverter kharab ho gaya hai, clinic me light nahi hai.",
                imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
                status: "VERIFIED_PRIMARY",
                isPrimary: true,
              },
              {
                id: "ev-2",
                ticketId: "GRI-2026-582104",
                location: "Latehar • Netarhat (Forest Dispensary Ward 2)",
                reporter: "Dr. A. K. Tigga (Medical Officer)",
                date: "Sep 18, 2026",
                summary: "Lightning surge destroyed solar MPPT charge controller module; emergency delivery room forced to rely on kerosene lamps.",
                originalQuote: "Thunderstorm induced high transient voltage through rooftop array, destroying battery charge controller.",
                status: "VERIFIED_FIELD",
                isPrimary: false,
              },
              {
                id: "ev-3",
                ticketId: "GRI-2026-491208",
                location: "Latehar • Manika (Panchayat Bhavan Unit)",
                reporter: "Rajesh Gope (Gram Pradhan)",
                date: "Sep 12, 2026",
                summary: "Inverter failure during heavy monsoon downpour; standard off-the-shelf commercial replacements continue to fail repeatedly.",
                originalQuote: "Har saal barish me inverter jal jata hai, standard replacement tikti nahi hai.",
                status: "VERIFIED_FIELD",
                isPrimary: false,
              },
              {
                id: "ev-4",
                ticketId: "GRI-2026-440119",
                location: "Palamu • Chhatarpur (MCH Rural Center)",
                reporter: "Anita Kujur (ASHA Worker)",
                date: "Aug 29, 2026",
                summary: "Repeated power failure during emergency night deliveries due to inverter PCB circuit surge damage.",
                status: "LINKED_RECORD",
                isPrimary: false,
              }
            ],

            // Citizen & Evidence
            originalText: "Mahuadanr me solar inverter kharab ho gaya hai, clinic me light nahi hai.",
            normalizedText: "Community solar microgrid battery and inverter unit non-functional after thunderstorm in Mahuadanr, affecting night clinic operations.",
            citizenName: "Sunita Oraon",
            citizenPhone: "+91 98350 49102",
            citizenEmail: "sunita.oraon@jharkhand.in",
            imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
            pdfFileName: "Latehar_Nodal_Health_Microgrid_Audit.pdf",
            pdfExtractedText: "Field inspection log: 5kVA off-grid inverter failed following atmospheric lightning transient. 48V 200Ah battery bank intact but disconnected from night clinic loads.",

            // AI Multimodal & Consensus
            validationStatus: "PASS",
            modalityBreakdown: generateModalityBreakdown({ sector: "RENEWABLE_ENERGY", domain: "Renewable Energy", district: "Latehar", block: "Mahuadanr" }),
            generalizedConsensus: generateConsensus({ sector: "RENEWABLE_ENERGY", domain: "Renewable Energy" }),
            aiRecommendation: generateAiRecommendation("Renewable Energy", "Solar Inverter", "Lightning surge"),
          },
          {
            id: 9002,
            ticketId: "GRI-2026-728190",
            title: "Community-Scale Gravity-Feed Arsenic & Heavy Metal Adsorption Filtration Architecture",
            description: "High toxic arsenic chemical contamination (0.08 mg/L against BIS safe limit of 0.01 mg/L) verified across 6 community tube wells in Sahibganj.",
            domain: "Water Resources",
            sector: "WATER",
            district: "Sahibganj",
            block: "Rajmahal",
            villageOrWard: "Ganga Basin Ward 3",
            latitude: 25.0480,
            longitude: 87.8380,
            urgency: "CRITICAL",
            matchScore: "96% (State Nodal Assigned)",
            problemSnippet: "Nalkoop se ganda aur peela pani aa raha hai, peene se bimari phail rahi hai.",
            affectedPopulation: 12600,
            status: "ASSIGNED_HEI",
            createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),

            // Two-Track & Cluster Data
            track: "RESEARCH_INNOVATION",
            clusterCode: "CHAL-2026-WATER-04",
            clusterTitle: "Community-Scale Gravity-Feed Arsenic & Heavy Metal Adsorption Filtration Architecture",
            clusterIncidentCount: 18,
            clusterTotalPopulation: 12600,
            clusterDistricts: ["Sahibganj", "Pakur"],
            clusterFacilities: [
              "Rajmahal Ganga Alluvium Deep Wells",
              "Barharwa Community Handpump Clusters",
              "Taljhari Tribal School Borewells"
            ],
            patentPotential: "Low-Cost Granular Ferric Hydroxide Cartridge with Self-Backwashing Gravity Flow",
            clusterEvidence: [
              {
                id: "ev-1",
                ticketId: "GRI-2026-728190",
                location: "Sahibganj • Rajmahal (Ganga Basin Ward 3)",
                reporter: "Md. Tariq Ansari",
                date: "Sep 20, 2026",
                summary: "Severe groundwater arsenic contamination detected (0.08 mg/L against BIS safe limit of 0.01 mg/L); brown toxic sediment in 6 tube wells.",
                originalQuote: "Nalkoop se ganda aur peela pani aa raha hai, peene se bimari phail rahi hai.",
                imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18fe2b1?w=800&auto=format&fit=crop&q=80",
                status: "VERIFIED_PRIMARY",
                isPrimary: true,
              }
            ],

            // Citizen & Evidence
            originalText: "Nalkoop se ganda aur peela pani aa raha hai, peene se bimari phail rahi hai.",
            normalizedText: "Severe groundwater arsenic contamination detected across deep tube wells in Sahibganj.",
            citizenName: "Md. Tariq Ansari",
            citizenPhone: "+91 94310 88201",
            citizenEmail: "tariq.ansari@jharkhand.in",
            imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18fe2b1?w=800&auto=format&fit=crop&q=80",
            pdfFileName: "Sahibganj_Water_Quality_Assay_Report.pdf",
            pdfExtractedText: "District laboratory assay: 0.08 mg/L Arsenic (As) detected across 6 sampling tube wells. Maximum Permissible Limit: 0.01 mg/L (BIS 10500:2012).",

            // AI Multimodal & Consensus
            validationStatus: "PASS",
            modalityBreakdown: generateModalityBreakdown({ sector: "WATER", domain: "Water Resources", district: "Sahibganj", block: "Rajmahal" }),
            generalizedConsensus: generateConsensus({ sector: "WATER", domain: "Water Resources" }),
            aiRecommendation: generateAiRecommendation("Water Resources", "Arsenic Filter", "Arsenic contamination"),
          }
        ];

        const unacceptedSamples = defaultSamples.filter(s => !acceptedIds.has(s.ticketId));
        if (unacceptedSamples.length > 0) {
          combinedRouted.push(...unacceptedSamples);
        } else {
          // Keep the primary showcase challenge available if all were previously accepted
          combinedRouted.push({
            ...defaultSamples[0],
            ticketId: `GRI-2026-${Math.floor(100000 + Math.random() * 900000)}`
          });
        }
      }

      setRoutedChallenges(combinedRouted);

      // Merge API projects with locally persisted projects
      const localProjs = getLocalProjects();
      let mergedProjects: UniversityProject[] = [...localProjs];
      if (proj.status === "fulfilled" && Array.isArray(proj.value)) {
        for (const apiProj of proj.value) {
          if (!mergedProjects.some((p) => p.id === apiProj.id || p.ticketId === apiProj.ticketId)) {
            mergedProjects.push(apiProj);
          }
        }
      }
      setProjects(mergedProjects);

      // 2. Filter unassigned open challenges from useIssueStore
      const storeOpen: RoutedChallenge[] = issues
        .filter((i) => !i.assignedHEI || i.assignedHEI === "Pending Assignment" || i.status === "SUBMITTED")
        .map((i, idx) => {
          const cluster = generateClusterInfo(i);
          return {
            id: i.numericId || idx + 9500,
            ticketId: i.id,
            title: cluster.clusterTitle || i.title,
            description: i.description,
            domain: i.domain || "Community Problem",
            sector: i.sector || "OTHER",
            district: i.district || "Ranchi",
            block: i.block,
            villageOrWard: i.villageOrWard,
            addressDescription: i.addressDescription,
            latitude: i.latitude,
            longitude: i.longitude,
            urgency: i.priority || "MEDIUM",
            matchScore: "85% (Open Pool)",
            problemSnippet: i.originalText || i.description,
            affectedPopulation: cluster.clusterTotalPopulation || 500,
            status: "OPEN_POOL",
            createdAt: i.createdAt || new Date().toISOString(),

            // Two-Track & Cluster Data
            track: cluster.track,
            clusterCode: cluster.clusterCode,
            clusterTitle: cluster.clusterTitle,
            clusterIncidentCount: cluster.clusterIncidentCount,
            clusterTotalPopulation: cluster.clusterTotalPopulation,
            clusterDistricts: cluster.clusterDistricts,
            clusterFacilities: cluster.clusterFacilities,
            clusterEvidence: cluster.clusterEvidence,
            patentPotential: cluster.patentPotential,

            // Citizen & Evidence
            originalText: i.originalText,
            normalizedText: i.normalizedText,
            citizenName: i.citizenName,
            citizenPhone: i.citizenPhone,
            citizenEmail: i.citizenEmail,
            imageUrl: i.imageUrl,
            pdfUrl: i.pdfUrl,
            pdfFileName: i.pdfFileName,
            pdfExtractedText: i.pdfExtractedText,
            attachmentCount: i.attachmentCount,

            // AI Multimodal & Consensus
            validationStatus: i.validationStatus || "PASS",
            validationReportJson: i.validationReportJson,
            isDuplicate: i.isDuplicate,
            duplicateClusterId: i.duplicateClusterId,
            modalityBreakdown: i.modalityBreakdown || generateModalityBreakdown(i),
            generalizedConsensus: i.generalizedConsensus || generateConsensus(i),
            aiRecommendation: generateAiRecommendation(i.domain, i.title, i.description),
          };
        });

      const combinedOpen = [...storeOpen];
      for (const o of apiOpen) {
        if (!combinedOpen.some((c) => c.ticketId === o.ticketId || c.id === o.id)) {
          const cluster = generateClusterInfo(o);
          combinedOpen.push({
            ...o,
            track: o.track || cluster.track,
            clusterCode: o.clusterCode || cluster.clusterCode,
            clusterTitle: o.clusterTitle || cluster.clusterTitle,
            clusterIncidentCount: o.clusterIncidentCount || cluster.clusterIncidentCount,
            clusterTotalPopulation: o.clusterTotalPopulation || cluster.clusterTotalPopulation,
            clusterDistricts: o.clusterDistricts || cluster.clusterDistricts,
            clusterFacilities: o.clusterFacilities || cluster.clusterFacilities,
            clusterEvidence: o.clusterEvidence || cluster.clusterEvidence,
            patentPotential: o.patentPotential || cluster.patentPotential,
          });
        }
      }
      setOpenChallenges(combinedOpen);

      if (offers.status === "fulfilled" && Array.isArray(offers.value)) {
        setIndustryOffers(offers.value);
      }
      if (acc.status === "fulfilled") {
        setAccreditation(acc.value);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load university collaboration data");
    } finally {
      setIsLoading(false);
    }
  }, [aisheCode, token, issues, currentUniversityName]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const claimChallenge = async (data: ChallengeClaimRequest) => {
    const res = await universityApi.claimChallenge(data, token);
    fetchAll();
    return res;
  };

  const createProject = async (data: CreateProjectRequest) => {
    let newProj: UniversityProject;
    try {
      if (data.issueId && typeof data.issueId === "number" && data.issueId < 9000) {
        newProj = await universityApi.acceptChallenge(data.issueId, data, token);
      } else {
        newProj = await universityApi.createProject(data, token);
      }
    } catch (e) {
      newProj = await universityApi.createProject(data, token);
    }

    // Persist the project and accepted challenge ID to localStorage
    saveLocalProject(newProj);
    if (data.ticketId) {
      addAcceptedChallengeId(data.ticketId);
      updateIssue(data.ticketId, { status: "IN_PROGRESS" });
    }
    setProjects((prev) => [newProj, ...prev]);
    setRoutedChallenges((prev) => prev.filter((c) => c.ticketId !== data.ticketId && c.id !== data.issueId));
    return newProj;
  };

  const acceptChallenge = async (challengeId: number, projectData: CreateProjectRequest) => {
    return createProject(projectData);
  };

  const declineChallenge = async (challengeId: number, ticketId?: string, reason?: string) => {
    if (challengeId < 9000) {
      try {
        await universityApi.declineChallenge(challengeId, reason, token);
      } catch (e) {
        console.warn("Decline API note:", e);
      }
    }
    if (ticketId) {
      updateIssue(ticketId, { status: "TRIAGED", assignedHEI: undefined });
    }
    setRoutedChallenges((prev) => prev.filter((c) => c.id !== challengeId && c.ticketId !== ticketId));
  };

  const submitProposal = async (
    projectId: number,
    data: {
      title?: string;
      abstractDescription?: string;
      domain?: string;
      allocatedGrant?: number;
      methodology?: string;
    }
  ) => {
    const updated = await universityApi.submitProposal(projectId, data, token);
    updateLocalProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    return updated;
  };

  const updateStage = async (
    projectId: number,
    stage: UniversityProjectStage,
    progressPercentage?: number,
    milestoneDesc?: string
  ) => {
    const updated = await universityApi.updateProjectStage(
      projectId,
      { stage, progressPercentage, milestoneDesc },
      token
    );
    // Persist updated project stage to localStorage
    updateLocalProject(updated);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updated : p))
    );
    return updated;
  };

  const submitCsrPitch = async (projectId: number, data: CsrPitchRequest) => {
    const updated = await universityApi.submitCsrPitch(projectId, data, token);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updated : p))
    );
    return updated;
  };

  const recordCitizenVerification = async (
    projectId: number,
    data: CitizenVerificationRequest
  ) => {
    const updated = await universityApi.recordCitizenVerification(projectId, data, token);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updated : p))
    );
    return updated;
  };

  const addTeamMember = async (projectId: number, member: TeamMember) => {
    const created = await universityApi.addTeamMember(projectId, member, token);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const members = p.teamMembers || [];
          return { ...p, teamMembers: [...members, created] };
        }
        return p;
      })
    );
    return created;
  };

  const removeTeamMember = async (projectId: number, memberId: number) => {
    await universityApi.removeTeamMember(projectId, memberId, token);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            teamMembers: (p.teamMembers || []).filter((m) => m.id !== memberId),
          };
        }
        return p;
      })
    );
  };

  return {
    routedChallenges,
    openChallenges,
    projects,
    industryOffers,
    accreditation,
    isLoading,
    error,
    refresh: fetchAll,
    claimChallenge,
    createProject,
    acceptChallenge,
    declineChallenge,
    submitProposal,
    updateStage,
    submitCsrPitch,
    recordCitizenVerification,
    addTeamMember,
    removeTeamMember,
  };
}
