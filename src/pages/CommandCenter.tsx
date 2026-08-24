import { useEffect, useState, useRef } from 'react';
import { useTrinetraStore } from '../store/useTrinetraStore';
import { AgentNetworkMap } from '../components/shared/AgentNetworkMap';
import { LiveRiskGraph, MiniSparkline } from '../components/shared/LiveRiskGraph';
import { EventFeed } from '../components/shared/EventFeed';
import { dashboardApi } from '../api/dashboardApi';

// Generate idle mini chart data
function genMini(base: number, noise = 10) {
  return Array.from({ length: 30 }, () => ({ v: base + (Math.random() - 0.5) * noise }));
}

function useFluctuatingMetric(base: number, range: number, interval = 1500) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setVal(base + (Math.random() - 0.5) * range), interval);
    return () => clearInterval(id);
  }, [base, range, interval]);
  return val;
}

function PanelHeader({ title, accent }: { title: string; accent?: boolean }) {
  return (
    <div className="panel-header">
      {accent && <span style={{ width: 3, height: 10, background: '#ff0040', display: 'block', flexShrink: 0 }} />}
      <span className="panel-title">{title}</span>
    </div>
  );
}

function MetricBlock({ label, value, unit = '', color = '#e8e8f0' }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '18px', color, lineHeight: 1 }}>
        {value}<span style={{ fontSize: '10px', color: '#5a5a7a', marginLeft: '2px' }}>{unit}</span>
      </div>
    </div>
  );
}

