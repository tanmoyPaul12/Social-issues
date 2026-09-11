export type DeploymentStatus = "PLANNED" | "LIVE" | "COMPLETED" | "SUSPENDED";

export interface TestbedSponsorship {
  id: number;
  industryProfileId: number;
  industryCompanyName?: string;
  pilotId?: number;
  pilotTitle?: string;
  projectName?: string;
  pilotPhase?: string;
  testbedName: string;
  district: string;
  block?: string;
  villageOrLocation?: string;
  beneficiariesImpacted: number;
  beneficiaryCount: number;
  status: string;
  deploymentStatus: DeploymentStatus;
  deploymentStatusLabel: string;
  evidencePhotoUrlsRaw?: string;
  evidencePhotoUrls: string[];
  liveDataFeedUrl?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TestbedDistrictSummary {
  district: string;
  activeTestbedsCount: number;
  totalBeneficiaries: number;
  liveDeploymentsCount: number;
}

export interface CreateTestbedPayload {
  testbedName: string;
  district: string;
  block?: string;
  villageOrLocation?: string;
  pilotId?: number;
  projectName?: string;
  pilotPhase?: string;
  beneficiaryCount?: number;
  beneficiariesImpacted?: number;
  deploymentStatus?: DeploymentStatus;
  liveDataFeedUrl?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface UpdateTestbedStatusPayload {
  status: DeploymentStatus;
  beneficiaryCount?: number;
  beneficiariesImpacted?: number;
  liveDataFeedUrl?: string;
  completedAt?: string;
  notes?: string;
}

export const JHARKHAND_DISTRICTS: string[] = [
  "Ranchi",
  "Dhanbad",
  "East Singhbhum",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Giridih",
  "Ramgarh",
  "Palamu",
  "Gumla",
  "Dumka",
  "West Singhbhum",
  "Latehar",
  "Saraikela Kharsawan",
  "Chatra",
  "Godda",
  "Jamtara",
  "Khunti",
  "Koderma",
  "Pakur",
  "Sahibganj",
  "Simdega",
  "Garhwa",
  "Lohardaga",
];

export const DEPLOYMENT_STATUS_CONFIG: Record<
  DeploymentStatus,
  { label: string; badgeClass: string; dotClass: string; description: string }
> = {
  PLANNED: {
    label: "Planned",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    dotClass: "bg-slate-400",
    description: "Site survey completed; logistics and sensor calibration in progress",
  },
  LIVE: {
    label: "Live Trial",
    badgeClass: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    dotClass: "bg-emerald-500 animate-pulse",
    description: "Active real-world field deployment with live telemetry and data collection",
  },
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
    dotClass: "bg-indigo-500",
    description: "Trial lifecycle completed with outcome evaluation and verified impact",
  },
  SUSPENDED: {
    label: "Suspended",
    badgeClass: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    dotClass: "bg-amber-500",
    description: "Field operations paused for maintenance, re-calibration or weather advisory",
  },
};
