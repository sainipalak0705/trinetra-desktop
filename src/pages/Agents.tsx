import { useState } from 'react';
import { useTrinetraStore, AgentInfo } from '../store/useTrinetraStore';

const AGENT_DESCRIPTIONS: Record<string, string> = {
  watchdog: 'Continuously monitors system processes, file activities, and behaviour patterns. First responder for anomaly detection.',
  gatekeeper: 'Controls network access and monitors inbound/outbound traffic. Enforces network policies and blocks lateral movement.',
  riskAnalyser: 'Analyses collected data to calculate threat scores, classify attack types, and determine confidence levels.',
  policyEngine: 'Evaluates threat data against policy rules and determines appropriate containment and response actions.',
  enforcer: 'Executes containment actions including process termination, network isolation, and access control enforcement.',
  vaultKeeper: 'Manages secure file backup, encryption, integrity verification, and system restore operations.',
};

const STATE_COLORS: Record<string, string> = {
  idle: '#3a3a5a', monitoring: '#00ff88', active: '#00ff88',
  detecting: '#ffaa00', analysing: '#ff6600', deciding: '#ff6600',
  containing: '#ff0040', protecting: '#aa00ff', recovered: '#00ff88', blocked: '#ff0040',
};

const STATE_LABELS: Record<string, string> = {
  idle: 'IDLE', monitoring: 'MONITORING', active: 'ACTIVE',
  detecting: 'DETECTING', analysing: 'ANALYSING', deciding: 'DECIDING',
  containing: 'CONTAINING', protecting: 'PROTECTING', recovered: 'RECOVERED', blocked: 'BLOCKED',
};

function AgentCard({ agent, isSelected, onClick }: { agent: AgentInfo; isSelected: boolean; onClick: () => void }) {
  const stateColor = STATE_COLORS[agent.state] || '#3a3a5a';
  const isActive = agent.state !== 'idle';

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#0d0d14' : '#0a0a0f',
        border: `1px solid ${isSelected ? agent.color + '60' : '#1a1a2e'}`,
        padding: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isSelected ? `0 0 12px ${agent.color}20` : 'none',
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = agent.color + '30'; }}
      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a2e'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{
          width: 32, height: 32,
          background: `${agent.color}15`,
          border: `1px solid ${agent.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontSize: '14px',
        }}>
          ◈
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: agent.color, letterSpacing: '0.1em' }}>{agent.name}</div>
          <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.08em' }}>AI SECURITY AGENT</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: stateColor, boxShadow: isActive ? `0 0 6px ${stateColor}` : 'none', display: 'block' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: stateColor, fontWeight: 700, letterSpacing: '0.1em' }}>{STATE_LABELS[agent.state]}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
        <StatMini label="Events Processed" value={agent.eventsProcessed.toLocaleString()} />
        <StatMini label="Threats Handled" value={agent.threatsHandled.toLocaleString()} color={agent.color} />
      </div>

      {/* Current Activity */}
      <div style={{ background: '#080810', border: '1px solid #1a1a2e', padding: '5px 8px' }}>
        <div style={{ fontSize: '7px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>Current Activity</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#7a7a9a' }}>{agent.currentActivity}</div>
      </div>
    </div>
  );
}

function StatMini({ label, value, color = '#c8c8d8' }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '7px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

export function Agents() {
  const agents = useTrinetraStore((s) => s.agents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);

  const selected = selectedId ? agents[selectedId] : null;
  const agentList = Object.values(agents);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#050508' }} className="hud-grid">
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#e8e8f0' }}>AGENTS</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#3a3a5a' }}>{agentList.filter(a => a.state !== 'idle').length}/{agentList.length} active</div>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" style={{ fontSize: '10px', padding: '4px 12px' }} onClick={() => setActivePage('command-center')}>
          ⬡ VIEW NETWORK
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Agent Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
            {agentList.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedId === agent.id}
                onClick={() => setSelectedId(selectedId === agent.id ? null : agent.id)}
              />
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: '300px', flexShrink: 0, borderLeft: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: selected.color, fontWeight: 700 }}>{selected.name}</div>
              <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => setSelectedId(null)}>✕</button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {/* State indicator */}
              <div style={{
                background: `${STATE_COLORS[selected.state] || '#3a3a5a'}10`,
                border: `1px solid ${STATE_COLORS[selected.state] || '#3a3a5a'}30`,
                padding: '8px 12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATE_COLORS[selected.state] || '#3a3a5a', display: 'block' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: STATE_COLORS[selected.state] || '#3a3a5a', letterSpacing: '0.1em' }}>
                  {STATE_LABELS[selected.state]}
                </span>
              </div>

              {/* Description */}
              <div style={{ fontSize: '11px', color: '#5a5a7a', lineHeight: 1.6, marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
                {AGENT_DESCRIPTIONS[selected.id] || 'AI security agent monitoring system activities.'}
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                {[
                  { label: 'Events Processed', value: selected.eventsProcessed.toLocaleString(), color: selected.color },
                  { label: 'Threats Handled', value: selected.threatsHandled.toLocaleString(), color: '#ff0040' },
                  { label: 'Uptime', value: selected.uptime, color: '#00ff88' },
                  { label: 'Status', value: STATE_LABELS[selected.state], color: STATE_COLORS[selected.state] },
                ].map((m) => (
                  <div key={m.label} className="panel" style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: '7px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>{m.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Last Action */}
              <div className="panel" style={{ padding: '10px 12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Last Action</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#9a9ab8' }}>{selected.lastAction}</div>
              </div>

              {/* Current Activity */}
              <div className="panel panel-red-border" style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Current Activity</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: selected.color }}>{selected.currentActivity}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
