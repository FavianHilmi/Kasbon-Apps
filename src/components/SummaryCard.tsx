import { formatRupiah } from '@/lib/utils/format';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  totalOwedToMe: number;
  totalIOwe: number;
}

export function SummaryCards({ totalOwedToMe, totalIOwe }: SummaryCardsProps) {
  const net = totalOwedToMe - totalIOwe;

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [scrollbar-none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
      
      {/* Card 1: Dihutang ke Saya */}
      <div className="w-[80%] min-w-60 shrink-0 snap-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all sm:w-auto sm:min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Dihutang ke Saya
          </span>
          <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
          {formatRupiah(totalOwedToMe)}
        </p>
      </div>

      {/* Card 2: Saya Hutang */}
      <div className="w-[80%] min-w-60 shrink-0 snap-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all sm:w-auto sm:min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Saya Hutang
          </span>
          <div className="rounded-full bg-rose-100 p-2 text-rose-600">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
          {formatRupiah(totalIOwe)}
        </p>
      </div>

      {/* Card 3: NET (Selisih) */}
      <div className="w-[80%] min-w-60 shrink-0 snap-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all sm:w-auto sm:min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            NET (Selisih)
          </span>
          <div className="rounded-full bg-sky-100 p-2 text-sky-600">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <p
          className={`mt-3 text-2xl font-bold tracking-tight ${
            net >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {formatRupiah(net)}
        </p>
      </div>

    </div>
  );
}