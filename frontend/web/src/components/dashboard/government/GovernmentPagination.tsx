"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "@/components/dashboard/icons";

interface GovernmentPaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export function GovernmentPagination({
  currentPage = 0,
  totalPages = 0,
  pageSize = 10,
  totalElements = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  isLoading = false,
}: GovernmentPaginationProps) {
  const safeTotal = totalElements ?? 0;
  if (safeTotal <= 0) return null;

  const startRecord = safeTotal > 0 ? currentPage * pageSize + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * pageSize, safeTotal);

  // Generate visible page numbers (e.g. 1 2 3 ... 10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0); // First page (Page 1)

      if (currentPage > 2) {
        pages.push("ellipsis-1");
      }

      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("ellipsis-2");
      }

      if (!pages.includes(totalPages - 1)) {
        pages.push(totalPages - 1); // Last page
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-[#d9d9d9] rounded-2xl shadow-xs select-none">
      {/* Left: Range and Record Counter */}
      <div className="flex items-center gap-3 text-xs text-[#4a4a4a] w-full sm:w-auto justify-between sm:justify-start">
        <div>
          Showing <strong className="text-[#1a0e3d] font-mono">{startRecord}</strong> to{" "}
          <strong className="text-[#1a0e3d] font-mono">{endRecord}</strong> of{" "}
          <strong className="text-[#1a0e3d] font-mono">{safeTotal.toLocaleString()}</strong> entries
        </div>

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#d9d9d9]">
            <span className="text-[11px] text-[#64748b]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="px-2 py-1 bg-[#F2efff] border border-[#dcd3ff] rounded-lg text-xs font-bold text-[#1a0e3d] outline-none cursor-pointer hover:border-[#1a0e3d] transition-colors"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0 || isLoading}
          className="p-1.5 rounded-lg border border-[#d9d9d9] bg-white hover:bg-[#F2efff] text-[#1a0e3d] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0 || isLoading}
          className="p-1.5 px-2 rounded-lg border border-[#d9d9d9] bg-white hover:bg-[#F2efff] text-xs font-bold text-[#1a0e3d] flex items-center gap-1 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Prev</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span key={`${p}-${idx}`} className="px-1.5 text-xs text-[#64748b] font-mono">
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className={`min-w-[30px] h-[30px] text-xs font-bold rounded-lg transition-all cursor-pointer font-mono ${
                  isActive
                    ? "bg-[#1a0e3d] text-white shadow-xs"
                    : "bg-white hover:bg-[#F2efff] text-[#4a4a4a] hover:text-[#1a0e3d] border border-[#d9d9d9]"
                }`}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="p-1.5 px-2 rounded-lg border border-[#d9d9d9] bg-white hover:bg-[#F2efff] text-xs font-bold text-[#1a0e3d] flex items-center gap-1 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="p-1.5 rounded-lg border border-[#d9d9d9] bg-white hover:bg-[#F2efff] text-[#1a0e3d] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
