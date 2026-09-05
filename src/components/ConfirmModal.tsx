"use client";

import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <h3 className="mt-4 text-base font-bold text-sky-800">{title}</h3>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex w-1/2 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm text-white transition-all disabled:opacity-50 ${
              variant === "danger"
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
