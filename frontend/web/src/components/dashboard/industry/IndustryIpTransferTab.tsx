"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FileText,
  ShieldCheck,
  Award,
  Layers,
  Search,
  Plus,
  Clock,
  Building2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
} from "@/components/dashboard/icons";
import { toast } from "@/components/dashboard/ToastStack";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  industryLifecycleApi,
  IpRecordDto,
  IpType,
  IpStatus,
  CreateIpRecordRequest,
} from "@/modules/industry/services/industryLifecycleApi";
import { fetchActivePilots } from "@/modules/industry/services/activePilotsApi";
import { ActivePilotSummary } from "@/modules/industry/types/activePilots";

interface IndustryIpTransferTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export function IndustryIpTransferTab({ onNavigateTab }: IndustryIpTransferTabProps) {
  const { token, user } = useAuthStore();
  const [records, setRecords] = useState<IpRecordDto[]>([]);
  const [pilots, setPilots] = useState<ActivePilotSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<IpRecordDto | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form State for new IP disclosure
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newAbstract, setNewAbstract] = useState<string>("");
  const [newIpType, setNewIpType] = useState<IpType>("SHARED_PATENT");
  const [newPatentOffice, setNewPatentOffice] = useState<string>("Indian Patent Office (IPO) Kolkata");
  const [newPatentAppNumber, setNewPatentAppNumber] = useState<string>("");
  const [newFilingDate, setNewFilingDate] = useState<string>("");
  const [newHeiShare, setNewHeiShare] = useState<number>(50);
  const [newStudentShare, setNewStudentShare] = useState<number>(30);
  const [newIndustryShare, setNewIndustryShare] = useState<number>(20);
  const [newInventors, setNewInventors] = useState<string>("");
  const [newPartnerName, setNewPartnerName] = useState<string>(
    user?.orgName || "Corporate CSR Innovation Partner"
  );
  const [newRoyaltyTerms, setNewRoyaltyTerms] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load IP Catalog from real API
  const loadIpCatalog = useCallback(
    async (showSilentRefresh = false) => {
      if (showSilentRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await industryLifecycleApi.getIpCatalog(
          {
            ipType: selectedType !== "ALL" ? selectedType : undefined,
            status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          },
          token
        );
        setRecords(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Failed to load IP catalog:", err);
        setError(err?.message || "Failed to load Intellectual Property catalog from server.");
        toast.error("Could not fetch IP records: " + (err?.message || "Server Error"));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, selectedType, selectedStatus]
  );

  // Load available pilots for project selection
  const loadPilots = useCallback(async () => {
    try {
      const response = await fetchActivePilots(token, { size: 50 });
      if (response && Array.isArray(response.content) && response.content.length > 0) {
        setPilots(response.content);
        setSelectedProjectId(response.content[0].projectId || response.content[0].id);
      }
    } catch (err) {
      console.warn("Could not fetch active pilots list for IP dropdown:", err);
    }
  }, [token]);

  useEffect(() => {
    loadIpCatalog();
    loadPilots();
  }, [loadIpCatalog, loadPilots]);

  // Create new IP record via POST /api/projects/{projectId}/ip-records
  const handleCreateIpRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please provide a title for the Intellectual Property disclosure.");
      return;
    }

    if (newIpType === "SHARED_PATENT") {
      const totalShare = Number(newHeiShare) + Number(newStudentShare) + Number(newIndustryShare);
      if (totalShare !== 100) {
        toast.error(`Tripartite ownership shares must sum to 100% (currently ${totalShare}%).`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload: CreateIpRecordRequest = {
        title: newTitle.trim(),
        abstractDescription: newAbstract.trim() || undefined,
        ipType: newIpType,
        patentApplicationNumber: newPatentAppNumber.trim() || undefined,
        filingDate: newFilingDate || undefined,
        patentOffice: newPatentOffice.trim() || undefined,
        status: "IDEA_DISCLOSURE",
        heiOwnershipShare: newHeiShare,
        studentInnovatorsShare: newStudentShare,
        industryPartnerShare: newIndustryShare,
        inventorsList: newInventors.trim() || undefined,
        commercialPartnerName: newPartnerName.trim() || undefined,
        royaltyTerms: newRoyaltyTerms.trim() || undefined,
      };

      const created = await industryLifecycleApi.createIpRecord(
        selectedProjectId || 1,
        payload,
        token
      );

      toast.success(`IP disclosure "${created.title}" successfully registered in state registry!`);
      setShowCreateModal(false);
      resetForm();
      await loadIpCatalog(true);
    } catch (err: any) {
      console.error("Error creating IP record:", err);
      toast.error(err?.message || "Failed to register IP disclosure");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update IP status via PATCH /api/projects/{projectId}/ip-records/{id}/status
  const handleUpdateIpStatus = async (record: IpRecordDto, nextStatus: IpStatus) => {
    try {
      setIsUpdatingStatus(true);
      const updated = await industryLifecycleApi.updateIpStatus(
        record.projectId || 1,
        record.id,
        { status: nextStatus },
        token
      );

      setRecords((prev) => prev.map((r) => (r.id === record.id ? updated : r)));
      if (selectedRecordForDetail?.id === record.id) {
        setSelectedRecordForDetail(updated);
      }
      toast.success(`IP Status updated to ${nextStatus.replace(/_/g, " ")}`);
    } catch (err: any) {
      console.error("Error updating IP status:", err);
      toast.error(err?.message || "Failed to update IP status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete IP record via DELETE /api/projects/{projectId}/ip-records/{id}
  const handleDeleteIpRecord = async (record: IpRecordDto) => {
    if (!window.confirm(`Are you sure you want to delete the IP record "${record.title}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await industryLifecycleApi.deleteIpRecord(record.projectId || 1, record.id, token);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      if (selectedRecordForDetail?.id === record.id) {
        setSelectedRecordForDetail(null);
      }
      toast.success("IP record removed from registry.");
    } catch (err: any) {
      console.error("Error deleting IP record:", err);
      toast.error(err?.message || "Failed to delete IP record");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setNewTitle("");
    setNewAbstract("");
    setNewIpType("SHARED_PATENT");
    setNewPatentAppNumber("");
    setNewFilingDate("");
    setNewHeiShare(50);
    setNewStudentShare(30);
    setNewIndustryShare(20);
    setNewInventors("");
    setNewRoyaltyTerms("");
  };

  // Filter records locally by search query
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title?.toLowerCase().includes(q);
        const matchApp = r.patentApplicationNumber?.toLowerCase().includes(q);
        const matchInv = r.inventorsList?.toLowerCase().includes(q);
        const matchPartner = r.commercialPartnerName?.toLowerCase().includes(q);
        if (!matchTitle && !matchApp && !matchInv && !matchPartner) return false;
      }
      return true;
    });
  }, [records, searchQuery]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = records.length;
    const granted = records.filter(
      (r) => r.status === "GRANTED" || r.status === "COMMERCIALLY_LICENSED"
    ).length;
    const patents = records.filter((r) => r.ipType === "SHARED_PATENT").length;
    const openSource = records.filter((r) => r.ipType === "OPEN_SOURCE").length;
    return { total, granted, patents, openSource };
  }, [records]);

  const getStatusBadge = (status: IpStatus | string) => {
    switch (status) {
      case "GRANTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Patent Granted
          </span>
        );
      case "COMMERCIALLY_LICENSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Award className="w-3.5 h-3.5 text-blue-700" /> Commercially Licensed
          </span>
        );
      case "EXAMINATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Under Examination
          </span>
        );
      case "PROVISIONAL_FILED":
      case "COMPLETE_SPEC_FILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <FileText className="w-3.5 h-3.5 text-purple-700" /> Application Filed
          </span>
        );
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-700" /> Published
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-600" /> Disclosure Stage
          </span>
        );
    }
  };

  const getIpTypeBadge = (type: IpType | string) => {
    switch (type) {
      case "SHARED_PATENT":
        return (
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Tripartite Shared Patent
          </span>
        );
      case "OPEN_SOURCE":
        return (
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Open-Source Civic Good
          </span>
        );
      case "COMMERCIAL_LICENSE":
        return (
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Commercial License
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            Copyright / Software
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Intellectual Property &amp; Technology Transfer Hub
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live API Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track patent disclosures, tripartite co-ownership agreements, Technology Readiness Levels (TRL 4–9), and institutional licensing MOUs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => loadIpCatalog(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Refresh from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            File New IP Disclosure
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total IP Portfolio</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {isLoading ? "—" : stats.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Patents, licenses &amp; civic code</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Patents Granted / Active</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {isLoading ? "—" : stats.granted}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Legally protected prototypes</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tripartite Co-Patents</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-2">
            {isLoading ? "—" : stats.patents}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">HEI + Student + Industry</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Open-Civic Innovations</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800 mt-2">
            {isLoading ? "—" : stats.openSource}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Public Good Deployments</div>
        </div>
      </div>

      {/* Tripartite Policy Visualizer Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl border border-indigo-800/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black tracking-wider uppercase text-amber-300">
                Jharkhand NEP 2020 Standard Tripartite Ownership Framework
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              All collaborative university R&amp;D projects funded through CSR grants adhere to standardized patent assignment: 
              <strong> 50% Higher Education Institution</strong>, <strong>30% Student Innovator Team</strong>, and <strong>20% Industry Co-Funder</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
            <div className="text-center">
              <div className="text-xs font-bold text-emerald-300">50%</div>
              <div className="text-[10px] text-slate-300">University</div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-xs font-bold text-amber-300">30%</div>
              <div className="text-[10px] text-slate-300">Students</div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-xs font-bold text-blue-300">20%</div>
              <div className="text-[10px] text-slate-300">Industry</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patent title, app #, or inventor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* IP Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg outline-none cursor-pointer text-slate-700"
          >
            <option value="ALL">All IP Types</option>
            <option value="SHARED_PATENT">Tripartite Shared Patent</option>
            <option value="OPEN_SOURCE">Open Source Civic</option>
            <option value="COMMERCIAL_LICENSE">Commercial License</option>
            <option value="COPYRIGHT_SOFTWARE">Copyright / Software</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg outline-none cursor-pointer text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="IDEA_DISCLOSURE">Idea Disclosure</option>
            <option value="PROVISIONAL_FILED">Provisional Filed</option>
            <option value="COMPLETE_SPEC_FILED">Complete Spec Filed</option>
            <option value="PUBLISHED">Published</option>
            <option value="EXAMINATION">Under Examination</option>
            <option value="GRANTED">Patent Granted</option>
            <option value="COMMERCIALLY_LICENSED">Commercially Licensed</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadIpCatalog()}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* IP Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Fetching live IP &amp; technology transfer catalog...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Patent / Disclosure Title</th>
                  <th className="py-3 px-4">Application Number</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Ownership Split</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Filing Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-slate-300" />
                        <p className="font-medium text-slate-600">No intellectual property records found</p>
                        <p className="text-[11px] text-slate-400">
                          {searchQuery
                            ? "Try refining your search keywords or filters"
                            : "Click 'File New IP Disclosure' to register a new prototype patent"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                        <div>{item.title}</div>
                        <div className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                          {item.inventorsList || "Faculty & Student Research Team"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {item.patentApplicationNumber || "— (Draft / Disclosure)"}
                      </td>
                      <td className="py-3.5 px-4">
                        {getIpTypeBadge(item.ipType)}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.ipType === "SHARED_PATENT" ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-[11px]">
                            <span className="text-emerald-700">{item.heiOwnershipShare}%</span> / 
                            <span className="text-amber-700">{item.studentInnovatorsShare}%</span> / 
                            <span className="text-blue-700">{item.industryPartnerShare}%</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Public Domain / 100%</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {item.filingDate ? new Date(item.filingDate).toLocaleDateString() : "Pending"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRecordForDetail(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-all cursor-pointer"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIpRecord(item)}
                            title="Delete IP Record"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Create IP Disclosure */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">File Intellectual Property &amp; Patent Disclosure</h3>
                <p className="text-xs text-slate-500">Register prototype innovation for institutional patent assignment and licensing.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIpRecord} className="space-y-4 mt-4 text-xs">
              {/* Project Selection Dropdown */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Associated Co-Funded Project / Pilot *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 bg-white font-medium text-slate-800"
                >
                  {pilots.length > 0 ? (
                    pilots.map((p) => (
                      <option key={p.id} value={p.projectId || p.id}>
                        #{p.id} — {p.title} ({p.universityName || "University Partner"})
                      </option>
                    ))
                  ) : (
                    <option value={1}>Project #1 — State Innovation R&amp;D Pilot</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Patent / Innovation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar-Powered Microbial Water Filtration & Telemetry Hub"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Technical Abstract &amp; Novelty Claims</label>
                <textarea
                  rows={3}
                  placeholder="Describe technical working principles, problem solved, and inventive step..."
                  value={newAbstract}
                  onChange={(e) => setNewAbstract(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">IP Framework Type</label>
                  <select
                    value={newIpType}
                    onChange={(e: any) => setNewIpType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none cursor-pointer bg-white text-slate-800"
                  >
                    <option value="SHARED_PATENT">Tripartite Shared Patent (HEI + Students + CSR)</option>
                    <option value="OPEN_SOURCE">Open Source / Civic Public Good</option>
                    <option value="COMMERCIAL_LICENSE">Exclusive Commercial License</option>
                    <option value="COPYRIGHT_SOFTWARE">Copyright / Software</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jurisdiction / Patent Office</label>
                  <input
                    type="text"
                    value={newPatentOffice}
                    onChange={(e) => setNewPatentOffice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Patent Application Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. IN-2026-PAT-009142"
                    value={newPatentAppNumber}
                    onChange={(e) => setNewPatentAppNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Filing Date (Optional)</label>
                  <input
                    type="date"
                    value={newFilingDate}
                    onChange={(e) => setNewFilingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-900"
                  />
                </div>
              </div>

              {newIpType === "SHARED_PATENT" && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Tripartite Ownership Split (%)</span>
                    <span
                      className={`text-xs font-bold ${
                        Number(newHeiShare) + Number(newStudentShare) + Number(newIndustryShare) === 100
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      Sum: {Number(newHeiShare) + Number(newStudentShare) + Number(newIndustryShare)}% / 100%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500">University (HEI)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newHeiShare}
                        onChange={(e) => setNewHeiShare(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Student Team</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newStudentShare}
                        onChange={(e) => setNewStudentShare(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Industry Sponsor</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newIndustryShare}
                        onChange={(e) => setNewIndustryShare(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">Inventors List (Faculty Mentors &amp; Students)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. R. Sengupta (Faculty), Ankit Kumar (Student), Priya Soren (Student)"
                  value={newInventors}
                  onChange={(e) => setNewInventors(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Commercial Royalty / Licensing Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 3.5% net revenue royalty shared equally between HEI and student inventors"
                  value={newRoyaltyTerms}
                  onChange={(e) => setNewRoyaltyTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? "Filing with Registry..." : "Register IP Disclosure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View IP Record Detail */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                  {selectedRecordForDetail.patentApplicationNumber || `IP Disclosure Record #${selectedRecordForDetail.id}`}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedRecordForDetail.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Current Status</div>
                  <div className="mt-1">{getStatusBadge(selectedRecordForDetail.status)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Update Status (Live API)</div>
                  <select
                    value={selectedRecordForDetail.status}
                    disabled={isUpdatingStatus}
                    onChange={(e: any) => handleUpdateIpStatus(selectedRecordForDetail, e.target.value)}
                    className="mt-1 px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-md outline-none cursor-pointer disabled:opacity-50 text-slate-800"
                  >
                    <option value="IDEA_DISCLOSURE">Idea Disclosure</option>
                    <option value="PRIOR_ART_SEARCH">Prior Art Search</option>
                    <option value="PROVISIONAL_FILED">Provisional Filed</option>
                    <option value="COMPLETE_SPEC_FILED">Complete Spec Filed</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="EXAMINATION">Under Examination</option>
                    <option value="GRANTED">Patent Granted</option>
                    <option value="COMMERCIALLY_LICENSED">Commercially Licensed</option>
                  </select>
                </div>
              </div>

              {selectedRecordForDetail.abstractDescription && (
                <div>
                  <div className="font-bold text-slate-800 mb-0.5">Abstract &amp; Novelty Claims:</div>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedRecordForDetail.abstractDescription}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500 font-bold">Ownership Split:</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedRecordForDetail.ipType === "SHARED_PATENT" ? (
                      <span>
                        HEI: {selectedRecordForDetail.heiOwnershipShare}% | Student: {selectedRecordForDetail.studentInnovatorsShare}% | Industry: {selectedRecordForDetail.industryPartnerShare}%
                      </span>
                    ) : (
                      "Public Good / 100%"
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold">Patent Office:</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedRecordForDetail.patentOffice || "Indian Patent Office"}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-0.5">Inventors:</div>
                <p className="text-slate-700">{selectedRecordForDetail.inventorsList || "Institutional R&D Team"}</p>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-0.5">Commercial Partner:</div>
                <p className="text-slate-700">{selectedRecordForDetail.commercialPartnerName || "State Innovation Fund"}</p>
              </div>

              {selectedRecordForDetail.royaltyTerms && (
                <div>
                  <div className="font-bold text-slate-800 mb-0.5">Royalty &amp; Licensing Terms:</div>
                  <p className="text-slate-600 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
                    {selectedRecordForDetail.royaltyTerms}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteIpRecord(selectedRecordForDetail)}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Disclosure
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
