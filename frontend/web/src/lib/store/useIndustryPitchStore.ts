import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CsrPitchItem {
  id: string;
  threadId: number;
  projectCode: string;
  projectTitle: string;
  universityName: string;
  targetCompany: string;
  requestedAmount: number;
  category: string;
  description: string;
  mentorNeeds?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  submittedAt: string;
}

export interface CoFundedProjectItem {
  id: string;
  projectId: number | string;
  title: string;
  university: string;
  leadInvestigator: string;
  grantCommitted: string;
  disbursedAmount: string;
  domain: string;
  district: string;
  stage: "Prototyping" | "Field Pilot" | "Scaling" | "Team Formation";
  progress: number;
  csrScheduleVII: string;
  createdAt: string;
}

export type IndustryPitch = CsrPitchItem;

interface IndustryPitchState {
  pitches: CsrPitchItem[];
  coFundedProjects: CoFundedProjectItem[];
  fetchPitches: (token?: string) => Promise<void> | void;
  addPitch: (pitch: Omit<CsrPitchItem, "status"> & { status?: "PENDING" | "ACCEPTED" | "REJECTED" }) => void;
  acceptPitch: (id: string) => CsrPitchItem | undefined;
  rejectPitch: (id: string) => void;
  addCoFundedProject: (project: Omit<CoFundedProjectItem, "id" | "createdAt">) => void;
}

function getStoredPitches(): CsrPitchItem[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("social_issues_csr_pitches_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
  }
  return [];
}

function saveStoredPitches(pitches: CsrPitchItem[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("social_issues_csr_pitches_v1", JSON.stringify(pitches));
    } catch (e) {}
  }
}

export const useIndustryPitchStore = create<IndustryPitchState>()(
  persist(
    (set, get) => ({
      pitches: getStoredPitches(),
      coFundedProjects: [],

      fetchPitches: async (token?: string) => {
        const stored = getStoredPitches();
        if (stored.length > 0) {
          set({ pitches: stored });
        }
      },

      addPitch: (pitch) => {
        const currentPitches = getStoredPitches();
        const newItem: CsrPitchItem = {
          ...pitch,
          status: pitch.status || "PENDING",
        };
        const exists = currentPitches.some((p) => p.id === newItem.id);
        const updated = exists ? currentPitches : [newItem, ...currentPitches];
        saveStoredPitches(updated);

        set((state) => ({
          pitches: updated,
        }));
      },

      acceptPitch: (id) => {
        const currentPitches = getStoredPitches();
        const target = currentPitches.find((p) => p.id === id) || get().pitches.find((p) => p.id === id);
        if (!target) return undefined;

        const updatedPitches = (get().pitches.length > 0 ? get().pitches : currentPitches).map((p) =>
          p.id === id ? { ...p, status: "ACCEPTED" as const } : p
        );
        saveStoredPitches(updatedPitches);

        const newCoFundedProject: CoFundedProjectItem = {
          id: `COFUND-${Date.now()}`,
          projectId: target.threadId,
          title: target.projectTitle,
          university: target.universityName,
          leadInvestigator: "Faculty Lead PI",
          grantCommitted: `₹${target.requestedAmount.toLocaleString()}`,
          disbursedAmount: `₹${Math.round(target.requestedAmount * 0.33).toLocaleString()} (Tranche 1)`,
          domain: target.category || "Societal Innovation",
          district: "Jharkhand Regional R&D",
          stage: "Prototyping",
          progress: 35,
          csrScheduleVII: "Item (ix) - R&D Grant to Public Funded Universities",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          pitches: updatedPitches,
          coFundedProjects: [newCoFundedProject, ...state.coFundedProjects.filter((c) => c.title !== target.projectTitle)],
        }));

        return target;
      },

      rejectPitch: (id) => {
        const currentPitches = getStoredPitches();
        const updatedPitches = (get().pitches.length > 0 ? get().pitches : currentPitches).map((p) =>
          p.id === id ? { ...p, status: "REJECTED" as const } : p
        );
        saveStoredPitches(updatedPitches);

        set((state) => ({
          pitches: updatedPitches,
        }));
      },

      addCoFundedProject: (project) => {
        set((state) => ({
          coFundedProjects: [
            {
              ...project,
              id: `COFUND-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.coFundedProjects,
          ],
        }));
      },
    }),
    {
      name: "social_issues_industry_pitch_store_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
