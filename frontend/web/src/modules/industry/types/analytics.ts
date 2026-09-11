export interface ImpactSummary {
  totalBeneficiaries: number;
  districtsCovered: number;
  pilotsCompleted: number;
  activePilotsCount: number;
  totalCsrSpend: number;
  formattedCsrSpend: string;
  totalGrantCommitted: number;
  formattedGrantCommitted: string;
  patentsGenerated: number;
  jobsCreated: number;
  activeTestbedCount: number;
  coDevelopmentAgreementsCount: number;
  avgRoiPercentage: number;
}

export interface QuarterlyTrend {
  quarter: string;
  year: number;
  committedAmount: number;
  formattedCommittedAmount: string;
  disbursedAmount: number;
  formattedDisbursedAmount: string;
  beneficiariesImpacted: number;
  activePilotsCount: number;
  testbedDeployments: number;
}
