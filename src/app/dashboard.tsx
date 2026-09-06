"use client";

import { useState, useEffect, useCallback } from "react";
import { Debt, CreateDebtInput } from "@/lib/types/debt";
import { Navbar } from "@/components/Navbar";
import { SummaryCards } from "@/components/SummaryCard";
import { FilterBar } from "@/components/FilterBar";
import { DebtCard } from "@/components/DebtCard";
import { DebtForm } from "@/components/DebtForm";
import { Loader2, Inbox } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function DashboardPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const supabase = createClient();

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: "toggle_status" | "delete" | null;
    selectedDebt: Debt | null;
    loading: boolean;
  }>({
    isOpen: false,
    type: null,
    selectedDebt: null,
    loading: false,
  });

  const handleRequestToggleStatus = (debt: Debt) => {
    setConfirmState({
      isOpen: true,
      type: "toggle_status",
      selectedDebt: debt,
      loading: false,
    });
  };

  const handleRequestDelete = (debt: Debt) => {
    setConfirmState({
      isOpen: true,
      type: "delete",
      selectedDebt: debt,
      loading: false,
    });
  };

  const handleConfirm = async () => {
    const { type, selectedDebt } = confirmState;
    if (!type || !selectedDebt) return;

    setConfirmState((prev) => ({ ...prev, loading: true }));

    try {
      if (type === "toggle_status") {
        const isSettled = selectedDebt.settled_at !== null;
        await fetch(`/api/debts/${selectedDebt.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_settled: !isSettled }),
        });
      } else if (type === "delete") {
        await fetch(`/api/debts/${selectedDebt.id}`, {
          method: "DELETE",
        });
      }

      fetchDebts();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmState({
        isOpen: false,
        type: null,
        selectedDebt: null,
        loading: false,
      });
    }
  };

  // Fetch User Email
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, [supabase]);

  // Fetch Debts Data
  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: statusFilter,
        type: typeFilter,
      });

      const res = await fetch(`/api/debts?${queryParams.toString()}`);
      const json = await res.json();

      if (res.ok) {
        setDebts(json.data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const totalOwedToMe = debts
    .filter((d) => d.type === "owed_to_me" && !d.settled_at)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalIOwe = debts
    .filter((d) => d.type === "i_owe" && !d.settled_at)
    .reduce((sum, d) => sum + d.amount, 0);

  const filteredDebts = debts.filter((d) =>
    d.counterpart_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggleStatus = async (debt: Debt) => {
    const isSettled = debt.settled_at !== null;
    try {
      const res = await fetch(`/api/debts/${debt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_settled: !isSettled }),
      });

      if (res.ok) fetchDebts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;
    try {
      const res = await fetch(`/api/debts/${id}`, { method: "DELETE" });
      if (res.ok) fetchDebts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (data: CreateDebtInput) => {
    if (editingDebt) {
      const res = await fetch(`/api/debts/${editingDebt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal mengupdate data.");
    } else {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan catatan baru.");
    }
    fetchDebts();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userEmail={userEmail} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <SummaryCards totalOwedToMe={totalOwedToMe} totalIOwe={totalIOwe} />

        <div className="mt-8">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            onOpenAddModal={() => {
              setEditingDebt(null);
              setIsModalOpen(true);
            }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-xs font-medium">Loading...</span>
            </div>
          ) : filteredDebts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-200 py-12 text-center">
              <Inbox className="h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-500">
                Belum ada catatan kasbon
              </p>
              <p className="text-xs text-slate-500">
                Klik "+ Catatan Baru" untuk membuat catatan.
              </p>
            </div>
          ) : (
            filteredDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onToggleStatus={() => handleRequestToggleStatus(debt)}
                onDelete={() => handleRequestDelete(debt)}
                onEdit={(handleEdit) => {
                  setEditingDebt(debt);
                  setIsModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      </main>

      <DebtForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDebt}
      />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        loading={confirmState.loading}
        title={
          confirmState.type === "delete"
            ? "Hapus Catatan Kasbon?"
            : confirmState.selectedDebt?.settled_at
              ? "Tandai Belum Lunas?"
              : "Tandai Sudah Lunas?"
        }
        message={
          confirmState.type === "delete"
            ? `Catatan transaksi atas nama "${confirmState.selectedDebt?.counterpart_name}" akan dihapus permanen.`
            : `Status transaksi atas nama "${confirmState.selectedDebt?.counterpart_name}" akan diperbarui.`
        }
        confirmText={
          confirmState.type === "delete" ? "Ya, Hapus" : "Ya, Ubah Status"
        }
        variant={confirmState.type === "delete" ? "danger" : "default"}
        onCancel={() =>
          setConfirmState({
            isOpen: false,
            type: null,
            selectedDebt: null,
            loading: false,
          })
        }
        onConfirm={handleConfirm}
      />
    </div>
  );
}
