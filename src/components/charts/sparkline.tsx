"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function Sparkline({
  data,
  color = "var(--primary)",
  className,
  positive = true,
}: {
  data: number[];
  color?: string;
  className?: string;
  positive?: boolean;
}) {
  const stroke = color === "auto" ? (positive ? "var(--success)" : "var(--destructive)") : color;
  const chartData = data.map((value, i) => ({ i, value }));
  const gradientId = `spark-${stroke.replace(/[^a-z0-9]/gi, "")}-${positive ? "up" : "dn"}`;

  return (
    <div className={cn("h-10 w-full", className)} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { sparkFromTrend } from "./spark-utils";
