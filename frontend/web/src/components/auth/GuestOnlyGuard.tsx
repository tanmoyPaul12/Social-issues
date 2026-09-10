"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface GuestOnlyGuardProps {
  children: React.ReactNode;
}

export function GuestOnlyGuard({ children }: GuestOnlyGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && _hasHydrated && isAuthenticated && user) {
      const role = (user.role || "").toUpperCase();
      if (role.includes("UNIVERSITY") || role.includes("HEI") || role.includes("FACULTY") || role.includes("STUDENT")) {
        router.replace("/dashboard?role=university");
      } else if (role.includes("INDUSTRY") || role.includes("CSR")) {
        router.replace("/dashboard?role=industry");
      } else if (role.includes("GOVERNMENT") || role.includes("NODAL")) {
        router.replace("/dashboard?role=government");
      } else if (role.includes("ADMIN")) {
        router.replace("/dashboard?role=admin");
      } else {
        router.replace("/dashboard?role=citizen");
      }
    }
  }, [mounted, _hasHydrated, isAuthenticated, user, router]);

  // While mounting or hydrating, or if authenticated, do NOT render login/signup page
  if (!mounted || !_hasHydrated || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <svg className="animate-spin h-5 w-5 text-[#0077b6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Redirecting to your portal dashboard...</span>
        </div>
      </div>
    );
  }

  // Only render the auth page if user is NOT logged in
  return <>{children}</>;
}
