import { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTrinetraStore } from '../../store/useTrinetraStore';

const RISK_COLOR = (v: number) => {
  if (v >= 80) return '#ff0040';
  if (v >= 60) return '#ff6600';
  if (v >= 40) return '#ffaa00';
  return '#00ff88';
};

interface LiveRiskGraphProps {
  height?: number;
  showThresholds?: boolean;
  showTooltip?: boolean;
  dataOverride?: { time: string; value: number; phase: string }[];
  compact?: boolean;
}

export function LiveRiskGraph({
  height = 120,
  showThresholds = true,
  showTooltip = true,
  dataOverride,
  compact = false,
}: LiveRiskGraphProps) {
  const riskHistory = useTrinetraStore((s) => s.riskHistory);
  const data = dataOverride ?? riskHistory;
  const currentScore = data[data.length - 1]?.value ?? 0;
  const color = RISK_COLOR(currentScore);

  const gradientId = useMemo(() => `riskGrad-${Math.random().toString(36).slice(2, 7)}`, []);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {showThresholds && !compact && (
            <>
              <ReferenceLine y={80} stroke="#ff0040" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'CRITICAL', position: 'right', fontSize: 8, fill: '#ff0040' }} />
              <ReferenceLine y={60} stroke="#ff6600" strokeDasharray="3 3" strokeOpacity={0.3} label={{ value: 'HIGH', position: 'right', fontSize: 8, fill: '#ff6600' }} />
              <ReferenceLine y={40} stroke="#ffaa00" strokeDasharray="3 3" strokeOpacity={0.3} label={{ value: 'WARNING', position: 'right', fontSize: 8, fill: '#ffaa00' }} />
            </>
          )}
          {showTooltip && (
            <Tooltip
              contentStyle={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 0, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
              itemStyle={{ color: color }}
              labelStyle={{ color: '#5a5a7a' }}
              formatter={(val: number) => [val.toFixed(1), 'Risk']}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Mini sparkline ────────────────────────────────────────────────────────
interface MiniChartProps {
  data: { v: number }[];
  color?: string;
  height?: number;
}

export function MiniSparkline({ data, color = '#ff0040', height = 40 }: MiniChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`mini-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1}
            fill={`url(#mini-${color.replace('#', '')})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
