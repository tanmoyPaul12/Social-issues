"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardRole } from "@/components/dashboard/DashboardNavbar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ToastStack } from "@/components/dashboard/ToastStack";
import { CitizenDashboardView } from "@/components/dashboard/CitizenDashboardView";
import { UniversityDashboardView } from "@/components/dashboard/UniversityDashboardView";
import { IndustryDashboardView } from "@/components/dashboard/IndustryDashboardView";
import { GovernmentDashboardView } from "@/components/dashboard/GovernmentDashboardView";
import { StateSuperadminDashboardView } from "@/components/dashboard/StateSuperadminDashboardView";
import { PlatformAdminDashboardView } from "@/components/dashboard/PlatformAdminDashboardView";
import { useAuthStore } from "@/lib/store/useAuthStore";

function getRoleFromUser(userRole?: string, isStateSuperAdmin?: boolean, userObj?: any): DashboardRole {
  if (isStateSuperAdmin) return "superadmin";
  if (userObj?.district?.toLowerCase() === "statewide" || userObj?.designation?.toLowerCase().includes("superadmin")) return "superadmin";
  if (!userRole) return "citizen";
  const r = userRole.toUpperCase();
  if (r.includes("STATE_SUPERADMIN") || r.includes("STATE_ADMIN") || r.includes("GOVERNMENT_SUPERADMIN") || r.includes("SUPERADMIN")) return "superadmin";
  if (r.includes("UNIVERSITY") || r.includes("HEI") || r.includes("FACULTY") || r.includes("STUDENT")) return "university";
  if (r.includes("INDUSTRY") || r.includes("CSR")) return "industry";
  if (r.includes("GOVERNMENT") || r.includes("NODAL")) return "government";
  if (r.includes("ADMIN")) return "admin";
  return "citizen";
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, _hasHydrated, checkSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (_hasHydrated && isAuthenticated) {
      checkSession();
    }
  }, [_hasHydrated, isAuthenticated, checkSession]);

  const [activeSidebarItem, setActiveSidebarItem] = useState("overview");

  // Determine authorized role based on database auth session
  const authorizedRole: DashboardRole = getRoleFromUser(user?.role, (user as any)?.isStateSuperAdmin, user);

  // If user is a platform admin, they are allowed to inspect specific roles via ?role=
  const queryRole = searchParams.get("role") as DashboardRole | null;
  const isSuperAdmin = user?.role?.toUpperCase().includes("ADMIN") || (user as any)?.isStateSuperAdmin;
  
  const activeRole: DashboardRole = isSuperAdmin && queryRole && ["citizen", "university", "industry", "government", "superadmin", "admin"].includes(queryRole)
    ? queryRole
    : authorizedRole;

  // Protect route if unauthenticated only after store has hydrated
  useEffect(() => {
    if (mounted && _hasHydrated && !isLoading && !isAuthenticated && !user) {
      router.replace("/auth/login");
    }
  }, [mounted, _hasHydrated, isLoading, isAuthenticated, user, router]);

  // While restoring session from localStorage, render clean restoration state
  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
          <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span>Restoring Command Center Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root h-screen bg-[#f1f5f9] text-[#090e1a] flex flex-col font-figtree selection:bg-slate-200 selection:text-slate-900 overflow-hidden">
      {/* Top Command Center Header */}
      <DashboardHeader activeRole={activeRole} />

      {/* Floating Action-based Toast Notifications */}
      <ToastStack />

      {/* Main Workspace Layout: Left Sidebar + Right Content Area */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-61px)]">
        {/* Left Vertical Sidebar */}
        <DashboardSidebar
          activeRole={activeRole}
          activeItem={activeSidebarItem}
          onSelectItem={(id) => setActiveSidebarItem(id)}
        />

        {/* Right Main Content Panel with eye-friendly soft grayish canvas */}
        <main className="flex-1 bg-[#f1f5f9] h-full overflow-y-auto">
          {activeRole === "citizen" && (
            <CitizenDashboardView
              activeTab={activeSidebarItem}
              onNavigateTab={setActiveSidebarItem}
            />
          )}
          {activeRole === "university" && (
            <UniversityDashboardView
              activeTab={activeSidebarItem}
              onNavigateTab={setActiveSidebarItem}
            />
          )}
          {activeRole === "industry" && (
            <IndustryDashboardView
              activeTab={activeSidebarItem}
              onNavigateTab={setActiveSidebarItem}
            />
          )}
          {activeRole === "government" && (
            <GovernmentDashboardView
              activeTab={activeSidebarItem}
              onNavigateTab={setActiveSidebarItem}
            />
          )}
          {activeRole === "superadmin" && (
            <StateSuperadminDashboardView
              activeTab={activeSidebarItem}
              onNavigateTab={setActiveSidebarItem}
            />
          )}
          {activeRole === "admin" && (
            <PlatformAdminDashboardView
              activeTab={activeSidebarItem}
              onNavigateTab={setActiveSidebarItem}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
            <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <span>Loading Command Center Portal...</span>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
