"use client";

import React, { useState } from "react";
import { PilotDocumentType } from "@/modules/industry/types/activePilots";

interface UploadPilotDocumentModalProps {
  pilotId: number;
  pilotTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (pilotId: number, title: string, docType: PilotDocumentType, file: File) => Promise<boolean>;
}

export function UploadPilotDocumentModal({
  pilotId,
  pilotTitle,
  isOpen,
  onClose,
  onUpload,
}: UploadPilotDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [docType, setDocType] = useState<PilotDocumentType>("LAB_REPORT");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const success = await onUpload(pilotId, title.trim(), docType, file);
    setIsUploading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto text-xs">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900">Upload Project Artifact</h2>
          <p className="text-slate-500 text-[11px] mt-0.5 truncate">{pilotTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 font-medium">
          {/* File Picker */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select File (PDF, DOCX, ZIP, XLSX):</label>
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Document Title / Label:</label>
            <input
              type="text"
              required
              placeholder="e.g. Phase 1 Sensor Calibration Log"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Document Classification:</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as PilotDocumentType)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-slate-500 cursor-pointer"
            >
              <option value="PROJECT_PROPOSAL">Project Proposal &amp; WBS</option>
              <option value="MILESTONE_DELIVERABLE">Milestone Deliverable Pack</option>
              <option value="LAB_REPORT">Lab Test / Sensor Calibration Report</option>
              <option value="TESTBED_EVALUATION">Testbed Evaluation Dataset</option>
              <option value="UTILIZATION_CERTIFICATE">Audited Utilization Certificate (UC)</option>
              <option value="MOU_AGREEMENT">Tripartite Agreement / MoU</option>
              <option value="OTHER">Other Research Supporting Artifact</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? "Uploading Artifact..." : "Upload to Vault"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
