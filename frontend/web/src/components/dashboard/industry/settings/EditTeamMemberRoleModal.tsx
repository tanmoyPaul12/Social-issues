"use client";

import React, { useState, useEffect } from "react";
import { CorporateRole, IndustryTeamMember, UpdateTeamMemberRolePayload } from "@/modules/industry/types/companySettings";

interface EditTeamMemberRoleModalProps {
  isOpen: boolean;
  member: IndustryTeamMember | null;
  isSaving: boolean;
  onClose: () => void;
  onUpdateRole: (memberId: number, payload: UpdateTeamMemberRolePayload) => Promise<boolean>;
}

export function EditTeamMemberRoleModal({
  isOpen,
  member,
  isSaving,
  onClose,
  onUpdateRole,
}: EditTeamMemberRoleModalProps) {
  const [formData, setFormData] = useState<UpdateTeamMemberRolePayload>({
    corporateRole: "PROJECT_MANAGER",
    designation: "",
    canCommitGrants: false,
    canApproveDisbursements: false,
    canManageTeam: false,
    canEditProfile: false,
    canVerifyUcs: false,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        corporateRole: member.corporateRole,
        designation: member.designation || "",
        canCommitGrants: member.canCommitGrants,
        canApproveDisbursements: member.canApproveDisbursements,
        canManageTeam: member.canManageTeam,
        canEditProfile: member.canEditProfile,
        canVerifyUcs: member.canVerifyUcs,
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleRoleChange = (role: CorporateRole) => {
    let defaults = {
      canCommitGrants: false,
      canApproveDisbursements: false,
      canManageTeam: false,
      canEditProfile: false,
      canVerifyUcs: false,
    };

    if (role === "CSR_ADMIN") {
      defaults = {
        canCommitGrants: true,
        canApproveDisbursements: true,
        canManageTeam: true,
        canEditProfile: true,
        canVerifyUcs: true,
      };
    } else if (role === "FINANCE_APPROVER") {
      defaults = {
        canCommitGrants: true,
        canApproveDisbursements: true,
        canManageTeam: false,
        canEditProfile: false,
        canVerifyUcs: true,
      };
    }

    setFormData({
      ...formData,
      corporateRole: role,
      ...defaults,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateRole(member.id, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto text-xs">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Edit Corporate Role &amp; Access</h3>
            <p className="text-xs text-slate-500">Modify permissions for {member.fullName} ({member.email})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Corporate Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Assigned Corporate Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: "CSR_ADMIN",
                  title: "CSR Administrator",
                  desc: "Full administrative & team management control",
                  icon: (
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  id: "FINANCE_APPROVER",
                  title: "Finance Approver",
                  desc: "Authorizes disbursements & verifies UCs",
                  icon: (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ),
                },
                {
                  id: "PROJECT_MANAGER",
                  title: "Pilot Project Manager",
                  desc: "Reviews milestones & coordinates trials",
                  icon: (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ),
                },
                {
                  id: "CSR_VIEWER",
                  title: "Auditor / Viewer",
                  desc: "Read-only access to ledger & audit trail",
                  icon: (
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ),
                },
              ].map((role) => {
                const isSelected = formData.corporateRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id as CorporateRole)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-slate-100"}`}>
                        {role.icon}
                      </div>
                      <span className="font-bold text-xs">{role.title}</span>
                    </div>
                    <p className={`text-[11px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {role.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs">Custom Privilege Overrides</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canCommitGrants}
                  onChange={(e) => setFormData({ ...formData, canCommitGrants: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Sign Grant Commitments</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canApproveDisbursements}
                  onChange={(e) => setFormData({ ...formData, canApproveDisbursements: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Approve Fund Tranches</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canManageTeam}
                  onChange={(e) => setFormData({ ...formData, canManageTeam: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Manage Team Members</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canVerifyUcs}
                  onChange={(e) => setFormData({ ...formData, canVerifyUcs: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Verify Form GFR 12-A UCs</span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Updates...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Role Permissions
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
