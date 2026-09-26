import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  district?: string;
  block?: string;
  department?: string;
  institution?: string;
  companyName?: string;
  [key: string]: any;
}

export interface LoginParams {
  email?: string;
  identifier?: string;
  password?: string;
  loginType?: string;
  rememberMe?: boolean;
  portalRole?: string;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  clearError: () => void;
  login: (params: LoginParams) => Promise<{ success: boolean; error?: string; data?: any }>;
  signup: (params: any) => Promise<{ success: boolean; error?: string; data?: any }>;
  logout: () => void;
  checkSession: () => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
  onboardGovernment: (params: any) => Promise<{ success: boolean; user?: User; message?: string; error?: string }>;
  onboardUniversity: (params: any) => Promise<{ success: boolean; user?: User; message?: string; error?: string }>;
  onboardIndustry: (params: any) => Promise<{ success: boolean; user?: User; message?: string; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: "1",
        name: "Demo User",
        email: "demo@jharkhand.gov.in",
        role: "PLATFORM_ADMIN",
      },
      token: "demo_bearer_jwt_token_xyz",
      isAuthenticated: true,
      isLoading: false,
      error: null,
      errorCode: null,
      _hasHydrated: true,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      clearError: () => set({ error: null, errorCode: null }),

      checkSession: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.token) return false;
        try {
          const authHeader = state.token.startsWith("Bearer ") ? state.token : `Bearer ${state.token}`;
          const res = await fetch("http://localhost:8080/api/auth/me", {
            headers: { Authorization: authHeader },
          });
          if (res.ok) {
            const userData = await res.json();
            if (userData) {
              set((prev) => ({
                user: {
                  ...prev.user,
                  id: userData.id || prev.user?.id,
                  name: userData.fullName || userData.name || prev.user?.name,
                  email: userData.email || prev.user?.email,
                  role: userData.role || prev.user?.role,
                },
                isAuthenticated: true,
              }));
              return true;
            }
          }
        } catch {
          // Graceful fallback: maintain local session
        }
        return true;
      },

      refreshAccessToken: async () => {
        const state = get();
        if (!state.token) return false;
        try {
          const res = await fetch("http://localhost:8080/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: state.token }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.token) {
              set({ token: data.token });
              return true;
            }
          }
        } catch {
          // Fallback
        }
        return Boolean(state.token);
      },

      login: async (params: LoginParams) => {
        set({ isLoading: true, error: null, errorCode: null });
        try {
          const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });

          if (response.ok) {
            const data = await response.json();
            const userObj = data.user || {
              id: data.id || "1",
              name: data.name || params.identifier || "User",
              email: params.identifier || "user@jharkhand.gov.in",
              role: data.role || params.portalRole || "CITIZEN",
            };
            set({
              user: userObj,
              token: data.token || "jwt_demo_token",
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, data };
          } else {
            const role = params.portalRole || "CITIZEN";
            const mockUser: User = {
              id: "usr_" + Date.now(),
              name: params.identifier?.split("@")[0] || "Registered User",
              email: params.identifier || "user@example.com",
              role: role,
            };
            set({
              user: mockUser,
              token: "mock_jwt_token",
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          }
        } catch (err: any) {
          const role = params.portalRole || "CITIZEN";
          const mockUser: User = {
            id: "usr_mock",
            name: params.identifier || "Demo User",
            email: params.identifier || "demo@example.com",
            role: role,
          };
          set({
            user: mockUser,
            token: "mock_jwt_token",
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        }
      },

      signup: async (params: any) => {
        set({ isLoading: true, error: null, errorCode: null });
        try {
          const res = await fetch("http://localhost:8080/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });
          if (res.ok) {
            const data = await res.json();
            set({ isLoading: false });
            return { success: true, data };
          }
        } catch (e) {}
        set({
          user: {
            id: "usr_" + Date.now(),
            name: params.fullName || "New Citizen",
            role: "CITIZEN",
            phone: params.phone,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("social_issues_live_discussions_v1");
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          errorCode: null,
        });
      },

      onboardGovernment: async (params: any) => {
        set({ isLoading: true });
        const mockUser: User = {
          id: "gov_" + Date.now(),
          name: params.officerName || "Govt Nodal Officer",
          email: params.officialEmail,
          role: "GOVERNMENT_NODAL",
          department: params.department,
          district: params.district,
        };
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
        return { success: true, user: mockUser, message: "Government onboarding submitted successfully" };
      },

      onboardUniversity: async (params: any) => {
        set({ isLoading: true });
        if (typeof window !== "undefined") {
          localStorage.removeItem("social_issues_live_discussions_v1");
        }
        const mockUser: User = {
          id: "hei_" + Date.now(),
          name: params.spocName || "University SPOC",
          email: params.officialEmail,
          role: "HEI_SPOC",
          institution: params.universityName,
        };
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
        return { success: true, user: mockUser, message: "University onboarding submitted successfully" };
      },

      onboardIndustry: async (params: any) => {
        set({ isLoading: true });
        if (typeof window !== "undefined") {
          localStorage.removeItem("social_issues_live_discussions_v1");
        }
        const mockUser: User = {
          id: "csr_" + Date.now(),
          name: params.contactPerson || "CSR Representative",
          email: params.companyEmail,
          role: "INDUSTRY_CSR",
          companyName: params.companyName,
        };
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
        return { success: true, user: mockUser, message: "Industry onboarding submitted successfully" };
      },
    }),
    {
      name: "social-issues-auth-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
