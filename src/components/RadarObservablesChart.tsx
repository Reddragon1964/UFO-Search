import React, { useState } from "react";
import { YouTubeFinding } from "../types";

interface RadarObservablesChartProps {
  activeFinding: YouTubeFinding;
  allFindings: YouTubeFinding[];
  onSelectFinding: (finding: YouTubeFinding) => void;
}

const AXES = [
  { key: "positiveLift", label: "POSITIVE LIFT", short: "LIFT" },
  { key: "instantaneousAcceleration", label: "INSTANT ACCEL", short: "ACCEL" },
  { key: "hypersonicVelocity", label: "HYPERSONIC VEL", short: "MACH+" },
  { key: "transmediumTravel", label: "TRANSMEDIUM", short: "MEDIUM" },
  { key: "lowObservability", label: "LOW OBSERVABILITY", short: "STEALTH" },
] as const;

export const RadarObservablesChart: React.FC<RadarObservablesChartProps> = ({
  activeFinding,
  allFindings,
  onSelectFinding,
}) => {
  const [hoveredCoord, setHoveredCoord] = useState<{
    x: number;
    y: number;
    title: string;
  } | null>(null);

  const size = 280;
  const center = size / 2;
  const radius = 96;

  // Compute aggregate average across all scanned findings for comparison
  const avgObservables = AXES.reduce(
    (acc, axis) => {
      const sum = allFindings.reduce(
        (s, f) => s + (f.observables?.[axis.key] ?? 50),
        0
      );
      acc[axis.key] = allFindings.length
        ? Math.round(sum / allFindings.length)
        : 50;
      return acc;
    },
    {} as Record<(typeof AXES)[number]["key"], number>
  );

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const activePolygonPoints = AXES.map((axis, i) => {
    const val = activeFinding.observables?.[axis.key] ?? 50;
    const pt = getPoint(i, val);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(" ");

  const avgPolygonPoints = AXES.map((axis, i) => {
    const val = avgObservables[axis.key] ?? 50;
    const pt = getPoint(i, val);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#111827] border border-slate-800 p-6">
      {/* Left: 5-Axis Radar Calibration */}
      <div className="flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              01. Five Observables Telemetry Calibration
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active target kinematics vs. aggregate YouTube scan envelope (0–100 scale)
            </p>
          </div>
          <div className="text-right font-mono text-xs text-cyan-400 tabular-nums shrink-0">
            PEAK{" "}
            {Math.max(
              activeFinding.observables.positiveLift,
              activeFinding.observables.instantaneousAcceleration,
              activeFinding.observables.hypersonicVelocity,
              activeFinding.observables.transmediumTravel,
              activeFinding.observables.lowObservability
            )}
            <span className="text-slate-500 ml-1">IDX</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="shrink-0 select-none"
          >
            {/* Concentric Polygonal Rings */}
            {[25, 50, 75, 100].map((level) => {
              const pts = AXES.map((_, i) => {
                const p = getPoint(i, level);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              }).join(" ");
              return (
                <polygon
                  key={level}
                  points={pts}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="1"
                />
              );
            })}

            {/* Radial Axes */}
            {AXES.map((axis, i) => {
              const outer = getPoint(i, 100);
              const labelPos = getPoint(i, 122);
              return (
                <g key={axis.key}>
                  <line
                    x1={center}
                    y1={center}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-400 font-mono text-[10px]"
                  >
                    {axis.short}
                  </text>
                </g>
              );
            })}

            {/* Aggregate Scan Baseline Polygon */}
            <polygon
              points={avgPolygonPoints}
              fill="rgba(245, 158, 11, 0.08)"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Active Target Polygon */}
            <polygon
              points={activePolygonPoints}
              fill="rgba(6, 182, 212, 0.22)"
              stroke="#06B6D4"
              strokeWidth="2"
            />

            {/* Vertex Nodes */}
            {AXES.map((axis, i) => {
              const val = activeFinding.observables?.[axis.key] ?? 50;
              const pt = getPoint(i, val);
              return (
                <circle
                  key={axis.key}
                  cx={pt.x}
                  cy={pt.y}
                  r={3.5}
                  className="fill-cyan-400 stroke-[#07090E] stroke-2"
                />
              );
            })}
          </svg>

          {/* Numeric Readout Table */}
          <div className="w-full space-y-2.5">
            <div className="text-xs text-slate-400 pb-1 border-b border-slate-800 truncate">
              Target: <span className="text-slate-200 font-medium">{activeFinding.title}</span>
            </div>
            {AXES.map((axis) => {
              const val = activeFinding.observables?.[axis.key] ?? 50;
              const avg = avgObservables[axis.key] ?? 50;
              const delta = val - avg;
              return (
                <div
                  key={axis.key}
                  className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-1.5"
                >
                  <span className="text-slate-300 font-mono">{axis.label}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="text-slate-100 font-semibold">{val}.0</span>
                    <span
                      className={`text-[11px] ${
                        delta >= 0 ? "text-cyan-400" : "text-amber-400"
                      }`}
                    >
                      {delta >= 0 ? `+${delta}` : delta} vs avg
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 pt-1 text-[11px] font-mono text-slate-400">
              <span>— Cyan: Active Video</span>
              <span>-- Amber: Queue Mean</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Credibility vs Anomaly Crosshair Scatter */}
      <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-6 pt-6 lg:pt-0">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              02. Multi-Sensor Credibility vs. Anomaly Envelope
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any plotted YouTube evidence vector to inspect telemetry
            </p>
          </div>
          <div className="font-mono text-xs text-slate-400 tabular-nums shrink-0">
            {hoveredCoord
              ? `X:${hoveredCoord.x} Y:${hoveredCoord.y}`
              : `X:${activeFinding.credibilityIndex} Y:${activeFinding.anomalyScore}`}
          </div>
        </div>

        <div className="relative h-60 w-full bg-[#0B0E17] border border-slate-800 my-4 cursor-crosshair overflow-hidden">
          {/* Hairline Coordinate Grid */}
          <svg className="w-full h-full" viewBox="0 0 400 220">
            {[44, 88, 132, 176].map((y) => (
              <line
                key={y}
                x1={0}
                y1={y}
                x2={400}
                y2={y}
                stroke="#1E293B"
                strokeWidth="1"
              />
            ))}
            {[80, 160, 240, 320].map((x) => (
              <line
                key={x}
                x1={x}
                y1={0}
                x2={x}
                y2={220}
                stroke="#1E293B"
                strokeWidth="1"
              />
            ))}

            {/* High-Priority Quadrant Shading */}
            <rect
              x={280}
              y={0}
              width={120}
              height={110}
              fill="rgba(6, 182, 212, 0.05)"
            />
            <text
              x={392}
              y={16}
              textAnchor="end"
              className="fill-cyan-500/70 font-mono text-[9px]"
            >
              HIGH CREDIBILITY + HIGH ANOMALY ZONE
            </text>

            {/* Plot Findings */}
            {allFindings.map((item) => {
              const cx = Math.max(24, Math.min(380, ((item.credibilityIndex - 40) / 60) * 360 + 20));
              const cy = Math.max(20, Math.min(200, 210 - ((item.anomalyScore - 40) / 60) * 190));
              const isSelected = item.id === activeFinding.id;

              return (
                <g
                  key={item.id}
                  onClick={() => onSelectFinding(item)}
                  onMouseEnter={() =>
                    setHoveredCoord({
                      x: item.credibilityIndex,
                      y: item.anomalyScore,
                      title: item.title,
                    })
                  }
                  onMouseLeave={() => setHoveredCoord(null)}
                  className="cursor-pointer"
                >
                  {isSelected && (
                    <>
                      <line
                        x1={cx}
                        y1={0}
                        x2={cx}
                        y2={220}
                        stroke="#06B6D4"
                        strokeWidth="0.75"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1={0}
                        y1={cy}
                        x2={400}
                        y2={cy}
                        stroke="#06B6D4"
                        strokeWidth="0.75"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={9}
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="1.5"
                      />
                    </>
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 5 : 4}
                    fill={isSelected ? "#06B6D4" : "#F59E0B"}
                  />
                  <text
                    x={cx + 8}
                    y={cy + 3}
                    className={`font-mono text-[10px] ${
                      isSelected ? "fill-cyan-300 font-semibold" : "fill-slate-400"
                    }`}
                  >
                    {item.channel.split(" ")[0]} ({item.credibilityIndex}/{item.anomalyScore})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Axis Labels */}
          <div className="absolute bottom-1.5 left-3 right-3 flex justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
            <span>X-AXIS: SOURCE CREDIBILITY (40–100)</span>
            <span>Y-AXIS: KINEMATIC ANOMALY (40–100)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="truncate">
            {hoveredCoord
              ? `Inspecting: ${hoveredCoord.title}`
              : `Selected: ${activeFinding.title}`}
          </span>
          <span className="font-mono text-slate-300 shrink-0 ml-2 tabular-nums">
            {allFindings.length} videos calibrated
          </span>
        </div>
      </div>
    </div>
  );
};
