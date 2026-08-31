"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import {
  CompanyProfile,
  UpdateCompanyProfilePayload,
  IndustryTeamMember,
  InviteTeamMemberPayload,
  UpdateTeamMemberRolePayload,
  CorporateNotificationPreferences,
  UpdateNotificationPreferencesPayload,
  TeamMemberStatus,
} from "../types/companySettings";
import {
  fetchCompanyProfile,
  updateCompanyProfile,
  fetchCompanyTeamMembers,
  inviteCompanyTeamMember,
  updateCompanyTeamMemberRole,
  updateCompanyTeamMemberStatus,
  deleteCompanyTeamMember,
  resendCompanyInvitation,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "../services/companySettingsApi";

export type SettingsSubTab = "profile" | "team" | "preferences";

export function useCompanySettings() {
  const { token } = useAuthStore();
  const isMountedRef = useRef<boolean>(true);

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("profile");

  // Profile State
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // Team State
  const [teamMembers, setTeamMembers] = useState<IndustryTeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState<boolean>(true);
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");
  const [teamRoleFilter, setTeamRoleFilter] = useState<string>("ALL");

  // Preferences State
  const [preferences, setPreferences] = useState<CorporateNotificationPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(true);

  // Modals & Mutation States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState<boolean>(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<IndustryTeamMember | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<IndustryTeamMember | null>(null);

  // 1. Load Profile
  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const data = await fetchCompanyProfile(token);
      if (isMountedRef.current) {
        setProfile(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("Company profile load note:", err?.message || err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingProfile(false);
      }
    }
  }, [token]);

  // 2. Load Team Members
  const loadTeam = useCallback(async () => {
    setIsLoadingTeam(true);
    try {
      const data = await fetchCompanyTeamMembers(token);
      if (isMountedRef.current) {
        setTeamMembers(data || []);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("Company team load note:", err?.message || err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingTeam(false);
      }
    }
  }, [token]);

  // 3. Load Preferences
  const loadPreferences = useCallback(async () => {
    setIsLoadingPreferences(true);
    try {
      const data = await fetchNotificationPreferences(token);
      if (isMountedRef.current) {
        setPreferences(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("Company alert preferences load note:", err?.message || err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingPreferences(false);
      }
    }
  }, [token]);

  // Trigger loads on mount / sub-tab switch
  useEffect(() => {
    isMountedRef.current = true;
    loadProfile();
    loadTeam();
    loadPreferences();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadProfile, loadTeam, loadPreferences]);

  // 4. Update Profile Action
  const handleUpdateProfile = async (payload: UpdateCompanyProfilePayload): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await updateCompanyProfile(token, payload);
      if (isMountedRef.current) {
        setProfile(updated);
      }
      toast.success("Corporate profile & statutory particulars updated successfully.");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to update corporate profile.");
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  // 5. Invite Team Member Action
  const handleInviteMember = async (payload: InviteTeamMemberPayload): Promise<boolean> => {
    setIsSaving(true);
    try {
      const newMember = await inviteCompanyTeamMember(token, payload);
      if (isMountedRef.current) {
        setTeamMembers((prev) => [...prev, newMember]);
        setIsInviteModalOpen(false);
      }
      toast.success(`Invitation sent to ${payload.fullName} (${payload.email}).`);
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to send invitation.");
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  // 6. Update Team Member Role Action
  const handleUpdateMemberRole = async (
    memberId: number,
    payload: UpdateTeamMemberRolePayload
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await updateCompanyTeamMemberRole(token, memberId, payload);
      if (isMountedRef.current) {
        setTeamMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        setIsEditRoleModalOpen(false);
        setSelectedMemberForEdit(null);
      }
      toast.success(`Role & permissions updated for ${updated.fullName}.`);
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role.");
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  // 7. Toggle Member Status (Active / Suspended)
  const handleToggleMemberStatus = async (memberId: number, currentStatus: TeamMemberStatus) => {
    const nextStatus: TeamMemberStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const updated = await updateCompanyTeamMemberStatus(token, memberId, nextStatus);
      if (isMountedRef.current) {
        setTeamMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      }
      toast.success(`Account status changed to ${nextStatus}.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status.");
    }
  };

  // 8. Delete Member Action
  const handleDeleteMember = async (memberId: number): Promise<boolean> => {
    setIsSaving(true);
    try {
      await deleteCompanyTeamMember(token, memberId);
      if (isMountedRef.current) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
        setIsDeleteConfirmOpen(false);
        setMemberToDelete(null);
      }
      toast.success("Team member removed from corporate workspace.");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove member.");
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  // 9. Resend Invite Action
  const handleResendInvite = async (memberId: number) => {
    try {
      const updated = await resendCompanyInvitation(token, memberId);
      if (isMountedRef.current) {
        setTeamMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      }
      toast.success(`Invitation resent to ${updated.email}.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend invite.");
    }
  };

  // 10. Update Preferences Action
  const handleUpdatePreferences = async (
    payload: UpdateNotificationPreferencesPayload
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await updateNotificationPreferences(token, payload);
      if (isMountedRef.current) {
        setPreferences(updated);
      }
      toast.success("Research domain subscriptions & alert rules saved.");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to save notification preferences.");
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  // Filtered Team Members
  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesRole = teamRoleFilter === "ALL" || member.corporateRole === teamRoleFilter;
    const query = teamSearchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      member.fullName.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      (member.designation && member.designation.toLowerCase().includes(query));

    return matchesRole && matchesQuery;
  });

  return {
    activeSubTab,
    setActiveSubTab,

    // Profile
    profile,
    isLoadingProfile,
    handleUpdateProfile,

    // Team
    teamMembers: filteredTeamMembers,
    allTeamMembersCount: teamMembers.length,
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

    // Modals
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

    // Preferences
    preferences,
    isLoadingPreferences,
    handleUpdatePreferences,

    isSaving,
    refreshAll: () => {
      loadProfile();
      loadTeam();
      loadPreferences();
    },
  };
}
