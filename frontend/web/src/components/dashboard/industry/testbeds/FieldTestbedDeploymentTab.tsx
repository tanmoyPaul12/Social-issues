"use client";

import React, { useState } from "react";
import { useFieldTestbeds } from "@/modules/industry/hooks/useFieldTestbeds";
import {
  TestbedSponsorship,
  DeploymentStatus,
  DEPLOYMENT_STATUS_CONFIG,
  JHARKHAND_DISTRICTS,
  CreateTestbedPayload,
  UpdateTestbedStatusPayload,
} from "@/modules/industry/types/testbeds";
import { CreateTestbedModal } from "./CreateTestbedModal";

interface FieldTestbedDeploymentTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export function FieldTestbedDeploymentTab({ onNavigateTab }: FieldTestbedDeploymentTabProps) {
  const {
    testbeds,
    districtSummary,
    totalElements,
    isLoading,
    isSaving,
    error,
    filters,
    totalBeneficiariesAll,
    liveCountAll,
    completedCountAll,
    setFilterValue,
    resetFilters,
    handleCreateTestbed,
    handleUpdateStatus,
    handleUploadEvidence,
    handleDeleteTestbed,
    refresh,
  } = useFieldTestbeds();

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedForStatus, setSelectedForStatus] = useState<TestbedSponsorship | null>(null);
  const [selectedForUpload, setSelectedForUpload] = useState<TestbedSponsorship | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Form states for Create Modal
  const [newTestbed, setNewTestbed] = useState<CreateTestbedPayload>({
    testbedName: "",
    district: "Ranchi",
    block: "",
    villageOrLocation: "",
    projectName: "",
    pilotPhase: "Phase 1 - Field Validation",
    beneficiaryCount: 500,
    deploymentStatus: "PLANNED",
    liveDataFeedUrl: "",
  });

  // Form states for Update Status Modal
  const [statusUpdate, setStatusUpdate] = useState<UpdateTestbedStatusPayload>({
    status: "LIVE",
    beneficiaryCount: 0,
    liveDataFeedUrl: "",
  });

  // Upload files state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const handleOpenStatusModal = (testbed: TestbedSponsorship) => {
    setSelectedForStatus(testbed);
    setStatusUpdate({
      status: testbed.deploymentStatus,
      beneficiaryCount: testbed.beneficiaryCount || Number(testbed.beneficiariesImpacted) || 0,
      liveDataFeedUrl: testbed.liveDataFeedUrl || "",
    });
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestbed.testbedName.trim() || !newTestbed.district.trim()) return;
    const ok = await handleCreateTestbed(newTestbed);
    if (ok) {
      setShowCreateModal(false);
      setNewTestbed({
        testbedName: "",
        district: "Ranchi",
        block: "",
        villageOrLocation: "",
        projectName: "",
        pilotPhase: "Phase 1 - Field Validation",
        beneficiaryCount: 500,
        deploymentStatus: "PLANNED",
        liveDataFeedUrl: "",
      });
    }
  };

  const submitStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForStatus) return;
    const ok = await handleUpdateStatus(selectedForStatus.id, statusUpdate);
    if (ok) {
      setSelectedForStatus(null);
    }
  };

  const submitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForUpload || uploadFiles.length === 0) return;
    const ok = await handleUploadEvidence(selectedForUpload.id, uploadFiles);
    if (ok) {
      setSelectedForUpload(null);
      setUploadFiles([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Overview Metrics */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Jharkhand Field Validation & Telemetry Network
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Field Testbeds & Deployment Observability
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Track ground-level technology validation, solar/IoT telemetry, and direct citizen impact across Jharkhand districts. Sponsor dedicated testbed sites to pilot prototypes before state-wide commercialization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Commission Testbed
            </button>
            <button
              onClick={() => refresh()}
              title="Refresh Data"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs border border-white/10 transition-colors cursor-pointer"
            >
              <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Total Testbed Sites</div>
            <div className="text-2xl font-bold text-white mt-1">{totalElements || testbeds.length}</div>
            <div className="text-[11px] text-indigo-300 mt-1">Across Jharkhand</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Live Field Trials</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
              {liveCountAll}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1">Active data telemetry</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Citizens Impacted</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              {totalBeneficiariesAll.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1">Direct ground reach</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Completed & Validated</div>
            <div className="text-2xl font-bold text-indigo-300 mt-1">{completedCountAll}</div>
            <div className="text-[11px] text-indigo-300/80 mt-1">Ready for scale-up</div>
          </div>
        </div>
      </div>

      {/* 2. District Coverage Quick-Filter Pills */}
      {districtSummary.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              District Deployment Footprint
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Click a district to filter deployments
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterValue("district", "ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filters.district === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Districts ({testbeds.length})
            </button>
            {districtSummary.map((d) => (
              <button
                key={d.district}
                onClick={() => setFilterValue("district", d.district)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  filters.district === d.district
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{d.district}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filters.district === d.district ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}>
                  {d.activeTestbedsCount}
                </span>
                {d.totalBeneficiaries > 0 && (
                  <span className={`text-[10px] ${filters.district === d.district ? "text-indigo-200" : "text-amber-600 font-semibold"}`}>
                    • {d.totalBeneficiaries.toLocaleString("en-IN")} reach
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search testbeds by site name, project, block, or district..."
            value={filters.search}
            onChange={(e) => setFilterValue("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* District Dropdown */}
          <select
            value={filters.district}
            onChange={(e) => setFilterValue("district", e.target.value)}
            className="py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="ALL">All Districts</option>
            {JHARKHAND_DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={filters.status}
            onChange={(e) => setFilterValue("status", e.target.value)}
            className="py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="LIVE">Live Trial</option>
            <option value="COMPLETED">Completed</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {(filters.district !== "ALL" || filters.status !== "ALL" || filters.search) && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Testbeds Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-200 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              <div className="h-28 bg-slate-100 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-8 bg-slate-200 rounded-lg flex-1" />
                <div className="h-8 bg-slate-200 rounded-lg w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : testbeds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Field Testbed Deployments Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No sponsored testbeds match your selected filter criteria. Create a new site sponsorship or reset filters to see all deployments.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            + Commission New Testbed
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testbeds.map((testbed) => {
            const statusConfig = DEPLOYMENT_STATUS_CONFIG[testbed.deploymentStatus] || DEPLOYMENT_STATUS_CONFIG.PLANNED;
            const photoUrls = testbed.evidencePhotoUrls || [];

            return (
              <div
                key={testbed.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-5 space-y-3.5">
                  {/* Status Badge & Location */}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConfig.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                      {statusConfig.label}
                    </span>

                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {testbed.district}
                      {testbed.block && `, ${testbed.block}`}
                    </span>
                  </div>

                  {/* Title & Project Link */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {testbed.testbedName}
                    </h3>
                    {testbed.projectName && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        Proj: <span className="text-slate-700 font-medium">{testbed.projectName}</span>
                      </p>
                    )}
                    {testbed.villageOrLocation && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Site: {testbed.villageOrLocation}
                      </p>
                    )}
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Beneficiaries</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {(testbed.beneficiariesImpacted || testbed.beneficiaryCount || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Pilot Phase</div>
                      <div className="text-[11px] font-semibold text-indigo-700 mt-0.5 truncate">
                        {testbed.pilotPhase || "Validation"}
                      </div>
                    </div>
                  </div>

                  {/* Live Telemetry Link Banner (if present) */}
                  {testbed.liveDataFeedUrl && (
                    <a
                      href={testbed.liveDataFeedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-medium hover:bg-emerald-100/70 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Sensor Telemetry
                      </span>
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}

                  {/* Verification Evidence Photos Preview */}
                  {photoUrls.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                        <span>Field Verification Photos ({photoUrls.length})</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {photoUrls.map((url, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setLightboxPhoto(url)}
                            className="relative w-16 h-12 rounded-md overflow-hidden border border-slate-200 shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Evidence ${pIdx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenStatusModal(testbed)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Update Status
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedForUpload(testbed);
                        setUploadFiles([]);
                      }}
                      title="Upload Evidence Photos"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete testbed '${testbed.testbedName}'?`)) {
                          handleDeleteTestbed(testbed.id);
                        }
                      }}
                      title="Delete Testbed"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODALS                                                     */}
      {/* ------------------------------------------------------------- */}

      {/* A. Commission Testbed Modal */}
      <CreateTestbedModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTestbed}
        isSubmitting={isSaving}
      />

      {/* B. Update Status Modal */}
      {selectedForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update Deployment Status</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{selectedForStatus.testbedName}</p>
              </div>
              <button
                onClick={() => setSelectedForStatus(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={submitStatusUpdate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deployment Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value as DeploymentStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-indigo-500 outline-none bg-white font-medium"
                >
                  <option value="PLANNED">Planned Deployment</option>
                  <option value="LIVE">Live Field Trial (Active)</option>
                  <option value="COMPLETED">Completed & Validated</option>
                  <option value="SUSPENDED">Temporarily Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Beneficiaries Reached</label>
                <input
                  type="number"
                  min="0"
                  value={statusUpdate.beneficiaryCount || 0}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, beneficiaryCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telemetry URL</label>
                <input
                  type="url"
                  placeholder="https://telemetry..."
                  value={statusUpdate.liveDataFeedUrl || ""}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, liveDataFeedUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedForStatus(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. Upload Evidence Photos Modal */}
      {selectedForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload Verification Photos</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{selectedForUpload.testbedName}</p>
              </div>
              <button
                onClick={() => setSelectedForUpload(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={submitUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  id="evidence-files-input"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setUploadFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="evidence-files-input" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    Click to select ground verification photos
                  </div>
                  <div className="text-[11px] text-slate-400">
                    PNG, JPG, WebP up to 10MB each
                  </div>
                </label>
              </div>

              {uploadFiles.length > 0 && (
                <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200/60">
                  {uploadFiles.length} photo(s) selected for upload:
                  <ul className="list-disc pl-4 mt-1 text-[11px] text-slate-600 truncate">
                    {uploadFiles.map((f, i) => (
                      <li key={i}>{f.name} ({(f.size / 1024).toFixed(0)} KB)</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedForUpload(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadFiles.length === 0}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Uploading..." : "Upload Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. Lightbox Photo Viewer Modal */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-xl overflow-hidden shadow-2xl border border-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxPhoto} alt="Verification Fullscreen" className="w-full h-full object-contain max-h-[85vh]" />
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
