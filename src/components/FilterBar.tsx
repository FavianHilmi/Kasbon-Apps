"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, Users, List } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  onOpenAddModal: () => void;
  isGrouped: boolean;
  onToggleGroup: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onOpenAddModal,
  isGrouped,
  onToggleGroup,
}: FilterBarProps) {
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama orang..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="flex-1 min-w-27.5 sm:flex-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none hover:cursor-pointer sm:text-sm"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="amount_high">Tertinggi</option>
          <option value="amount_low">Terendah</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="flex-1 min-w-27.5 sm:flex-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none hover:cursor-pointer sm:text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Belum Lunas</option>
          <option value="settled">Lunas</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="flex-1 min-w-27.5 sm:flex-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none hover:cursor-pointer sm:text-sm"
        >
          <option value="all">Semua Tipe</option>
          <option value="owed_to_me">Dihutang ke Saya</option>
          <option value="i_owe">Saya Hutang</option>
        </select>

        <button
          type="button"
          onClick={onToggleGroup}
          title={isGrouped ? "Mode List" : "Mode Group"}
          className={`flex items-center justify-center rounded-xl border p-2 transition-colors hover:cursor-pointer ${
            isGrouped
              ? "border-sky-500 bg-sky-50 text-sky-600"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          {isGrouped ? <List className="h-4 w-4" /> : <Users className="h-4 w-4" />}
        </button>

        <button
          onClick={onOpenAddModal}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95 hover:cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Catatan Baru</span>
        </button>
      </div>
    </div>
  );
}