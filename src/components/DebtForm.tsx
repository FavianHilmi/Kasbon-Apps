"use client";

import { useState, useEffect } from "react";
import { Debt, CreateDebtInput } from "@/lib/types/debt";
import { X, Loader2 } from "lucide-react";

interface DebtFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDebtInput) => Promise<void>;
  initialData?: Debt | null;
}

export function DebtForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DebtFormProps) {
  const [type, setType] = useState<"owed_to_me" | "i_owe">("owed_to_me");
  const [counterpartName, setCounterpartName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setCounterpartName(initialData.counterpart_name);
      setAmount(initialData.amount.toString());
      setDueDate(initialData.due_date || "");
      setNote(initialData.note || "");
    } else {
      setType("owed_to_me");
      setCounterpartName("");
      setAmount("");
      setDueDate("");
      setNote("");
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const numAmount = Number(amount);
    if (!counterpartName.trim()) {
      setErrorMsg("Nama orang wajib diisi.");
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Jumlah nominal harus lebih dari 0.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        type,
        counterpart_name: counterpartName.trim(),
        amount: numAmount,
        due_date: dueDate && dueDate.trim() !== "" ? dueDate : null,
        note: note && note.trim() !== "" ? note.trim() : null,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-400 pb-4">
          <h2 className="font-bold text-dark">
            {initialData ? "Edit Catatan Kasbon" : "Catat Kasbon Baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex cursor-pointer items-center justify-center rounded-xl border p-3 text-sm transition-all ${
                type === "owed_to_me"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-gray-400"
              }`}
            >
              <input
                type="radio"
                name="type"
                value="owed_to_me"
                checked={type === "owed_to_me"}
                onChange={() => setType("owed_to_me")}
                className="sr-only"
              />
              Saya Dihutang
            </label>

            <label
              className={`flex cursor-pointer items-center justify-center rounded-xl border p-3 text-sm transition-all ${
                type === "i_owe"
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-slate-200 text-gray-400 "
              }`}
            >
              <input
                type="radio"
                name="type"
                value="i_owe"
                checked={type === "i_owe"}
                onChange={() => setType("i_owe")}
                className="sr-only"
              />
              Saya Hutang
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Nama Orang *
            </label>
            <input
              type="text"
              required
              value={counterpartName}
              onChange={(e) => setCounterpartName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Jumlah Nominal (Rp) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Tenggat Waktu / Due Date (Opsional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Catatan (Max 200 karakter)
            </label>
            <textarea
              maxLength={200}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{initialData ? "Simpan Perubahan" : "Tambah Catatan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
