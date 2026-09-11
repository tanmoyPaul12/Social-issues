"use client";

import React from "react";
import { create } from "zustand";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (messageOrTitle: string, description?: string) =>
    useToastStore.getState().addToast({
      type: "success",
      title: description ? messageOrTitle : undefined,
      message: description || messageOrTitle,
    }),
  error: (messageOrTitle: string, description?: string) =>
    useToastStore.getState().addToast({
      type: "error",
      title: description ? messageOrTitle : undefined,
      message: description || messageOrTitle,
    }),
  info: (messageOrTitle: string, description?: string) =>
    useToastStore.getState().addToast({
      type: "info",
      title: description ? messageOrTitle : undefined,
      message: description || messageOrTitle,
    }),
  warning: (messageOrTitle: string, description?: string) =>
    useToastStore.getState().addToast({
      type: "warning",
      title: description ? messageOrTitle : undefined,
      message: description || messageOrTitle,
    }),
};

export function ToastStack() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto">
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        const isWarning = t.type === "warning";

        return (
          <div
            key={t.id}
            className="bg-white border border-slate-200 shadow-xl rounded-md p-3.5 flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-start gap-2.5">
              {isSuccess && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {isError && (
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs mt-0.5">
                  !
                </div>
              )}
              {isWarning && (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs mt-0.5">
                  !
                </div>
              )}
              {!isSuccess && !isError && !isWarning && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <div className="flex flex-col">
                {t.title && <span className="text-xs font-bold text-slate-900 leading-tight">{t.title}</span>}
                <span className="text-xs font-semibold text-slate-800 leading-snug">{t.message}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