export function CommandCenter() {
  const riskScore = useTrinetraStore((s) => s.riskScore);
  const agents = useTrinetraStore((s) => s.agents);
  const addRiskPoint = useTrinetraStore((s) => s.addRiskPoint);
  const simulationPhase = useTrinetraStore((s) => s.simulationPhase);
  const fileMetrics = useTrinetraStore((s) => s.fileMetrics);
  const filesSecured = useTrinetraStore((s) => s.filesSecured);
  const activeIncident = useTrinetraStore((s) => s.activeIncident);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);

  // Live idle fluctuation (not during simulation)
  useEffect(() => {
    if (simulationPhase !== 'idle') return;
    const id = setInterval(() => {
      addRiskPoint(10 + Math.random() * 8, 'idle');
    }, 2000);
    return () => clearInterval(id);
  }, [simulationPhase, addRiskPoint]);

  const modRate = useFluctuatingMetric(fileMetrics.modRate, 200);
  const ioVelocity = useFluctuatingMetric(fileMetrics.ioVelocity, 0.3);
  const entropy = useFluctuatingMetric(fileMetrics.entropy, 0.05);
  const processAnomaly = useFluctuatingMetric(fileMetrics.processAnomaly, 5);
  const networkActivity = useFluctuatingMetric(fileMetrics.networkActivity, 0.2);

  const riskColor =
    riskScore >= 80 ? '#ff0040' :
    riskScore >= 60 ? '#ff6600' :
    riskScore >= 40 ? '#ffaa00' : '#00ff88';

  const activeAgentCount = Object.values(agents).filter((a) => a.state !== 'idle').length;

  // Mini chart histories
  const [modHistory, setModHistory] = useState(genMini(1400, 200));
  const [ioHistory, setIoHistory] = useState(genMini(24, 5));
  const [entropyHistory, setEntropyHistory] = useState(genMini(92, 8));
  const [procHistory, setProcHistory] = useState(genMini(85, 10));
  const [netHistory, setNetHistory] = useState(genMini(13, 4));

  useEffect(() => {
    const id = setInterval(() => {
      setModHistory((h) => [...h.slice(-29), { v: modRate }]);
      setIoHistory((h) => [...h.slice(-29), { v: ioVelocity * 10 }]);
      setEntropyHistory((h) => [...h.slice(-29), { v: entropy * 100 }]);
      setProcHistory((h) => [...h.slice(-29), { v: processAnomaly }]);
      setNetHistory((h) => [...h.slice(-29), { v: networkActivity * 10 }]);
    }, 1500);
    return () => clearInterval(id);
  }, [modRate, ioVelocity, entropy, processAnomaly, networkActivity]);

  const phaseLabel: Record<string, string> = {
    idle: 'PROTECTED', detecting: 'DETECTING', analysing: 'ANALYSING',
    deciding: 'DECIDING', containing: 'CONTAINING', protecting: 'PROTECTING', recovered: 'RECOVERED',
  };

  const responseTime = '00:01:42';

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '10px',
        gap: '8px',
        background: '#050508',
      }}
      className="hud-grid"
    >
      {/* Top row: System Status + Agent Network + Metrics */}
      <div style={{ display: 'flex', gap: '8px', flex: '0 0 auto' }}>

        {/* System Status */}
        <div className="panel" style={{ width: '130px', flexShrink: 0 }}>
          <PanelHeader title="System Status" />
          <div style={{ padding: '10px 8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '48px', fontWeight: 700, color: riskColor, lineHeight: 1, textShadow: `0 0 20px ${riskColor}60` }}>
                {Math.round(riskScore)}
              </div>
              <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.15em', marginTop: '2px' }}>THREAT LEVEL</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <StatusRow label="Status" value={phaseLabel[simulationPhase] || 'PROTECTED'} color={simulationPhase === 'idle' ? '#00ff88' : simulationPhase === 'recovered' ? '#00ff88' : '#ff0040'} />
              <StatusRow label="Active Threats" value={activeIncident ? '1' : '0'} color={activeIncident ? '#ff0040' : '#00ff88'} />
              <StatusRow label="Confidence" value="97.4%" />
              <StatusRow label="Response" value={responseTime} />
              <StatusRow label="Files Secured" value={filesSecured > 0 ? `${filesSecured}` : '1,842'} color="#00ff88" />
              <StatusRow label="Agents Active" value={`${activeAgentCount}/6`} color="#00aaff" />
            </div>
          </div>
        </div>

        {/* Agent Network (center, expands) */}
        <div className="panel panel-red-border" style={{ flex: 1, minHeight: '230px', position: 'relative' }}>
          <PanelHeader title="Agent Network — AI Response Architecture" accent />
          <div style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 28px)' }}>
            <AgentNetworkMap width={440} height={190} />
          </div>
          {/* Phase indicator */}
          {simulationPhase !== 'idle' && (
            <div
              style={{
                position: 'absolute',
                top: '32px',
                right: '10px',
                background: 'rgba(255,0,64,0.1)',
                border: '1px solid rgba(255,0,64,0.4)',
                padding: '2px 8px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px',
                fontWeight: 700,
                color: '#ff0040',
                letterSpacing: '0.12em',
              }}
            >
              {simulationPhase.toUpperCase()}
            </div>
          )}
        </div>

        {/* Quick Actions + Live Metrics strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '140px', flexShrink: 0 }}>
          <div className="panel" style={{ flex: 1 }}>
            <PanelHeader title="Quick Actions" />
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button className="btn-primary" onClick={() => setActivePage('attack-replay')} style={{ width: '100%', textAlign: 'center', padding: '5px 8px', fontSize: '9px' }}>
                ▶ ATTACK REPLAY
              </button>
              <button className="btn-secondary" onClick={() => setActivePage('live-monitor')} style={{ width: '100%', textAlign: 'center', padding: '5px 8px', fontSize: '9px' }}>
                ◉ LIVE MONITOR
              </button>
              <button className="btn-ghost" onClick={() => setActivePage('simulation-lab')} style={{ width: '100%', textAlign: 'center', padding: '5px 8px', fontSize: '9px' }}>
                ⚗ SIMULATION
              </button>
              <button className="btn-ghost" onClick={() => setActivePage('reports')} style={{ width: '100%', textAlign: 'center', padding: '5px 8px', fontSize: '9px', marginBottom: '8px' }}>
                ≡ REPORTS
              </button>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                <button
                  className="btn-secondary"
                  onClick={async () => {
                    await dashboardApi.clearDashboard();
                  }}
                  style={{ width: '100%', textAlign: 'center', padding: '5px 8px', fontSize: '9px', marginBottom: '6px', color: '#ff6600', borderColor: 'rgba(255,102,0,0.3)' }}
                >
                  CLEAR SYSTEM LOGS
                </button>
                <button
                  className="btn-secondary"
                  onClick={async () => {
                    const store = useTrinetraStore.getState();
                    await store.unlockAllFiles();
                  }}
                  style={{ width: '100%', textAlign: 'center', padding: '5px 8px', fontSize: '9px', color: '#00ff88', borderColor: 'rgba(0,255,136,0.3)' }}
                >
                  UNLOCK FILES
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle row: Risk Graph + Mini Charts */}
      <div style={{ display: 'flex', gap: '8px', flex: '0 0 auto' }}>
        {/* LIVE RISK GRAPH — main visual element */}
        <div className="panel panel-red-border" style={{ flex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #1a1a2e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 3, height: 10, background: '#ff0040', display: 'block' }} />
              <span className="panel-title">Live Risk Graph</span>
              <span className="live-badge">LIVE</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: riskColor }}>
              {Math.round(riskScore)}
            </div>
          </div>
          <LiveRiskGraph height={100} showThresholds showTooltip />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '3px 10px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: '#00ff88' }}>■ SAFE &lt;40</span>
            <span style={{ color: '#ffaa00' }}>■ WARNING &lt;60</span>
            <span style={{ color: '#ff6600' }}>■ HIGH &lt;80</span>
            <span style={{ color: '#ff0040' }}>■ CRITICAL ≥80</span>
          </div>
        </div>

        {/* Mini metric charts */}
        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
          {[
            { label: 'File Mod Rate', value: `${Math.round(modRate)}`, unit: '/s', history: modHistory, color: '#ff0040' },
            { label: 'I/O Velocity', value: ioVelocity.toFixed(1), unit: 'MB/s', history: ioHistory, color: '#ff6600' },
            { label: 'File Entropy', value: entropy.toFixed(2), unit: '', history: entropyHistory, color: '#ffaa00' },
            { label: 'Proc Anomaly', value: `${Math.round(processAnomaly)}%`, unit: '', history: procHistory, color: '#aa00ff' },
            { label: 'Network', value: networkActivity.toFixed(1), unit: 'Gbps', history: netHistory, color: '#00aaff' },
          ].map((m) => (
            <div key={m.label} className="panel" style={{ flex: 1, minWidth: '80px' }}>
              <div style={{ padding: '5px 6px 2px' }}>
                <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1px' }}>{m.label}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: 700, color: m.color }}>{m.value}<span style={{ fontSize: '8px', color: '#5a5a7a' }}>{m.unit}</span></div>
              </div>
              <MiniSparkline data={m.history} color={m.color} height={36} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: Telemetry + Live Metrics */}
      <div style={{ display: 'flex', gap: '8px', flex: 1, minHeight: 0 }}>
        {/* Telemetry Console */}
        <div className="panel" style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #1a1a2e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 3, height: 10, background: '#00aaff', display: 'block' }} />
              <span className="panel-title">Live Telemetry</span>
              <span className="live-badge" style={{ background: 'rgba(0,170,255,0.1)', borderColor: 'rgba(0,170,255,0.3)', color: '#00aaff' }}>FEED</span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '6px 10px' }}>
            <EventFeed maxHeight="100%" />
          </div>
        </div>

        {/* Current Incident + Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '260px', flexShrink: 0 }}>
          {/* Current Incident */}
          <div className="panel panel-red-border" style={{ flex: 1 }}>
            <PanelHeader title="Current Incident" accent />
            <div style={{ padding: '8px' }}>
              {activeIncident ? (
                <>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#ff0040', fontWeight: 700, marginBottom: '6px' }}>{activeIncident.id} — {activeIncident.threat.toUpperCase()}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}>
                    <MiniStatRow label="Target" value={activeIncident.target} />
                    <MiniStatRow label="Risk" value={`${activeIncident.riskScore}/100`} color="#ff0040" />
                    <MiniStatRow label="Confidence" value={`${activeIncident.confidence}%`} color="#ff6600" />
                    <MiniStatRow label="Files" value={`${activeIncident.filesAffected}`} color="#ffaa00" />
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#3a3a5a', textAlign: 'center', padding: '10px' }}>
                  No active incident<br />
                  <span style={{ fontSize: '8px' }}>System nominal</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent States */}
          <div className="panel" style={{ flex: 1 }}>
            <PanelHeader title="Agent States" />
            <div style={{ padding: '4px 8px' }}>
              {Object.values(agents).map((agent) => (
                <AgentStateRow key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color = '#c8c8d8' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

function MiniStatRow({ label, value, color = '#9a9ab8' }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '7px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const STATE_COLORS: Record<string, string> = {
  idle: '#3a3a5a', monitoring: '#00ff88', active: '#00ff88',
  detecting: '#ffaa00', analysing: '#ff6600', deciding: '#ff6600',
  containing: '#ff0040', protecting: '#aa00ff', recovered: '#00ff88', blocked: '#ff0040',
};

function AgentStateRow({ agent }: { agent: { name: string; state: string; color: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: agent.color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#7a7a9a', flex: 1 }}>{agent.name}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', fontWeight: 600, color: STATE_COLORS[agent.state] || '#3a3a5a', letterSpacing: '0.08em' }}>
        {agent.state.toUpperCase()}
      </span>
    </div>
  );
}
