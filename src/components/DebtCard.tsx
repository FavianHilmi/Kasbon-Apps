"use client";

import { Debt } from "@/lib/types/debt";
import { formatRupiah, formatRelativeTime } from "@/lib/utils/format";
import {
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
} from "lucide-react";

interface DebtCardProps {
  debt: Debt;
  onToggleStatus: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

export function DebtCard({
  debt,
  onToggleStatus,
  onEdit,
  onDelete,
}: DebtCardProps) {
  const isSettled = debt.settled_at !== null;
  const isOwedToMe = debt.type === "owed_to_me";

  return (
    <div
      className={`relative flex flex-col justify-between gap-4 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center ${
        isSettled
          ? "border-slate-200 bg-slate-50/50 opacity-75"
          : "border-slate-200 bg-white shadow-xs"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon Tipe */}
        <div
          className={`mt-0.5 rounded-xl p-2.5 ${
            isOwedToMe
              ? "text-emerald-600"
              : "text-rose-600"
          }`}
        >
          {isOwedToMe ? (
            <ArrowDownLeft className="h-4 w-4" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-600">{debt.counterpart_name}</h3>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {isOwedToMe ? "Dihutang ke saya" : "Saya hutang"} •{" "}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 inline" />
              {formatRelativeTime(debt.created_at)}
            </span>
          </p>

          {debt.note && (
            <p className="mt-2 text-sm text-gray-600 italic">"{debt.note}"</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
        <span
          className={`rounded-sm px-2 py-0.5 text-xs ${
            isSettled
              ? "bg-gray-400 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          {isSettled ? "Lunas" : "Belum Lunas"}
        </span>
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
          {/* Nominal */}
          <div className="text-left sm:text-right">
            <p className="text-lg font-bold text-gray-600">
              {formatRupiah(debt.amount)}
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleStatus(debt)}
              title={isSettled ? "Tandai Belum Lunas" : "Tandai Lunas"}
              className={`rounded-xl p-2 transition-colors ${
                isSettled
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => onEdit(debt)}
              title="Edit"
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <Edit2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => onDelete(debt.id)}
              title="Hapus"
              className="rounded-xl p-2 text-rose-500 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
