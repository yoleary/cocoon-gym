"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { VolumeDataPoint } from "@/types";

// ─── Props ───────────────────────────────────────

interface VolumeChartProps {
  data: VolumeDataPoint[];
}

// ─── Custom tooltip ──────────────────────────────

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: VolumeDataPoint & { weekLabel: string };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const weekStart = new Date(point.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">Week of {weekStart}</p>
      <p className="text-sm font-bold tabular-nums text-foreground">
        {point.volume.toLocaleString()}kg
      </p>
      {point.label && (
        <p className="text-xs text-muted-foreground">{point.label}</p>
      )}
    </div>
  );
}

// ─── Custom bar label ────────────────────────────

function BarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}) {
  const { x = 0, y = 0, width = 0, value } = props;
  if (!value) return null;

  const formatted =
    value >= 10000
      ? `${(value / 1000).toFixed(0)}k`
      : value >= 1000
        ? `${(value / 1000).toFixed(1)}k`
        : String(value);

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#a1a1aa"
      textAnchor="middle"
      fontSize={10}
      fontFamily="var(--font-sans)"
    >
      {formatted}
    </text>
  );
}

// ─── Component ───────────────────────────────────

export function VolumeChart({ data }: VolumeChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      weekLabel: new Date(d.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No volume data yet. Complete some workouts to track your weekly volume.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 8, left: -12, bottom: 0 }}
        >
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val: number) =>
              val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val)
            }
            width={40}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "hsl(0 0% 100% / 0.04)" }}
          />
          <Bar
            dataKey="volume"
            radius={[4, 4, 0, 0]}
            label={<BarLabel />}
            maxBarSize={48}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill="#f97316"
                className="transition-opacity duration-150 hover:opacity-100"
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
