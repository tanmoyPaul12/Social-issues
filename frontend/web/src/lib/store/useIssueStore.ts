import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface GrassrootIssueRecord {
  id: string;
  numericId?: number;
  issueNumber?: string;
  title: string;
  description: string;
  originalText?: string;
  normalizedText?: string;
  sector: string;
  domain?: string;
  district: string;
  block?: string;
  villageOrWard?: string;
  addressDescription?: string;
  latitude?: number | null;
  longitude?: number | null;
  priority: string;
  status: string;
  validationStatus?: string;
  assignedHEI?: string;
  createdAt?: string;
  citizenEmail?: string;
  citizenName?: string;
  citizenPhone?: string;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  pdfFileName?: string;
  pdfExtractedText?: string;
  attachmentCount?: number;
  attachments?: any[];
  validationReportJson?: any;
  modalityBreakdown?: any;
  generalizedConsensus?: any;
  recommendedHeisJson?: any;
  isDuplicate?: boolean;
  duplicateClusterId?: string;
  isAnonymous?: boolean;
}

interface IssueState {
  issues: GrassrootIssueRecord[];
  isLoading: boolean;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  setIssues: (issues: GrassrootIssueRecord[]) => void;
  addIssue: (issue: GrassrootIssueRecord) => void;
  updateIssue: (id: string, updates: Partial<GrassrootIssueRecord>) => void;
  removeIssue: (id: string) => void;
  fetchPaginatedIssues: (params?: any) => Promise<void>;
  approveIssueAllocation: (issueId: string, heiName: string, reason?: string) => Promise<boolean>;
  reassignIssueHEI: (issueId: string, newHeiName: string, justification?: string, token?: string) => Promise<boolean>;
  revokeIssueAllocation: (issueId: string, reason?: string, notes?: string, token?: string) => Promise<boolean>;
}

const INITIAL_ISSUES: GrassrootIssueRecord[] = [
  {
    id: "GRI-2026-881021",
    numericId: 1001,
    title: "Severe Groundwater Contamination and Fluoride Poisoning in Rural Handpumps",
    description: "Multiple village wards report brown fluoride sediment in tube-wells leading to widespread dental fluorosis and acute stomach ailments across 140+ families.",
    originalText: "Hamare gaon ke 4 chapakal me pila pani nikal raha hai, peene se pet kharab aur dant pile ho rahe hain.",
    sector: "WATER",
    domain: "Water Resources",
    district: "Bokaro",
    block: "Chas",
    villageOrWard: "Pindrajora",
    latitude: 23.6337,
    longitude: 86.1783,
    priority: "CRITICAL",
    status: "UNDER_REVIEW",
    validationStatus: "PASS",
    assignedHEI: "BIT Mesra - Dept of Water & Environment Engineering",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    citizenEmail: "manoj.mahto@jharkhand.in",
    citizenName: "Manoj Mahto",
    citizenPhone: "+91 94311 88201",
    attachmentCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "GRI-2026-881022",
    numericId: 1002,
    title: "Paddy Bacterial Blight Infestation Destroying Monsoon Harvest",
    description: "Rapidly spreading bacterial blight across 80 hectares of Swarna paddy fields causing premature leaf withering and 60% crop yield drop.",
    originalText: "Dhan khet me patta sukha rog fail gaya hai, 80 bigha khet barbad hone ki kagar par hai.",
    sector: "AGRICULTURE",
    domain: "Agriculture",
    district: "Ranchi",
    block: "Kanke",
    villageOrWard: "Sukhurhutu",
    latitude: 23.4358,
    longitude: 85.3211,
    priority: "HIGH",
    status: "ASSIGNED_HEI",
    validationStatus: "PASS",
    assignedHEI: "Birsa Agricultural University (BAU) - Plant Pathology Cell",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    citizenEmail: "suresh.kisan@jharkhand.in",
    citizenName: "Suresh Munda",
    citizenPhone: "+91 98351 12903",
    attachmentCount: 2,
    imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "GRI-2026-881023",
    numericId: 1003,
    title: "Unmonitored Industrial Kiln Particulate Emissions Impacting Primary School",
    description: "Illegal coal brick-kiln operating within 200 meters of Rajkiya Utkramit Madhya Vidyalaya causing chronic respiratory distress in 320 children.",
    sector: "ENVIRONMENT",
    domain: "Environment",
    district: "Dhanbad",
    block: "Govindpur",
    villageOrWard: "Barwadda",
    latitude: 23.8342,
    longitude: 86.4429,
    priority: "HIGH",
    status: "ASSIGNED_HEI",
    validationStatus: "PASS",
    assignedHEI: "IIT (ISM) Dhanbad - Clean Air R&D Cluster",
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    citizenEmail: "anita.devi@jharkhand.in",
    citizenName: "Anita Devi",
    citizenPhone: "+91 70041 55302",
    attachmentCount: 2
  }
];

