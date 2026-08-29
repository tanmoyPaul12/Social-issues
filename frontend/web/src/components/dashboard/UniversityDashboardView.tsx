"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

interface UniversityProject {
  id: string;
  ticketId: string;
  title: string;
  domain: string;
  district: string;
  stage: "Team Formation" | "Lab Prototyping" | "Field Pilot" | "Deployment Handover";
  progress: number;
  facultyMentor: string;
  studentLead: string;
  grantFunded: string;
  csrPartner: string;
  milestoneDesc: string;
}

interface RoutedChallenge {
  id: string;
  ticketId: string;
  title: string;
  domain: string;
  district: string;
  urgency: string;
  matchScore: string;
  problemSnippet: string;
}

interface IndustryOffer {
  company: string;
  title: string;
  offeredAmount: string;
  domain: string;
  status: string;
}

interface UniversityDashboardViewProps {
  activeTab?: string;
}

export function UniversityDashboardView({ activeTab = "overview" }: UniversityDashboardViewProps) {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<UniversityProject[]>([]);
  const [inbox, setInbox] = useState<RoutedChallenge[]>([]);
  const [offers] = useState<IndustryOffer[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedInboxItem, setSelectedInboxItem] = useState<RoutedChallenge | null>(null);

  // Form State for Team Assignment
  const defaultFaculty = user?.name ? `${user.name} (${user.designation || "Lead SPOC"})` : "Nodal Faculty Mentor";
  const [assignFaculty, setAssignFaculty] = useState(defaultFaculty);
  const [assignStudentLead, setAssignStudentLead] = useState("");
  const [assignCapstones, setAssignCapstones] = useState("");

  const institutionName = user?.orgName || "Academic Research Institution";
  const aisheBadge = user?.aisheCode
    ? `AISHE: ${user.aisheCode} • ${institutionName}`
    : `Institution: ${institutionName}`;

  const handleClaimChallenge = (item: RoutedChallenge) => {
    setSelectedInboxItem(item);
    setIsTeamModalOpen(true);
  };

  const handleConfirmTeamAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInboxItem) return;

    const newProject: UniversityProject = {
      id: `PROJ-${(user?.aisheCode || "HEI").replace(/[^a-zA-Z0-9]/g, "")}-0${projects.length + 1}`,
      ticketId: selectedInboxItem.ticketId,
      title: selectedInboxItem.title,
      domain: selectedInboxItem.domain,
      district: selectedInboxItem.district,
      stage: "Team Formation",
      progress: 25,
      facultyMentor: assignFaculty || defaultFaculty,
      studentLead: assignStudentLead ? `${assignStudentLead} ${assignCapstones ? `+ ${assignCapstones}` : ""}` : "Student Capstone Team",
      grantFunded: "₹20.0 Lakhs (Allocated)",
      csrPartner: "State Innovation Fund",
      milestoneDesc: "Project team formed; preparing technical specification and prototype roadmap.",
    };

    setProjects([newProject, ...projects]);
    setInbox(inbox.filter((i) => i.id !== selectedInboxItem.id));
    setIsTeamModalOpen(false);
    setSelectedInboxItem(null);
    toast.success(`Capstone project activated for "${newProject.title}"`);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            University (HEI) Academic R&amp;D Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome to the central academic research portal for <strong>{institutionName}</strong>. Triage grassroots challenges, manage student capstone teams, and allocate NEP 2020 R&amp;D grants.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1 rounded">
            {aisheBadge}
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending AI Challenges", value: inbox.length },
          { label: "Active Capstone Projects", value: projects.length },
          { label: "Grants Drawdown", value: projects.length > 0 ? `₹${(projects.length * 18.5).toFixed(1)}L` : "₹0.0L" },
          { label: "Patents / IP Filed", value: "0" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-300/80 p-5 rounded-sm shadow-2xs">
            <div className="text-xs font-bold text-slate-700">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Section: Projects (Overview or Active Projects tab) */}
      {(activeTab === "overview" || activeTab === "projects") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Active University Capstone Projects ({projects.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">NEP 2020 Capstone Registry</span>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Active Capstone Projects</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Triage and claim routed grassroots challenges below or form a new student capstone team to start receiving state R&amp;D grants.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Project ID</th>
                    <th className="py-3 px-4">Title &amp; Milestone</th>
                    <th className="py-3 px-4">Faculty Mentor</th>
                    <th className="py-3 px-4">Grant Budget</th>
                    <th className="py-3 px-4">Stage &amp; Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-800">{proj.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{proj.title}</div>
                        <div className="text-[11px] text-slate-500 max-w-sm">{proj.milestoneDesc}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{proj.facultyMentor}</div>
                        <div className="text-[11px] text-slate-500">{proj.studentLead}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{proj.grantFunded}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          {proj.stage} ({proj.progress}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Section: Routed Challenges Inbox */}
      {(activeTab === "inbox" || activeTab === "overview") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                AI-Routed Challenges Matching Your Institution ({inbox.length})
              </h2>
              <p className="text-xs text-slate-500">Grassroots problems mapped to your registered research disciplines</p>
            </div>
          </div>

          {inbox.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Pending AI-Routed Challenges</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                When citizens and Panchayats submit local challenges matching your registered research disciplines, they will be automatically clustered by AI and routed here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inbox.map((item) => (
                <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {item.ticketId}
                      </span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.domain}
                      </span>
                      <span className="text-emerald-700 font-bold">{item.matchScore}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600">{item.problemSnippet}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleClaimChallenge(item)}
                      className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Claim &amp; Assign Team →
                    </button>
                    <button
                      type="button"
                      onClick={() => setInbox(inbox.filter((i) => i.id !== item.id))}
                      className="px-3 py-2 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section: Industry Offers */}
      {activeTab === "industry" && (
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Industry &amp; CSR Co-Funding Offers ({offers.length})
          </h2>

          {offers.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Industry CSR Offers Pending</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Corporate CSR partners browsing the Technology Marketplace will send co-funding offers matching your research capabilities here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((offer, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">{offer.domain}</span>
                    <span className="text-slate-500 font-medium">{offer.status}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{offer.company}</h3>
                  <p className="text-slate-600">{offer.title}</p>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
                    <span className="text-slate-500">Offered Grant:</span>
                    <strong className="text-emerald-700 text-sm">{offer.offeredAmount}</strong>
                  </div>
                  <button type="button" className="w-full py-2 rounded bg-slate-900 text-white font-bold hover:bg-slate-800">
                    Review Agreement &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section: Faculty & Student Accounts */}
      {(activeTab === "users" || activeTab === "teams") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Institutional Users &amp; Capstone Innovators
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm divide-y divide-slate-100 text-xs">
            <div className="p-3.5 flex justify-between items-center hover:bg-slate-50">
              <div>
                <strong className="text-slate-900 block">{user?.name || "Nodal SPOC"}</strong>
                <span className="text-slate-500">{user?.designation || "Dean R&D / Institutional Lead"} • {institutionName}</span>
              </div>
              <div className="text-right">
                <span className="text-purple-800 font-bold block">Primary Coordinator</span>
                <span className="text-slate-400 font-mono text-[10px]">{user?.email || "spoc@institution.edu"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Team Formation Tool */}
      {isTeamModalOpen && selectedInboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-black text-slate-900">Form Capstone Team</h3>
            <p className="text-slate-500 mt-1">
              Assign a Lead Faculty Mentor and student capstone team for <strong>{selectedInboxItem.title}</strong>.
            </p>

            <form onSubmit={handleConfirmTeamAssignment} className="mt-4 space-y-3.5 font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Assign Lead Faculty Mentor:</label>
                <input
                  type="text"
                  value={assignFaculty}
                  onChange={(e) => setAssignFaculty(e.target.value)}
                  placeholder="e.g. Dr. A. K. Sinha (Dept. of Remote Sensing & CSE)"
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assign Student Lead (PG / PhD):</label>
                <input
                  type="text"
                  value={assignStudentLead}
                  onChange={(e) => setAssignStudentLead(e.target.value)}
                  placeholder="e.g. Rohan Verma (M.Tech AI)"
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Capstone Innovators &amp; ABC Credits:</label>
                <input
                  type="text"
                  value={assignCapstones}
                  onChange={(e) => setAssignCapstones(e.target.value)}
                  placeholder="e.g. 4 Final Year B.Tech Students (NEP ABC 6 Credits)"
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer"
              >
                Confirm Project Activation →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
