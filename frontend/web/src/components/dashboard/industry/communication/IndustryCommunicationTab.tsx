"use client";

import React, { useState } from "react";

interface ThreadItem {
  id: number;
  title: string;
  partnerName: string;
  partnerRole: string;
  sector: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  type: "PILOT" | "MARKETPLACE" | "ADVISORY";
  avatarBg: string;
}

interface MessageItem {
  id: number;
  senderName: string;
  senderRole: "FACULTY_PI" | "INDUSTRY_SPOC" | "STUDENT_LEAD" | "TECH_MENTOR" | "SYSTEM";
  message: string;
  timestamp: string;
  attachmentName?: string;
  attachmentSize?: string;
  isCurrentUser?: boolean;
}

export function IndustryCommunicationTab() {
  const [threads] = useState<ThreadItem[]>([
    {
      id: 1,
      title: "Smart Solar-Powered Water Purification Mesh",
      partnerName: "Dr. A. K. Verma",
      partnerRole: "Lead PI • BIT Mesra",
      sector: "Water & Sanitation",
      lastMessage: "Bench test telemetry data for Ranchi rural pilot has been uploaded to the document vault.",
      timestamp: "10:45 AM",
      unreadCount: 2,
      type: "PILOT",
      avatarBg: "bg-indigo-600",
    },
    {
      id: 2,
      title: "AI-Driven Crop Disease Tele-Diagnostic Suite",
      partnerName: "Prof. S. Sengupta",
      partnerRole: "Lead PI • NIT Jamshedpur",
      sector: "Agriculture & Agritech",
      lastMessage: "Revised IP revenue sharing split terms agreed by Academic Review Committee (60-40).",
      timestamp: "Yesterday",
      unreadCount: 0,
      type: "PILOT",
      avatarBg: "bg-emerald-600",
    },
    {
      id: 3,
      title: "Off-Grid Solar Cold Storage System",
      partnerName: "R. Soren & Team",
      partnerRole: "Student Lead • IIT ISM Dhanbad",
      sector: "Clean Energy",
      lastMessage: "Seeking corporate mentorship on inverter component supply chain optimization.",
      timestamp: "2 days ago",
      unreadCount: 1,
      type: "MARKETPLACE",
      avatarBg: "bg-amber-600",
    },
    {
      id: 4,
      title: "IoT Air Quality & Mine Embankment Monitor",
      partnerName: "Dr. Priya Roy",
      partnerRole: "Faculty PI • BIT Sindri",
      sector: "Environmental Safety",
      lastMessage: "Tranche 2 disbursement received. Ordering LoRaWAN field sensors today.",
      timestamp: "Mar 08",
      unreadCount: 0,
      type: "PILOT",
      avatarBg: "bg-purple-600",
    },
  ]);

  const [selectedThreadId, setSelectedThreadId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"ALL" | "PILOT" | "MARKETPLACE">("ALL");

  const [messages, setMessages] = useState<Record<number, MessageItem[]>>({
    1: [
      {
        id: 101,
        senderName: "Dr. A. K. Verma",
        senderRole: "FACULTY_PI",
        message: "Good morning team! We completed 100-hour continuous filtration bench testing at the BIT Mesra Clean Water Lab.",
        timestamp: "09:30 AM",
      },
      {
        id: 102,
        senderName: "Vikram Malhotra (You)",
        senderRole: "INDUSTRY_SPOC",
        message: "Excellent progress Dr. Verma. Could you confirm if the TDS reduction rate consistently met the 95% threshold under high turbid water samples?",
        timestamp: "09:45 AM",
        isCurrentUser: true,
      },
      {
        id: 103,
        senderName: "Dr. A. K. Verma",
        senderRole: "FACULTY_PI",
        message: "Yes! TDS averaged 42 ppm starting from 850 ppm raw input water. I've attached the full telemetry logs and QA certificate.",
        timestamp: "10:45 AM",
        attachmentName: "BIT_Mesra_TDS_Telemetry_Report_v2.pdf",
        attachmentSize: "3.2 MB",
      },
    ],
    2: [
      {
        id: 201,
        senderName: "Prof. S. Sengupta",
        senderRole: "FACULTY_PI",
        message: "The NIT Jamshedpur Legal Counsel has approved the Tripartite Agreement draft with 60% Industry / 40% University IP split.",
        timestamp: "Yesterday 04:15 PM",
      },
      {
        id: 202,
        senderName: "Vikram Malhotra (You)",
        senderRole: "INDUSTRY_SPOC",
        message: "Great news! Our CSR board will review and execute the final countersignature tomorrow.",
        timestamp: "Yesterday 05:00 PM",
        isCurrentUser: true,
      },
    ],
    3: [
      {
        id: 301,
        senderName: "R. Soren",
        senderRole: "STUDENT_LEAD",
        message: "Hello! We are preparing the battery thermal management module. Would your electrical engineering team have 30 mins for a technical review this week?",
        timestamp: "2 days ago",
      },
    ],
    4: [
      {
        id: 401,
        senderName: "Dr. Priya Roy",
        senderRole: "FACULTY_PI",
        message: "Tranche 2 disbursement received. Ordering LoRaWAN field sensors today. Will share invoice in document vault.",
        timestamp: "Mar 08 11:20 AM",
      },
    ],
  });

  const [inputMessage, setInputMessage] = useState<string>("");

  const currentThread = threads.find((t) => t.id === selectedThreadId) || threads[0];
  const currentMessages = messages[selectedThreadId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: MessageItem = {
      id: Date.now(),
      senderName: "Vikram Malhotra (You)",
      senderRole: "INDUSTRY_SPOC",
      message: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isCurrentUser: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedThreadId]: [...(prev[selectedThreadId] || []), newMessage],
    }));

    setInputMessage("");
  };

  const filteredThreads = threads.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "ALL" || t.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">
              Secure Collaboration Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">Industry-Academia Communication Workspace</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Direct channels with Academic PIs, Student Innovators, and State Testbed Coordinators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert("Launching Secure Virtual Meeting Room...")}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Start Virtual Sync</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        {/* Left Sidebar: Threads List (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col overflow-hidden text-xs">
          {/* Sidebar Search & Filters */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search project channels or PIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 transition-colors"
              />
              <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex gap-1">
              {(["ALL", "PILOT", "MARKETPLACE"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                    filterType === type
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {type === "ALL" ? "All Channels" : type === "PILOT" ? "Co-Funded Pilots" : "Marketplace"}
                </button>
              ))}
            </div>
          </div>

          {/* Threads Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No communication channels found.</div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/70 border-l-4 border-indigo-600"
                        : "hover:bg-slate-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${thread.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                      {thread.partnerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-slate-900 truncate text-xs">{thread.partnerName}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{thread.timestamp}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 block truncate">{thread.title}</span>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{thread.lastMessage}</p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white font-bold rounded-full text-[9px] shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Active Channel Workspace (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col overflow-hidden text-xs">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl ${currentThread.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                {currentThread.partnerName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-slate-900 text-sm truncate">{currentThread.title}</h3>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                    {currentThread.sector}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                  {currentThread.partnerName} • {currentThread.partnerRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => alert(`Calling ${currentThread.partnerName} via encrypted WebRTC stream...`)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Audio Call"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                    msg.isCurrentUser ? "bg-slate-900" : currentThread.avatarBg
                  }`}
                >
                  {msg.senderName.substring(0, 1).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center gap-2 ${msg.isCurrentUser ? "justify-end" : ""}`}>
                    <span className="font-bold text-slate-900 text-[11px]">{msg.senderName}</span>
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      msg.isCurrentUser
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.message}</p>

                    {msg.attachmentName && (
                      <div className={`mt-2.5 p-2 rounded-lg flex items-center justify-between gap-3 ${
                        msg.isCurrentUser ? "bg-indigo-700/60 text-white" : "bg-slate-50 border border-slate-200 text-slate-800"
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <svg className="w-4 h-4 text-indigo-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <div className="truncate">
                            <strong className="block text-[11px] truncate">{msg.attachmentName}</strong>
                            <span className="text-[9px] opacity-75">{msg.attachmentSize}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Downloading attachment: ${msg.attachmentName}`)}
                          className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reply Suggestions Bar */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto select-none">
            <span className="text-[10px] text-slate-400 font-bold shrink-0">Quick Reply:</span>
            {[
              "Approved milestone deliverable",
              "Tranche disbursement issued",
              "Scheduled technical sync",
              "Please upload telemetry data",
            ].map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputMessage(text)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <label className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer" title="Attach file">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    alert(`Attached file: ${file.name}`);
                  }
                }}
              />
            </label>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${currentThread.partnerName}...`}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
