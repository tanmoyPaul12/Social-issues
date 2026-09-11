"use client";

import React, { useState } from "react";
import {
  CreateTestbedPayload,
  DeploymentStatus,
  JHARKHAND_DISTRICTS,
} from "@/modules/industry/types/testbeds";

interface CreateTestbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTestbedPayload) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function CreateTestbedModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateTestbedModalProps) {
  const [formData, setFormData] = useState<CreateTestbedPayload>({
    testbedName: "",
    district: "Ranchi",
    block: "",
    villageOrLocation: "",
    projectName: "",
    pilotPhase: "Phase 1 - Field Validation",
    beneficiaryCount: 500,
    deploymentStatus: "PLANNED",
    liveDataFeedUrl: "",
    startedAt: new Date().toISOString().split("T")[0],
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testbedName.trim() || !formData.district.trim()) return;

    const success = await onSubmit({
      ...formData,
      testbedName: formData.testbedName.trim(),
      district: formData.district.trim(),
      block: formData.block?.trim() || undefined,
      villageOrLocation: formData.villageOrLocation?.trim() || undefined,
      projectName: formData.projectName?.trim() || undefined,
      pilotPhase: formData.pilotPhase?.trim() || undefined,
      liveDataFeedUrl: formData.liveDataFeedUrl?.trim() || undefined,
      beneficiariesImpacted: formData.beneficiaryCount,
    });

    if (success) {
      setFormData({
        testbedName: "",
        district: "Ranchi",
        block: "",
        villageOrLocation: "",
        projectName: "",
        pilotPhase: "Phase 1 - Field Validation",
        beneficiaryCount: 500,
        deploymentStatus: "PLANNED",
        liveDataFeedUrl: "",
        startedAt: new Date().toISOString().split("T")[0],
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Commission New Field Testbed
            </h3>
            <p className="text-xs text-slate-500">
              Register a dedicated validation site and IoT/telemetry endpoint in Jharkhand
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Testbed Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Testbed Site Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ranchi Rural Solar Microgrid & IoT Lab"
              value={formData.testbedName}
              onChange={(e) => setFormData({ ...formData, testbedName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* District & Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                {JHARKHAND_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Block (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Kanke / Jharia / Ghatshila"
                value={formData.block || ""}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Village / Specific Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Village / Facility Location
            </label>
            <input
              type="text"
              placeholder="e.g. Sukhurhutu Community Center Ground, Cluster #4"
              value={formData.villageOrLocation || ""}
              onChange={(e) => setFormData({ ...formData, villageOrLocation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Associated Project Name & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Associated Project / Solution
              </label>
              <input
                type="text"
                placeholder="e.g. Off-Grid Solar Micro-Grid"
                value={formData.projectName || ""}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilot Phase
              </label>
              <select
                value={formData.pilotPhase}
                onChange={(e) => setFormData({ ...formData, pilotPhase: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="Phase 1 - Field Validation">Phase 1 - Field Validation</option>
                <option value="Phase 2 - Live Telemetry & Testing">Phase 2 - Live Telemetry & Testing</option>
                <option value="Phase 3 - Validation & Certification">Phase 3 - Validation & Certification</option>
                <option value="Scale-Up Deployment">Scale-Up Deployment</option>
              </select>
            </div>
          </div>

          {/* Beneficiary Count & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Beneficiary Reach
              </label>
              <input
                type="number"
                min="0"
                value={formData.beneficiaryCount || 0}
                onChange={(e) => setFormData({ ...formData, beneficiaryCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Deployment Status
              </label>
              <select
                value={formData.deploymentStatus}
                onChange={(e) => setFormData({ ...formData, deploymentStatus: e.target.value as DeploymentStatus })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="PLANNED">Planned Deployment</option>
                <option value="LIVE">Live Field Trial</option>
                <option value="COMPLETED">Completed</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Telemetry URL & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Commissioning Date
              </label>
              <input
                type="date"
                value={formData.startedAt || ""}
                onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Live Telemetry URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://telemetry.jharkhand.gov.in/..."
                value={formData.liveDataFeedUrl || ""}
                onChange={(e) => setFormData({ ...formData, liveDataFeedUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? "Commissioning..." : "Commission Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
