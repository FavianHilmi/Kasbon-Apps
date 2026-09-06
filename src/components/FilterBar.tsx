"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  onOpenAddModal: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onOpenAddModal,
}: FilterBarProps) {
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-800" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama orang..."
          className="w-full rounded-xl border border-gray-400 bg-white py-2 pl-9 pr-4 text-sm font-medium placeholder-gray-700 transition-all  focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Dropdown Status */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-gray-400 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all focus:ring-1 focus:ring-slate-400 focus:outline-none hover:cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Belum Lunas</option>
          <option value="settled">Lunas</option>
        </select>

        {/* Dropdown Tipe */}
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-xl border border-gray-400 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all focus:ring-1 focus:ring-slate-400 focus:outline-none hover:cursor-pointer"
        >
          <option value="all">Semua Tipe</option>
          <option value="owed_to_me">Dihutang ke Saya</option>
          <option value="i_owe">Saya Hutang</option>
        </select>

        {/* Tombol Catat Baru */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-sm hover:cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Catatan Baru</span>
        </button>
      </div>
    </div>
  );
}
