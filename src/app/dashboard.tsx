"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Debt, CreateDebtInput } from "@/lib/types/debt";
import { Navbar } from "@/components/Navbar";
import { SummaryCards } from "@/components/SummaryCard";
import { FilterBar } from "@/components/FilterBar";
import { DebtCard } from "@/components/DebtCard";
import { DebtForm } from "@/components/DebtForm";
import { Loader2, Inbox, List, Users } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DebtChart } from "@/components/DebtChart";

export default function DashboardPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isGrouped, setIsGrouped] = useState(false);

  const onToggleGroup = () => {
    setIsGrouped(!isGrouped);
  }

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

  const sortedDebts = [...filteredDebts].sort((a, b) => {
    if (dateFilter === "newest")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (dateFilter === "oldest")
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (dateFilter === "amount_high") return b.amount - a.amount;
    if (dateFilter === "amount_low") return a.amount - b.amount;
    return 0;
  });

  const groupedDebts = useMemo(() => {
    const groups: Record<string, { name: string; totalAmount: number; items: Debt[] }> = {};

    sortedDebts.forEach((debt) => {
      const key = debt.counterpart_name.trim().toLowerCase();
      if (!groups[key]) {
        groups[key] = {
          name: debt.counterpart_name,
          totalAmount: 0,
          items: [],
        };
      }
      groups[key].items.push(debt);
      if (!debt.settled_at) {
        groups[key].totalAmount += debt.type === "owed_to_me" ? debt.amount : -debt.amount;
      }
    });

    return Object.values(groups);
  }, [sortedDebts]);

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

  <div className="mt-6">
    <DebtChart totalOwedToMe={totalOwedToMe} totalIOwe={totalIOwe} />
  </div>

  <div className="mt-8">
    <FilterBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      dateFilter={dateFilter}
      onDateChange={setDateFilter}
      statusFilter={statusFilter}
      onStatusChange={setStatusFilter}
      typeFilter={typeFilter}
      onTypeChange={setTypeFilter}
      onOpenAddModal={() => {
        setEditingDebt(null);
        setIsModalOpen(true);
      }}
      isGrouped={isGrouped}
      onToggleGroup={onToggleGroup}
    />
  </div>

        <div className="mt-6 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-12 w-12 animate-spin" />
              <span className="ml-2 text-xl font-medium">Memuat Data...</span>
            </div>
          ) : sortedDebts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-200 py-12 text-center">
              <Inbox className="h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-500">
                Belum ada catatan kasbon
              </p>
              <p className="text-xs text-slate-500">
                Klik "+ Catatan Baru" untuk membuat catatan.
              </p>
            </div>
            ) : isGrouped ? (
            groupedDebts.map((group) => (
              <div
                key={group.name}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-700">{group.name}</h3>
                  <span className="text-sm text-slate-400">
                    {group.items.length} entry, total Rp{" "}
                    {group.totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.items.map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      isGrouped={true}
                      onToggleStatus={() => handleRequestToggleStatus(debt)}
                      onDelete={() => handleRequestDelete(debt)}
                      onEdit={() => {
                        setEditingDebt(debt);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            sortedDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onToggleStatus={() => handleRequestToggleStatus(debt)}
                onDelete={() => handleRequestDelete(debt)}
                onEdit={() => {
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
