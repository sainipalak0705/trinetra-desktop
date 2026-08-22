import { useEffect, useRef, useState } from 'react';
import { useTrinetraStore } from '../../store/useTrinetraStore';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  secondaryColor: string;
}

interface Edge {
  from: string;
  to: string;
}

const NODES: Node[] = [
  { id: 'watchdog',    label: 'WATCHDOG',      x: 160, y: 60,  color: '#ff0040', secondaryColor: '#cc0033' },
  { id: 'gatekeeper',  label: 'GATEKEEPER',    x: 300, y: 40,  color: '#ff6600', secondaryColor: '#cc5200' },
  { id: 'riskAnalyser',label: 'RISK ANALYSER', x: 370, y: 130, color: '#ffaa00', secondaryColor: '#cc8800' },
  { id: 'policyEngine',label: 'POLICY ENGINE', x: 270, y: 190, color: '#00aaff', secondaryColor: '#0088cc' },
  { id: 'enforcer',    label: 'ENFORCER',      x: 140, y: 190, color: '#aa00ff', secondaryColor: '#8800cc' },
  { id: 'vaultKeeper', label: 'VAULTKEEPER',   x: 60,  y: 130, color: '#00ff88', secondaryColor: '#00cc6a' },
];

const EDGES: Edge[] = [
  { from: 'watchdog',     to: 'gatekeeper' },
  { from: 'gatekeeper',   to: 'riskAnalyser' },
  { from: 'riskAnalyser', to: 'policyEngine' },
  { from: 'policyEngine', to: 'enforcer' },
  { from: 'enforcer',     to: 'vaultKeeper' },
  { from: 'vaultKeeper',  to: 'watchdog' },
  { from: 'watchdog',     to: 'riskAnalyser' },
  { from: 'policyEngine', to: 'vaultKeeper' },
];

const STATE_LABELS: Record<string, string> = {
  idle: 'IDLE', monitoring: 'MONITORING', active: 'ACTIVE',
  detecting: 'DETECTING', analysing: 'ANALYSING', deciding: 'DECIDING',
  containing: 'CONTAINING', protecting: 'PROTECTING', recovered: 'RECOVERED', blocked: 'BLOCKED',
};

const STATE_COLORS: Record<string, string> = {
  idle: '#3a3a5a', monitoring: '#00ff88', active: '#00ff88',
  detecting: '#ffaa00', analysing: '#ff6600', deciding: '#ff6600',
  containing: '#ff0040', protecting: '#aa00ff', recovered: '#00ff88', blocked: '#ff0040',
};

// Animated particle along an edge
interface Particle {
  id: number;
  edgeIdx: number;
  t: number; // 0..1
  speed: number;
}

export function AgentNetworkMap({ width = 430, height = 240 }: { width?: number; height?: number }) {
  const agents = useTrinetraStore((s) => s.agents);
  const simulationPhase = useTrinetraStore((s) => s.simulationPhase);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tick, setTick] = useState(0);
  const particleIdRef = useRef(0);

  // Spawn particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        const next = prev
          .map((p) => ({ ...p, t: p.t + p.speed }))
          .filter((p) => p.t < 1);
        // Spawn new ones
        const edgeIdx = Math.floor(Math.random() * EDGES.length);
        next.push({ id: particleIdRef.current++, edgeIdx, t: 0, speed: 0.012 + Math.random() * 0.018 });
        return next;
      });
      setTick((t) => t + 1);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const getNode = (id: string) => NODES.find((n) => n.id === id)!;

  const scaleX = (x: number) => (x / 430) * width;
  const scaleY = (y: number) => (y / 240) * height;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
    >
      {/* Grid dots */}
      {Array.from({ length: 8 }).map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <circle
            key={`dot-${i}-${j}`}
            cx={scaleX((i * 430) / 7)}
            cy={scaleY((j * 240) / 4)}
            r={0.8}
            fill="rgba(255,255,255,0.06)"
          />
        ))
      )}

      {/* Edges */}
      {EDGES.map((edge, idx) => {
        const from = getNode(edge.from);
        const to = getNode(edge.to);
        const isActive = simulationPhase !== 'idle';
        return (
          <line
            key={`edge-${idx}`}
            x1={scaleX(from.x)}
            y1={scaleY(from.y)}
            x2={scaleX(to.x)}
            y2={scaleY(to.y)}
            stroke={isActive ? `rgba(255,0,64,0.25)` : 'rgba(255,255,255,0.06)'}
            strokeWidth={0.8}
          />
        );
      })}

      {/* Particles */}
      {particles.map((p) => {
        const edge = EDGES[p.edgeIdx];
        const from = getNode(edge.from);
        const to = getNode(edge.to);
        const x = scaleX(from.x + (to.x - from.x) * p.t);
        const y = scaleY(from.y + (to.y - from.y) * p.t);
        const fromNode = NODES.find((n) => n.id === edge.from)!;
        return (
          <circle
            key={p.id}
            cx={x}
            cy={y}
            r={2}
            fill={fromNode.color}
            opacity={0.6 + Math.sin(p.t * Math.PI) * 0.4}
          />
        );
      })}

      {/* Nodes */}
      {NODES.map((node) => {
        const agentKey = node.id as keyof typeof agents;
        const agent = agents[agentKey];
        const state = agent?.state ?? 'idle';
        const stateColor = STATE_COLORS[state] || node.color;
        const isActive = state !== 'idle' && state !== 'monitoring' && state !== 'active';
        const sx = scaleX(node.x);
        const sy = scaleY(node.y);

        return (
          <g key={node.id} style={{ cursor: 'pointer' }}>
            {/* Glow ring for active states */}
            {isActive && (
              <circle
                cx={sx}
                cy={sy}
                r={22}
                fill="none"
                stroke={stateColor}
                strokeWidth={1}
                opacity={0.3}
              >
                <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Outer hex ring */}
            <polygon
              points={hexPoints(sx, sy, 16)}
              fill="none"
              stroke={node.color}
              strokeWidth={0.8}
              opacity={0.3}
            />
            {/* Main circle */}
            <circle
              cx={sx}
              cy={sy}
              r={14}
              fill={`rgba(${hexToRgb(node.color)},0.12)`}
              stroke={stateColor}
              strokeWidth={1.5}
            />
            {/* Inner dot */}
            <circle cx={sx} cy={sy} r={3} fill={stateColor} />
            {/* Label */}
            <text
              x={sx}
              y={sy + 26}
              textAnchor="middle"
              fill={node.color}
              fontSize={7}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={600}
              letterSpacing="0.08em"
            >
              {node.label}
            </text>
            {/* State label */}
            <text
              x={sx}
              y={sy + 34}
              textAnchor="middle"
              fill={stateColor}
              fontSize={6}
              fontFamily="JetBrains Mono, monospace"
              opacity={0.8}
            >
              {STATE_LABELS[state] || state.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Center label */}
      <text
        x={scaleX(215)}
        y={scaleY(120)}
        textAnchor="middle"
        fill="rgba(255,0,64,0.2)"
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="0.2em"
      >
        TRINETRA
      </text>
      <text
        x={scaleX(215)}
        y={scaleY(132)}
        textAnchor="middle"
        fill="rgba(255,255,255,0.1)"
        fontSize={6}
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="0.15em"
      >
        AI AGENT NETWORK
      </text>
    </svg>
  );
}

// Helpers
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '255,0,64';
}
