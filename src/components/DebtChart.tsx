"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatRupiah } from "@/lib/utils/format";

interface DebtChartProps {
  totalOwedToMe: number;
  totalIOwe: number;
}

export function DebtChart({ totalOwedToMe, totalIOwe }: DebtChartProps) {
  const data = [
    { name: "Dihutang ke Saya", amount: totalOwedToMe, fill: "#10b981" },
    { name: "Saya Hutang", amount: totalIOwe, fill: "#f43f5e" },
  ];

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const item = data.find((d) => d.name === payload.value);

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-10}
          y={-6}
          textAnchor="end"
          fill="#475569"
          className="text-xs font-medium"
        >
          {payload.value}
        </text>
        <text
          x={-10}
          y={10}
          textAnchor="end"
          fill="#0f172a"
          className="text-xs font-bold"
        >
          {item ? formatRupiah(item.amount) : "Rp 0"}
        </text>
      </g>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <h3 className="mb-2 text-md font-semibold text-slate-400">
        Perbandingan Nominal
      </h3>
      <div className="h-26 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tickLine={false}
              axisLine={false}
              tick={<CustomYAxisTick />}
            />
            <Tooltip
                formatter={(value) => [formatRupiah(Number(value) || 0), "Jumlah"]}
                cursor={{ fill: "transparent" }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}