export const useIssueStore = create<IssueState>()(
  persist(
    (set, get) => ({
      issues: INITIAL_ISSUES,
      isLoading: false,
      totalElements: INITIAL_ISSUES.length,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,

      setIssues: (issues) =>
        set({
          issues,
          totalElements: issues.length,
          totalPages: Math.max(1, Math.ceil(issues.length / (get().pageSize || 10))),
        }),

      addIssue: (newIssue) =>
        set((state) => {
          const updated = [newIssue, ...state.issues.filter((i) => i.id !== newIssue.id)];
          return {
            issues: updated,
            totalElements: updated.length,
            totalPages: Math.max(1, Math.ceil(updated.length / (state.pageSize || 10))),
          };
        }),

      updateIssue: (id, updates) =>
        set((state) => ({
          issues: state.issues.map((issue) =>
            issue.id === id ? { ...issue, ...updates } : issue
          ),
        })),

      removeIssue: (id) =>
        set((state) => {
          const updated = state.issues.filter((issue) => issue.id !== id);
          return {
            issues: updated,
            totalElements: updated.length,
            totalPages: Math.max(1, Math.ceil(updated.length / (state.pageSize || 10))),
          };
        }),

      fetchPaginatedIssues: async (params?: any) => {
        set({ isLoading: true });
        try {
          const apiBase =
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:8080/api";
          const query = new URLSearchParams();
          if (params?.district && params.district !== "All 24 Districts") {
            query.append("district", params.district);
          }
          if (params?.status) query.append("status", params.status);
          if (params?.sector && params.sector !== "ALL") query.append("sector", params.sector);
          if (params?.search) query.append("search", params.search);
          if (params?.page !== undefined) query.append("page", String(params.page));
          if (params?.size !== undefined) query.append("size", String(params.size));

          const res = await fetch(`${apiBase}/triage/issues?${query.toString()}`, {
            headers: params?.token ? { Authorization: `Bearer ${params.token}` } : {},
          });

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.content || data.issues || (Array.isArray(data) ? data : []);
            const content = rawContent.map((item: any) => {
              const ticketId = item.issueNumber || (typeof item.id === "string" ? item.id : `GRI-${item.id}`);
              const numId = typeof item.id === "number" ? item.id : (item.numericId || undefined);
              let resolvedImg = item.imageUrl;
              if (!resolvedImg && item.attachments && Array.isArray(item.attachments)) {
                const imgAtt = item.attachments.find((a: any) => a.fileType?.includes("image") || a.fileUrl?.match(/\.(jpeg|jpg|png|webp|gif)/i));
                if (imgAtt) resolvedImg = imgAtt.fileUrl;
              }
              return {
                ...item,
                id: ticketId,
                numericId: numId,
                issueNumber: ticketId,
                imageUrl: resolvedImg || item.imageUrl || null
              };
            });
            const total = data.totalElements ?? (content.length > 0 ? content.length : get().issues.length);
            const size = params?.size ?? get().pageSize ?? 10;
            const pages = data.totalPages ?? Math.max(1, Math.ceil(total / size));
            set({
              issues: content.length > 0 ? content : get().issues,
              totalElements: total,
              totalPages: pages,
              currentPage: params?.page ?? 0,
              pageSize: size,
              isLoading: false,
            });
            return;
          }
        } catch (e) {
          console.warn("fetchPaginatedIssues fallback to local store:", e);
        }

        const currentIssues = get().issues || [];
        const size = params?.size || get().pageSize || 10;
        set({
          totalElements: currentIssues.length,
          totalPages: Math.max(1, Math.ceil(currentIssues.length / size)),
          currentPage: params?.page ?? 0,
          pageSize: size,
          isLoading: false,
        });
      },

      approveIssueAllocation: async (issueId: string, heiName: string, reason?: string) => {
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId ? { ...i, status: "ASSIGNED_HEI", assignedHEI: heiName } : i
          ),
        }));
        return true;
      },

      reassignIssueHEI: async (issueId: string, newHeiName: string, justification?: string, token?: string) => {
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId ? { ...i, assignedHEI: newHeiName } : i
          ),
        }));
        return true;
      },

      revokeIssueAllocation: async (issueId: string, reason?: string, notes?: string, token?: string) => {
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId ? { ...i, status: "UNDER_REVIEW", assignedHEI: undefined } : i
          ),
        }));
        return true;
      },
    }),
    {
      name: "jharkhand-issues-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
