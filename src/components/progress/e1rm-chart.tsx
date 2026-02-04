"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { E1RMDataPoint } from "@/types";

// ─── Props ───────────────────────────────────────

interface E1RMChartProps {
  data: E1RMDataPoint[];
}

// ─── Custom tooltip ──────────────────────────────

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: E1RMDataPoint;
  }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const date = new Date(point.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{date}</p>
      <p className="text-sm font-bold tabular-nums text-foreground">
        {point.e1rm}kg <span className="font-normal text-muted-foreground">e1RM</span>
      </p>
      <p className="text-xs text-muted-foreground tabular-nums">
        {point.weight}kg x {point.reps}
      </p>
    </div>
  );
}

// ─── Component ───────────────────────────────────

export function E1RMChart({ data }: E1RMChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      dateLabel: new Date(d.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
    }));
  }, [data]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100];
    const values = data.map((d) => d.e1rm);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.15, 5);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No e1RM data yet. Complete some workouts to track your progress.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(0 0% 20%)"
            opacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val: number) => `${val}kg`}
            width={52}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "#a1a1aa", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Line
            type="monotone"
            dataKey="e1rm"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: "#f97316",
              stroke: "#09090b",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "#f97316",
              stroke: "#09090b",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
