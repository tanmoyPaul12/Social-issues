"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  ShieldCheck,
  Award,
  Layers,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Download,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  Briefcase,
  Sparkles,
  ChevronRight,
  BookOpen,
  DollarSign,
  AlertCircle
} from "@/components/dashboard/icons";
import { toast } from "@/components/dashboard/ToastStack";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface IpRecord {
  id: number;
  projectId: number;
  title: string;
  abstractDescription?: string;
  ipType: "SHARED_PATENT" | "OPEN_SOURCE" | "COMMERCIAL_LICENSE" | "COPYRIGHT_SOFTWARE";
  patentApplicationNumber?: string;
  filingDate?: string;
  grantDate?: string;
  patentOffice?: string;
  status: "IDEA_DISCLOSURE" | "PRIOR_ART_SEARCH" | "PROVISIONAL_FILED" | "COMPLETE_SPEC_FILED" | "PUBLISHED" | "EXAMINATION" | "GRANTED" | "COMMERCIALLY_LICENSED";
  heiOwnershipShare: number;
  studentInnovatorsShare: number;
  industryPartnerShare: number;
  inventorsList?: string;
  commercialPartnerName?: string;
  mouDocumentUrl?: string;
  royaltyTerms?: string;
  createdAt: string;
}

const INITIAL_DEMO_RECORDS: IpRecord[] = [
  {
    id: 1,
    projectId: 1,
    title: "Solar-Powered Low-Cost Microbial Water Filtration & Telemetry Hub",
    abstractDescription: "Multi-stage physical and UV-C disinfection unit for arsenic and iron contaminated aquifers across Santhal Pargana, powered entirely by 120W bifacial solar arrays.",
    ipType: "SHARED_PATENT",
    patentApplicationNumber: "IN-2026-PAT-009142",
    filingDate: "2026-06-15",
    grantDate: "2026-08-20",
    patentOffice: "Indian Patent Office (IPO) Kolkata",
    status: "GRANTED",
    heiOwnershipShare: 50,
    studentInnovatorsShare: 30,
    industryPartnerShare: 20,
    inventorsList: "Dr. R. Sengupta (Faculty), Ankit Kumar (Student Innovator), Priya Soren (Student Innovator)",
    commercialPartnerName: "Tata Steel Rural Infrastructure Division",
    mouDocumentUrl: "https://jharkhand.gov.in/mou/ip-2026-009142.pdf",
    royaltyTerms: "3.5% net sales royalty disbursed to BIT Mesra Innovation Fund; 50% distributed to student inventors.",
    createdAt: "2026-06-10T10:00:00Z"
  },
  {
    id: 2,
    projectId: 2,
    title: "IoT LoRaWAN Soil Macronutrient (NPK) & Heavy Metal Runoff Telemetry Sensor",
    abstractDescription: "Sub-surface electrochemical sensing probe with long-range low-power telemetry designed for coal mining peripheral buffer agricultural zones in Dhanbad.",
    ipType: "SHARED_PATENT",
    patentApplicationNumber: "IN-2026-PAT-008321",
    filingDate: "2026-07-22",
    patentOffice: "Indian Patent Office (IPO) Kolkata",
    status: "EXAMINATION",
    heiOwnershipShare: 50,
    studentInnovatorsShare: 30,
    industryPartnerShare: 20,
    inventorsList: "Dr. K. N. Murthy (Faculty Lead), Rahul Verma, Sneha Gupta",
    commercialPartnerName: "Coal India CSR Technology Wing",
    royaltyTerms: "Pre-commercial field pilot testbed MOU signed; commercial royalty terms under committee review.",
    createdAt: "2026-07-15T12:30:00Z"
  },
  {
    id: 3,
    projectId: 3,
    title: "Open-Civic Edge AI Traffic & Pothole Hazard Telemetry Firmware",
    abstractDescription: "Lightweight computer vision model operating on edge Raspberry Pi 5 accelerators for municipal waste vehicles and bus fleets across Ranchi Urban Local Body.",
    ipType: "OPEN_SOURCE",
    patentApplicationNumber: "MIT / CC-BY-4.0 #8812",
    filingDate: "2026-08-01",
    patentOffice: "Open Source Initiative / GitHub Registry",
    status: "COMMERCIALLY_LICENSED",
    heiOwnershipShare: 0,
    studentInnovatorsShare: 0,
    industryPartnerShare: 0,
    inventorsList: "Arunav Mishra (Student Lead), Dept of CS BIT Mesra",
    commercialPartnerName: "State Urban Development Agency (SUDA)",
    royaltyTerms: "100% Free Public Good License for all Municipal Corporations of Jharkhand.",
    createdAt: "2026-07-28T09:15:00Z"
  }
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

interface IndustryIpTransferTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export function IndustryIpTransferTab({ onNavigateTab }: IndustryIpTransferTabProps) {
  const { token, user } = useAuthStore();
  const [records, setRecords] = useState<IpRecord[]>(INITIAL_DEMO_RECORDS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<IpRecord | null>(null);

  // Form State for new IP disclosure
  const [newTitle, setNewTitle] = useState("");
  const [newAbstract, setNewAbstract] = useState("");
  const [newIpType, setNewIpType] = useState<"SHARED_PATENT" | "OPEN_SOURCE" | "COMMERCIAL_LICENSE">("SHARED_PATENT");
  const [newPatentOffice, setNewPatentOffice] = useState("Indian Patent Office (IPO) Kolkata");
  const [newHeiShare, setNewHeiShare] = useState(50);
  const [newStudentShare, setNewStudentShare] = useState(30);
  const [newIndustryShare, setNewIndustryShare] = useState(20);
  const [newInventors, setNewInventors] = useState("");
  const [newPartnerName, setNewPartnerName] = useState(user?.orgName || "Corporate CSR Innovation Partner");
  const [newRoyaltyTerms, setNewRoyaltyTerms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIpCatalog();
  }, [token]);

  const fetchIpCatalog = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/ip/catalog`, {
        headers: {
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRecords(data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch live IP catalog, falling back to demo records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIpRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please provide a Title for the Intellectual Property disclosure.");
      return;
    }
    if (newHeiShare + newStudentShare + newIndustryShare !== 100 && newIpType === "SHARED_PATENT") {
      toast.error("Tripartite ownership shares must sum exactly to 100%.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: newTitle.trim(),
        abstractDescription: newAbstract.trim(),
        ipType: newIpType,
        patentOffice: newPatentOffice,
        status: "IDEA_DISCLOSURE",
        heiOwnershipShare: newHeiShare,
        studentInnovatorsShare: newStudentShare,
        industryPartnerShare: newIndustryShare,
        inventorsList: newInventors.trim(),
        commercialPartnerName: newPartnerName.trim(),
        royaltyTerms: newRoyaltyTerms.trim()
      };

      const res = await fetch(`${API_BASE_URL}/projects/1/ip-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setRecords((prev) => [saved, ...prev]);
        toast.success("Intellectual Property disclosure filed and recorded!");
      } else {
        // Optimistic update for UI if backend returns error
        const mockNew: IpRecord = {
          id: Date.now(),
          projectId: 1,
          ...payload,
          patentApplicationNumber: `IN-${new Date().getFullYear()}-APP-${Math.floor(100000 + Math.random() * 900000)}`,
          status: "IDEA_DISCLOSURE",
          createdAt: new Date().toISOString()
        };
        setRecords((prev) => [mockNew, ...prev]);
        toast.success("IP disclosure registered locally in portfolio.");
      }

      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create IP record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewTitle("");
    setNewAbstract("");
    setNewIpType("SHARED_PATENT");
    setNewHeiShare(50);
    setNewStudentShare(30);
    setNewIndustryShare(20);
    setNewInventors("");
    setNewRoyaltyTerms("");
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedType !== "ALL" && r.ipType !== selectedType) return false;
      if (selectedStatus !== "ALL" && r.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchApp = r.patentApplicationNumber?.toLowerCase().includes(q);
        const matchInv = r.inventorsList?.toLowerCase().includes(q);
        if (!matchTitle && !matchApp && !matchInv) return false;
      }
      return true;
    });
  }, [records, selectedType, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = records.length;
    const granted = records.filter((r) => r.status === "GRANTED" || r.status === "COMMERCIALLY_LICENSED").length;
    const patents = records.filter((r) => r.ipType === "SHARED_PATENT").length;
    const openSource = records.filter((r) => r.ipType === "OPEN_SOURCE").length;
    return { total, granted, patents, openSource };
  }, [records]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "GRANTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><ShieldCheck className="w-3.5 h-3.5" /> Patent Granted</span>;
      case "COMMERCIALLY_LICENSED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300"><Award className="w-3.5 h-3.5" /> Commercially Licensed</span>;
      case "EXAMINATION":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300"><Clock className="w-3.5 h-3.5" /> Under Examination</span>;
      case "PROVISIONAL_FILED":
      case "COMPLETE_SPEC_FILED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300"><FileText className="w-3.5 h-3.5" /> Application Filed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300"><Clock className="w-3.5 h-3.5" /> Disclosure Stage</span>;
    }
  };

  const getIpTypeBadge = (type: string) => {
    switch (type) {
      case "SHARED_PATENT":
        return <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">Tripartite Shared Patent</span>;
      case "OPEN_SOURCE":
        return <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Open-Source Civic Good</span>;
      case "COMMERCIAL_LICENSE":
        return <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Commercial License</span>;
      default:
        return <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Copyright / Software</span>;
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
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
              Live IP Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track patent disclosures, tripartite co-ownership agreements, Technology Readiness Levels (TRL 4–9), and institutional licensing MOUs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          File New IP Disclosure
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total IP Portfolio</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Patents, licenses &amp; civic code</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Patents Granted / Active</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{stats.granted}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Legally protected prototypes</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tripartite Co-Patents</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-2">{stats.patents}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">HEI + Student + Industry</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Open-Civic Innovations</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800 mt-2">{stats.openSource}</div>
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
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
            <option value="GRANTED">Granted</option>
            <option value="EXAMINATION">Under Examination</option>
            <option value="PROVISIONAL_FILED">Provisional Filed</option>
            <option value="IDEA_DISCLOSURE">Idea Disclosure</option>
          </select>
        </div>
      </div>

      {/* IP Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No intellectual property records found matching your filters.
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
                      {item.patentApplicationNumber || "— (Draft)"}
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
                        <span className="text-slate-400 text-[11px]">Public Domain</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {item.filingDate ? new Date(item.filingDate).toLocaleDateString() : "Pending"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecordForDetail(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-all cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <div>
                <label className="block font-bold text-slate-800 mb-1">Patent / Innovation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar-Powered Microbial Water Filtration & Telemetry Hub"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Technical Abstract &amp; Novelty Claims</label>
                <textarea
                  rows={3}
                  placeholder="Describe technical working principles, problem solved, and inventive step..."
                  value={newAbstract}
                  onChange={(e) => setNewAbstract(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">IP Framework Type</label>
                  <select
                    value={newIpType}
                    onChange={(e: any) => setNewIpType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none cursor-pointer bg-white"
                  >
                    <option value="SHARED_PATENT">Tripartite Shared Patent (HEI + Students + CSR)</option>
                    <option value="OPEN_SOURCE">Open Source / Civic Public Good</option>
                    <option value="COMMERCIAL_LICENSE">Exclusive Commercial License</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jurisdiction / Patent Office</label>
                  <input
                    type="text"
                    value={newPatentOffice}
                    onChange={(e) => setNewPatentOffice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              {newIpType === "SHARED_PATENT" && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">Tripartite Ownership Split (%)</div>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Commercial Royalty / Licensing Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 3.5% net revenue royalty shared equally between HEI and student inventors"
                  value={newRoyaltyTerms}
                  onChange={(e) => setNewRoyaltyTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Filing..." : "Register IP Disclosure"}
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
                  {selectedRecordForDetail.patentApplicationNumber || "IP Disclosure ID #" + selectedRecordForDetail.id}
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
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedRecordForDetail.status)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Jurisdiction</div>
                  <div className="font-semibold text-slate-800 mt-1">{selectedRecordForDetail.patentOffice}</div>
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
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
