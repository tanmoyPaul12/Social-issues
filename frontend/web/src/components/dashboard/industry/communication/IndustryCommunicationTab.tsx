"use client";

import React, { useState } from "react";
import { CommunicationWorkspace } from "../../common/CommunicationWorkspace";
import { useIndustryPitchStore, IndustryPitch } from "@/lib/store/useIndustryPitchStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import { postThreadMessage } from "@/modules/communication/services/communicationApi";

export function IndustryCommunicationTab() {
  const { user, token } = useAuthStore();
  const { pitches, acceptPitch, rejectPitch } = useIndustryPitchStore();
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PITCHES" | "ACTIVE">("ALL");

  const pendingPitches = pitches.filter((p) => p.status === "PENDING");
  const acceptedPitches = pitches.filter((p) => p.status === "ACCEPTED");

  const handleAcceptPitch = async (pitch: IndustryPitch) => {
    try {
      const accepted = acceptPitch(pitch.id);
      if (accepted) {
        toast.success(`Accepted grant proposal for "${pitch.projectTitle}". Added to Co-Funded Projects!`);

        // Notify in thread
        if (pitch.threadId) {
          try {
            await postThreadMessage(
              token,
              typeof pitch.threadId === "number" ? pitch.threadId : parseInt(String(pitch.threadId).replace(/\D/g, "") || "101"),
              `CSR GRANT PROPOSAL ACCEPTED\n\nProject: ${pitch.projectTitle}\nSponsor: ${user?.name || "Corporate CSR Sponsor"}\nApproved Grant: ₹${pitch.requestedAmount.toLocaleString("en-IN")}\n\nLegal MoU & Tranche 1 disbursement process initiated.`,
              undefined,
              undefined,
              typeof pitch.threadId === "number" ? pitch.threadId : Number(pitch.threadId || 101),
              user?.name || "Corporate CSR Head",
              "INDUSTRY_SPOC",
              pitch.projectTitle,
              "INDUSTRY"
            );
          } catch (e) {
            console.warn("Thread notification notice:", e);
          }
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to accept proposal");
    }
  };

  const handleDeclinePitch = (pitch: IndustryPitch) => {
    rejectPitch(pitch.id);
    toast.info(`Declined grant pitch for "${pitch.projectTitle}".`);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner & Telemetry Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Industry-University Collaborative Communication Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                Live Multi-Channel Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Engage with Faculty PIs, review institutional CSR grant pitches, inspect technical telemetry, and exchange formal agreements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Channels
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("PITCHES")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === "PITCHES" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span>Incoming Pitches</span>
              {pendingPitches.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full font-mono text-[10px]">
                  {pendingPitches.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mini KPI Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-slate-500 text-[11px] font-medium">Pending Grant Requisitions</span>
            <div className="text-base font-black text-slate-900 font-mono">
              {pendingPitches.length} Proposals
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-slate-500 text-[11px] font-medium">Active Co-Funded Channels</span>
            <div className="text-base font-black text-emerald-700 font-mono">
              {acceptedPitches.length} Active Streams
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-slate-500 text-[11px] font-medium">Platform Message Sync</span>
            <div className="text-base font-black text-indigo-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Bi-Directional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Grant Requisitions Banner if Any */}
      {pendingPitches.length > 0 && (activeFilter === "ALL" || activeFilter === "PITCHES") && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 shadow-xl space-y-4 border border-indigo-800/60">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <h3 className="font-black text-sm text-white">
                  Incoming Institutional CSR Grant Pitches ({pendingPitches.length})
                </h3>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Higher Education Institutions in Jharkhand have requested corporate grant co-funding and technical mentorship for these capstones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {pendingPitches.map((pitch) => (
              <div
                key={pitch.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold bg-white/20 text-indigo-200 px-2 py-0.5 rounded">
                      {pitch.projectCode || "JH-RND-2026"}
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      Ask: ₹{pitch.requestedAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm leading-tight">{pitch.projectTitle}</h4>
                  <p className="text-indigo-200 text-[11px] line-clamp-2">{pitch.description}</p>

                  <div className="text-[11px] text-slate-300 pt-1 border-t border-white/10 space-y-0.5">
                    <div>University: <strong className="text-white">{pitch.universityName}</strong></div>
                    {pitch.mentorNeeds && (
                      <div className="text-indigo-300 truncate">Mentorship Focus: {pitch.mentorNeeds}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleDeclinePitch(pitch)}
                    className="px-3 py-1.5 border border-white/30 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptPitch(pitch)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Accept &amp; Co-Fund Grant →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Communication Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <CommunicationWorkspace userRole="industry" />
      </div>
    </div>
  );
}

export default IndustryCommunicationTab;
