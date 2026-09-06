"use client";

import React, { useState } from "react";
import { CorporateRole, IndustryTeamMember, TeamMemberStatus } from "@/modules/industry/types/companySettings";

interface CorporateTeamSectionProps {
  teamMembers: IndustryTeamMember[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  roleFilter: string;
  onRoleFilterChange: (r: string) => void;
  onOpenInviteModal: () => void;
  onEditMember: (member: IndustryTeamMember) => void;
  onToggleStatus: (memberId: number, currentStatus: TeamMemberStatus) => void;
  onDeleteMember: (member: IndustryTeamMember) => void;
  onResendInvite: (memberId: number) => void;
}

export function CorporateTeamSection({
  teamMembers,
  isLoading,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onOpenInviteModal,
  onEditMember,
  onToggleStatus,
  onDeleteMember,
  onResendInvite,
}: CorporateTeamSectionProps) {
  const [activeActionDropdown, setActiveActionDropdown] = useState<number | null>(null);

  const getRoleBadge = (role: CorporateRole) => {
    switch (role) {
      case "CSR_ADMIN":
        return {
          label: "CSR Administrator",
          bg: "bg-purple-50 text-purple-700 border-purple-200/80",
          icon: (
            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
        };
      case "FINANCE_APPROVER":
        return {
          label: "Finance Controller",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: (
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
        };
      case "PROJECT_MANAGER":
        return {
          label: "R&D Pilot Manager",
          bg: "bg-blue-50 text-blue-700 border-blue-200/80",
          icon: (
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
        };
      case "CSR_VIEWER":
      default:
        return {
          label: "Compliance Auditor",
          bg: "bg-slate-100 text-slate-700 border-slate-200/80",
          icon: (
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
        };
    }
  };

  const getStatusBadge = (status: TeamMemberStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "INVITED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Invited
          </span>
        );
      case "SUSPENDED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Suspended
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Corporate Team &amp; Segregation of Duties
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage corporate colleagues with distinct approval, finance, and auditing permissions
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenInviteModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Invite Team Member
          </button>
        </div>

        {/* Search and Role Filter Chips */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search member by name, email, or role..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "All Roles" },
              { id: "CSR_ADMIN", label: "Administrators" },
              { id: "FINANCE_APPROVER", label: "Finance Approvers" },
              { id: "PROJECT_MANAGER", label: "Pilot Managers" },
              { id: "CSR_VIEWER", label: "Auditors" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onRoleFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  roleFilter === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {isLoading && teamMembers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600">Loading corporate team accounts...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-700">No corporate team members match the search filters.</p>
            <button
              type="button"
              onClick={onOpenInviteModal}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              + Invite a new colleague to this company account
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 sm:px-6">Team Member</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Privilege Matrix</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {teamMembers.map((member) => {
                  const roleBadge = getRoleBadge(member.corporateRole);
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {member.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block leading-tight">
                              {member.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                              {member.email}
                            </span>
                            {member.designation && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {member.designation}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadge.bg}`}>
                          {roleBadge.icon}
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.canCommitGrants && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              Sign Grants
                            </span>
                          )}
                          {member.canApproveDisbursements && (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold">
                              Approve Tranches
                            </span>
                          )}
                          {member.canManageTeam && (
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-semibold">
                              Manage Team
                            </span>
                          )}
                          {member.canVerifyUcs && (
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-semibold">
                              Verify UCs
                            </span>
                          )}
                          {!member.canCommitGrants &&
                            !member.canApproveDisbursements &&
                            !member.canManageTeam &&
                            !member.canVerifyUcs && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px] font-semibold">
                                Read Only
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(member.status)}
                      </td>

                      <td className="py-4 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditMember(member)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                            title="Edit Role & Permissions"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {member.status === "INVITED" && (
                            <button
                              type="button"
                              onClick={() => onResendInvite(member.id)}
                              className="p-1.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all cursor-pointer"
                              title="Resend Invitation Token"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onToggleStatus(member.id, member.status)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              member.status === "ACTIVE"
                                ? "border-slate-200 text-slate-500 hover:bg-slate-100"
                                : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            }`}
                            title={member.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {member.status === "ACTIVE" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              )}
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteMember(member)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove Member from Company"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
