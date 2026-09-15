"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCommunication } from "@/modules/communication/hooks/useCommunication";
import { clearLocalPitchedThreads } from "@/modules/communication/services/communicationApi";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages update
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
            <span>API Gateway Live Messaging Protocol</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {userRole === "university"
              ? "University-Industry Collaboration Workspace"
              : "Industry-Academia Communication Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Direct thread communications between Jharkhand Higher Education Institutions and Corporate CSR Partners.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>Gateway Node: <strong>http://localhost:8080/api</strong></span>
        </div>
      </div>

      {/* Main Split Chat Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        {/* Left Sidebar: Threads List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search & Filter Header */}
          <div className="p-4 space-y-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder="Search threads, PIs, or sectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <svg
                className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg text-[11px] font-semibold">
              {(["ALL", "PILOT", "MARKETPLACE", "ADVISORY"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-1 rounded-md transition-all ${
                    filterType === type
                      ? "bg-white text-indigo-600 shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Clear stale chats button */}
            <button
              type="button"
              onClick={() => {
                clearLocalPitchedThreads();
                refreshThreads();
              }}
              className="w-full text-[10px] text-rose-500 hover:text-rose-700 font-semibold py-1 rounded border border-rose-200 hover:border-rose-400 bg-rose-50 hover:bg-rose-100 transition-all"
            >
              🗑 Clear Old / Stale Chats
            </button>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading communication channels...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No matching threads found.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                const partnerLabel =
                  userRole === "university"
                    ? thread.companyName || "Corporate CSR Sponsor"
                    : thread.partnerName;
                const partnerRoleLabel =
                  userRole === "university"
                    ? `CSR Partner • ${thread.sector}`
                    : thread.partnerRole;

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full text-left p-4 transition-all flex gap-3 relative ${
                      isSelected
                        ? "bg-indigo-50/70 border-l-4 border-indigo-600"
                        : "hover:bg-slate-100/60"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${thread.avatarBg} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}
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
                        {thread.unreadCount > 0 && (
                          <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {thread.unreadCount}
                          </span>
                        )}
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
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl ${activeThread.avatarBg} text-white flex items-center justify-center font-black text-base shadow-sm shrink-0`}
                  >
                    {(userRole === "university"
                      ? activeThread.companyName || "CSR"
                      : activeThread.partnerName
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
                        ? `Sponsor: ${activeThread.companyName || "CSR Partner"} • Sector: ${activeThread.sector}`
                        : `Lead PI: ${activeThread.partnerName} (${activeThread.universityName || "University"})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition-all">
                    Schedule Call
                  </button>
                </div>
              </div>

              {/* Messages Scroll Panel */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/20" style={{ minHeight: 0 }}>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                    <span>No messages yet — send the first message to start the conversation.</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                  const isMe = msg.isCurrentUser;
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
                            msg.senderRole === "FACULTY_PI"
                              ? "bg-purple-100 text-purple-700"
                              : msg.senderRole === "INDUSTRY_SPOC"
                              ? "bg-blue-100 text-blue-700"
                              : msg.senderRole === "STUDENT_LEAD"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {msg.senderRole.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {msg.timestamp}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                            : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>

                        {/* Attachment Card */}
                        {msg.attachmentName && (
                          <div
                            className={`mt-2.5 p-2.5 rounded-xl flex items-center gap-3 ${
                              isMe ? "bg-indigo-700/60 border border-indigo-500/50" : "bg-slate-100 border border-slate-200"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                              DOC
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${isMe ? "text-white" : "text-slate-900"}`}>
                                {msg.attachmentName}
                              </p>
                              {msg.attachmentSize && (
                                <p className={`text-[10px] ${isMe ? "text-indigo-200" : "text-slate-500"}`}>
                                  {msg.attachmentSize}
                                </p>
                              )}
                            </div>
                            <button
                              className={`text-[11px] font-bold underline px-2 py-1 ${
                                isMe ? "text-indigo-100 hover:text-white" : "text-indigo-600 hover:text-indigo-800"
                              }`}
                            >
                              Download
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
                )}
                {/* Scroll anchor for auto-scroll to bottom */}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 self-center shrink-0">
                  Quick Actions:
                </span>
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(reply)}
                    className="text-[11px] bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-slate-200 shrink-0 transition-all shadow-2xs"
                  >
                    + {reply}
                  </button>
                ))}
              </div>

              {/* Message Composer Footer */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 space-y-3">
                {attachmentName && (
                  <div className="flex items-center justify-between bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-semibold">
                    <span className="truncate">Attached: {attachmentName}</span>
                    <button
                      type="button"
                      onClick={() => setAttachmentName(null)}
                      className="text-indigo-900 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                    <textarea
                      rows={2}
                      placeholder={
                        userRole === "university"
                          ? "Type message to Industry Sponsor (Shift+Enter for new line)..."
                          : "Type message to University PI & Team (Shift+Enter for new line)..."
                      }
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full p-3 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateAttachment}
                      title="Attach Document"
                      className="p-3 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                    </button>

                    <button
                      type="submit"
                      disabled={isSending || (!inputMessage.trim() && !attachmentName)}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <span>Send</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <p className="text-sm font-semibold">Select a discussion channel to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
