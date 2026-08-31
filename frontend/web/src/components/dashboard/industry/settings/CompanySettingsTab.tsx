"use client";

import React from "react";
import { useCompanySettings } from "@/modules/industry/hooks/useCompanySettings";
import { CompanyProfileSection } from "./CompanyProfileSection";
import { CorporateTeamSection } from "./CorporateTeamSection";
import { InviteTeamMemberModal } from "./InviteTeamMemberModal";
import { EditTeamMemberRoleModal } from "./EditTeamMemberRoleModal";
import { NotificationPreferencesSection } from "./NotificationPreferencesSection";

interface CompanySettingsTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export function CompanySettingsTab({ onNavigateTab }: CompanySettingsTabProps) {
  const {
    activeSubTab,
    setActiveSubTab,

    profile,
    isLoadingProfile,
    handleUpdateProfile,

    teamMembers,
    allTeamMembersCount,
    isLoadingTeam,
    teamSearchQuery,
    setTeamSearchQuery,
    teamRoleFilter,
    setTeamRoleFilter,
    handleInviteMember,
    handleUpdateMemberRole,
    handleToggleMemberStatus,
    handleDeleteMember,
    handleResendInvite,

    isInviteModalOpen,
    setIsInviteModalOpen,
    isEditRoleModalOpen,
    setIsEditRoleModalOpen,
    selectedMemberForEdit,
    setSelectedMemberForEdit,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    memberToDelete,
    setMemberToDelete,

    preferences,
    isLoadingPreferences,
    handleUpdatePreferences,

    isSaving,
  } = useCompanySettings();

  const handleOpenEditRole = (member: any) => {
    setSelectedMemberForEdit(member);
    setIsEditRoleModalOpen(true);
  };

  const handleConfirmDelete = (member: any) => {
    setMemberToDelete(member);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top 4 Quick Status Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Statutory Registry Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">MCA Verification</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-base font-black text-slate-900 block">
              {profile?.verificationStatus === "APPROVED" ? "Nodal Approved" : "Under Review"}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              CSR-1: {profile?.csrNumber || "CSR00018942"}
            </span>
          </div>
        </div>

        {/* Card 2: Corporate Team Seats */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Corporate Seats</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-base font-black text-slate-900 block">
              {allTeamMembersCount} Active Members
            </span>
            <span className="text-[11px] text-slate-500">
              Multi-user RBAC active
            </span>
          </div>
        </div>

        {/* Card 3: Subscribed Domains */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Domain Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-base font-black text-slate-900 block">
              {preferences?.preferredSectors?.length || 4} Priority Sectors
            </span>
            <span className="text-[11px] text-slate-500">
              Cadence: {preferences?.emailDigestFrequency === "INSTANT" ? "Instant" : "Daily Digest"}
            </span>
          </div>
        </div>

        {/* Card 4: Annual CSR Budget Capacity */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Annual CSR Budget</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-base font-black text-slate-900 block">
              {profile?.annualCsrBudgetFormatted || "₹2.50 Cr"}
            </span>
            <span className="text-[11px] text-slate-500">
              Schedule VII statutory capacity
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveSubTab("profile")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "profile"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Statutory Company Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("team")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "team"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Corporate Team &amp; RBAC ({allTeamMembersCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("preferences")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "preferences"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Domain Alerts &amp; Notification Rules
        </button>
      </div>

      {/* Sub-Tab Content Rendering */}
      {activeSubTab === "profile" && (
        <CompanyProfileSection
          profile={profile}
          isLoading={isLoadingProfile}
          isSaving={isSaving}
          onSave={handleUpdateProfile}
        />
      )}

      {activeSubTab === "team" && (
        <CorporateTeamSection
          teamMembers={teamMembers}
          isLoading={isLoadingTeam}
          searchQuery={teamSearchQuery}
          onSearchChange={setTeamSearchQuery}
          roleFilter={teamRoleFilter}
          onRoleFilterChange={setTeamRoleFilter}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onEditMember={handleOpenEditRole}
          onToggleStatus={handleToggleMemberStatus}
          onDeleteMember={handleConfirmDelete}
          onResendInvite={handleResendInvite}
        />
      )}

      {activeSubTab === "preferences" && (
        <NotificationPreferencesSection
          preferences={preferences}
          isLoading={isLoadingPreferences}
          isSaving={isSaving}
          onSave={handleUpdatePreferences}
        />
      )}

      {/* Modal 1: Invite Team Member */}
      <InviteTeamMemberModal
        isOpen={isInviteModalOpen}
        isSaving={isSaving}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />

      {/* Modal 2: Edit Team Member Role */}
      <EditTeamMemberRoleModal
        isOpen={isEditRoleModalOpen}
        member={selectedMemberForEdit}
        isSaving={isSaving}
        onClose={() => {
          setIsEditRoleModalOpen(false);
          setSelectedMemberForEdit(null);
        }}
        onUpdateRole={handleUpdateMemberRole}
      />

      {/* Modal 3: Confirm Delete Member Dialog */}
      {isDeleteConfirmOpen && memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Remove Corporate Member</h3>
                <p className="text-xs text-slate-500">Confirm revocation of corporate access</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{memberToDelete.fullName}</strong> ({memberToDelete.email}) from this corporate account? They will lose access to CSR funding approvals and co-funded pilot records immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setMemberToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleDeleteMember(memberToDelete.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
