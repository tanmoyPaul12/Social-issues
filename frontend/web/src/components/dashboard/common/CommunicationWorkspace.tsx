"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCommunication } from "@/modules/communication/hooks/useCommunication";
import {
  clearLocalPitchedThreads,
  registerProjectPitchThread,
  CommunicationThread,
} from "@/modules/communication/services/communicationApi";

interface CommunicationWorkspaceProps {
  userRole?: "industry" | "university";
}

export function CommunicationWorkspace({ userRole = "industry" }: CommunicationWorkspaceProps) {
  const {
    threads,
    selectedThreadId,
    setSelectedThreadId,
    activeThread,
    messages,
    isLoading,
    isSending,
    sendMessage,
    refreshThreads,
  } = useCommunication(userRole);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PILOT" | "MARKETPLACE" | "ADVISORY">("ALL");
  const [inputMessage, setInputMessage] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [newChannelTitle, setNewChannelTitle] = useState("");
  const [newChannelPartner, setNewChannelPartner] = useState("");
  const [newChannelSector, setNewChannelSector] = useState("CSR Grant & Innovation");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredThreads = threads.filter((t) => {
    const matchSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterType === "ALL" || t.type === filterType;
    return matchSearch && matchFilter;
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !attachmentName) return;

    sendMessage(inputMessage, attachmentName || undefined);
    setInputMessage("");
    setAttachmentName(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelTitle.trim() || !newChannelPartner.trim()) return;

    const created = registerProjectPitchThread({
      title: newChannelTitle.trim(),
      partnerName: newChannelPartner.trim(),
      partnerRole:
        userRole === "university"
          ? `CSR Sponsor • ${newChannelPartner.trim()}`
          : `Lead PI • ${newChannelPartner.trim()}`,
      sector: newChannelSector,
      companyName: userRole === "university" ? newChannelPartner.trim() : "Corporate CSR Partner",
      universityName: userRole === "industry" ? newChannelPartner.trim() : "Birla Institute of Technology (BIT) Mesra",
    });

    refreshThreads();
    setSelectedThreadId(created.id);
    setIsNewChannelModalOpen(false);
    setNewChannelTitle("");
    setNewChannelPartner("");

    // Send greeting
    setTimeout(() => {
      sendMessage(`💬 Discussion channel initialized for "${newChannelTitle.trim()}". Real-time collaboration active.`);
    }, 200);
  };

  const handleSimulateAttachment = () => {
    const sampleFiles = [
      "Field_Telemetry_Data_v2.pdf",
      "MoU_CoDevelopment_Draft.docx",
      "Lab_Test_Results_Ranchi.xlsx",
      "Field_Testbed_Deployment_Photos.zip",
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setAttachmentName(picked);
  };

  const quickReplies =
    userRole === "university"
      ? [
          "Upload Latest Bench Test Telemetry",
          "Request CSR Grant Tranche Release",
          "Schedule Joint Review Call",
          "Share Student Team Roster",
        ]
      : [
          "Schedule Review Meeting with PI",
          "Approve Milestone & Release Grant",
          "Request Field Testbed Inspection",
          "Share Compliance Checklist",
        ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] flex flex-col">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-Time Bi-Directional Collab Sync</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {userRole === "university"
              ? "University-Industry Collaboration Workspace"
              : "Industry-Academia Communication Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Direct real-time messaging between Jharkhand Higher Education Institutions and Corporate CSR Partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>0ms Cross-Tab Sync Online</span>
          </div>
        </div>
      </div>

      {/* Main Chat Grid (Sidebar 4 cols + Chat 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white min-h-[640px] flex-1">
        {/* Left Sidebar: Threads List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search & Actions */}
          <div className="p-4 space-y-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder="Search channels, PIs, or sectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-100/70 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600">
              {(["ALL", "PILOT", "MARKETPLACE", "ADVISORY"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                    filterType === type ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsNewChannelModalOpen(true)}
                className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>+ Start New Chat</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  clearLocalPitchedThreads();
                  refreshThreads();
                }}
                className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold py-2 px-2.5 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 transition-all cursor-pointer"
                title="Reset discussion channels"
              >
                🗑
              </button>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading channels...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-3">
                <p>No active channels matching search.</p>
                <button
                  type="button"
                  onClick={() => setIsNewChannelModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-bold text-xs cursor-pointer"
                >
                  + Start New Channel
                </button>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                const partnerLabel =
                  userRole === "university"
                    ? thread.companyName || thread.partnerName || "Corporate CSR Partner"
                    : thread.universityName || thread.partnerName || "University Research Lab";
                const partnerRoleLabel =
                  userRole === "university"
                    ? `CSR Sponsor • ${thread.companyName || thread.sector || "Grant"}`
                    : `Lead PI • ${thread.universityName || "University Lab"}`;

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full text-left p-4 transition-all flex gap-3 relative cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 border-l-4 border-indigo-600 shadow-sm"
                        : "hover:bg-slate-100/70"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${thread.avatarBg} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm`}
                    >
                      {partnerLabel.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {partnerLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {thread.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-indigo-700 truncate mt-0.5">
                        {thread.title}
                      </p>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {thread.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50">
                        <span className="text-[10px] font-medium text-slate-400">
                          {partnerRoleLabel}
                        </span>
                        <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                          {thread.type}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Active Discussion Stream (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {activeThread ? (
            <>
              {/* Active Thread Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl ${activeThread.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0`}
                  >
                    {(userRole === "university"
                      ? activeThread.companyName || activeThread.partnerName || "CSR"
                      : activeThread.universityName || activeThread.partnerName || "PI"
                    )
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {activeThread.title}
                      </h2>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                        {activeThread.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {userRole === "university"
                        ? `Corporate Sponsor: ${activeThread.companyName || activeThread.partnerName || "CSR Partner"} • Sector: ${activeThread.sector}`
                        : `Lead PI: ${activeThread.partnerName} (${activeThread.universityName || "University"})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition-all cursor-pointer">
                    Schedule Call
                  </button>
                </div>
              </div>

              {/* Messages Scroll Panel */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30" style={{ minHeight: 0 }}>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium py-16">
                    <span>No messages yet — type a message below to start collaborating.</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.isCurrentUser;
                    const isProposalCard =
                      msg.message.includes("CSR GRANT PROPOSAL") ||
                      msg.message.includes("PROPOSAL PITCH") ||
                      msg.message.includes("PROPOSAL ACCEPTED");

                    if (isProposalCard) {
                      const isAccepted = msg.message.includes("ACCEPTED");
                      return (
                        <div key={msg.id} className="flex justify-center my-3">
                          <div
                            className={`max-w-xl w-full p-4 rounded-2xl border shadow-sm text-xs space-y-2 ${
                              isAccepted
                                ? "bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-700/50"
                                : "bg-gradient-to-br from-indigo-700 to-indigo-900 text-white border-indigo-600"
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <span className="font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                                <span>{isAccepted ? "🤝" : "📋"}</span>
                                <span>{isAccepted ? "CSR Grant Proposal Accepted" : "CSR Grant Proposal Pitch"}</span>
                              </span>
                              <span className="text-[10px] text-indigo-200">{msg.timestamp}</span>
                            </div>
                            <div className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </div>
                            <div className="text-[10px] text-indigo-200 pt-1 border-t border-white/10 flex items-center justify-between">
                              <span>Posted by {msg.senderName}</span>
                              <span className="font-mono">{msg.senderRole}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[11px] font-bold text-slate-700">
                            {msg.senderName}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              msg.senderRole?.includes("FACULTY") || msg.senderRole?.includes("STUDENT")
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {msg.senderRole?.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {msg.timestamp}
                          </span>
                        </div>

                        <div
                          className={`max-w-lg rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed whitespace-pre-wrap ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                          }`}
                        >
                          {msg.message}

                          {msg.attachmentName && (
                            <div
                              className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-xs font-semibold ${
                                isMe ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              <span>📎</span>
                              <span className="truncate">{msg.attachmentName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions Bar */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/70 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick Actions:</span>
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-full transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    + {reply}
                  </button>
                ))}
              </div>

              {/* Message Composer Area */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
                {attachmentName && (
                  <div className="mb-2 p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>📎</span>
                      <span>{attachmentName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachmentName(null)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      rows={2}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        userRole === "university"
                          ? "Type message to Industry Sponsor (Shift+Enter for new line)..."
                          : "Type message to University PI & Team (Shift+Enter for new line)..."
                      }
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white resize-none text-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateAttachment}
                    title="Attach verification file"
                    className="p-3 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>

                  <button
                    type="submit"
                    disabled={isSending || (!inputMessage.trim() && !attachmentName)}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Send</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <p className="text-sm font-bold">Select a collaborative discussion thread to begin messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Start New Channel */}
      {isNewChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">Start Collaborative Discussion</h3>
                <p className="text-xs text-slate-500">Open a live channel with an industry sponsor or university team.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChannelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Project / Innovation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Bio-Sand Filtration Unit"
                  value={newChannelTitle}
                  onChange={(e) => setNewChannelTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {userRole === "university" ? "Target Corporate CSR Partner *" : "Target University / Research Lab *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    userRole === "university"
                      ? "e.g. Tata Steel CSR Foundation / Tanmoys Firm"
                      : "e.g. Birla Institute of Technology, Mesra"
                  }
                  value={newChannelPartner}
                  onChange={(e) => setNewChannelPartner(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Sector / Innovation Domain</label>
                <input
                  type="text"
                  value={newChannelSector}
                  onChange={(e) => setNewChannelSector(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewChannelModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Create &amp; Open Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
