import { useTrinetraStore } from '../../store/useTrinetraStore';

const PAGE_TITLES: Record<string, string> = {
  'command-center': 'COMMAND CENTER',
  'live-monitor': 'LIVE MONITOR',
  'attack-replay': 'ATTACK REPLAY',
  'incidents': 'INCIDENTS',
  'files': 'FILES',
  'recovery': 'RECOVERY',
  'agents': 'AGENTS',
  'simulation-lab': 'SIMULATION LAB',
  'reports': 'REPORTS',
};

export function TopBar() {
  const activePage = useTrinetraStore((s) => s.activePage);
  const riskScore = useTrinetraStore((s) => s.riskScore);
  const alertState = useTrinetraStore((s) => s.alertState);
  const setCmdPaletteOpen = useTrinetraStore((s) => s.setCmdPaletteOpen);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);
  const agents = useTrinetraStore((s) => s.agents);
  const simulationPhase = useTrinetraStore((s) => s.simulationPhase);

  const activeAgentCount = Object.values(agents).filter(
    (a) => a.state !== 'idle'
  ).length;

  const riskColor =
    riskScore >= 80 ? '#ff0040' :
    riskScore >= 60 ? '#ff6600' :
    riskScore >= 40 ? '#ffaa00' : '#00ff88';

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  return (
    <header
      style={{
        height: '38px',
        background: '#07070d',
        borderBottom: '1px solid #1a1a2e',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {/* Page title */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: '#e8e8f0',
          flex: 1,
        }}
      >
        {PAGE_TITLES[activePage] || activePage.toUpperCase()}
      </div>

      {/* Breadcrumb path */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          color: '#2a2a3a',
          letterSpacing: '0.1em',
        }}
        className="hide-mobile"
      >
        TRINETRA / {PAGE_TITLES[activePage] || activePage.toUpperCase()}
      </div>

      {/* Risk indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 10px',
          height: '22px',
          background: `rgba(${riskScore >= 80 ? '255,0,64' : riskScore >= 60 ? '255,102,0' : riskScore >= 40 ? '255,170,0' : '0,255,136'},0.08)`,
          border: `1px solid ${riskColor}40`,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
        }}
        className="hide-mobile"
      >
        <span style={{ color: '#3a3a5a', fontSize: '8px' }}>RISK</span>
        <span style={{ color: riskColor, fontWeight: 700 }}>{Math.round(riskScore)}</span>
      </div>

      {/* Agent count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: '#5a5a7a',
        }}
        className="hide-mobile"
      >
        <span style={{ color: '#00ff88', fontWeight: 700 }}>{activeAgentCount}</span>
        <span style={{ fontSize: '8px' }}>AGENTS</span>
      </div>

      {/* Phase badge */}
      {simulationPhase !== 'idle' && (
        <div
          style={{
            padding: '2px 8px',
            background: 'rgba(255,0,64,0.1)',
            border: '1px solid rgba(255,0,64,0.3)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            fontWeight: 700,
            color: '#ff0040',
            letterSpacing: '0.12em',
            animation: 'blink 2s step-end infinite',
          }}
          className="hide-mobile"
        >
          {simulationPhase.toUpperCase()}
        </div>
      )}

      {/* Time */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: '#3a3a5a',
          letterSpacing: '0.08em',
        }}
        className="hide-mobile"
      >
        {timeStr}
      </div>

      {/* Ctrl+K */}
      <button
        onClick={() => setCmdPaletteOpen(true)}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid #1a1a2e',
          color: '#3a3a5a',
          padding: '3px 10px',
          fontSize: '9px',
          fontFamily: 'JetBrains Mono, monospace',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          letterSpacing: '0.08em',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,0,64,0.3)';
          (e.target as HTMLButtonElement).style.color = '#ff0040';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.borderColor = '#1a1a2e';
          (e.target as HTMLButtonElement).style.color = '#3a3a5a';
        }}
      >
        ⌘K
      </button>

      {/* Simulation Lab shortcut */}
      <button
        onClick={() => setActivePage('simulation-lab')}
        style={{
          background: 'rgba(255,0,64,0.08)',
          border: '1px solid rgba(255,0,64,0.25)',
          color: '#ff0040',
          padding: '3px 10px',
          fontSize: '9px',
          fontFamily: 'JetBrains Mono, monospace',
          cursor: 'pointer',
          letterSpacing: '0.1em',
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = 'rgba(255,0,64,0.15)';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = 'rgba(255,0,64,0.08)';
        }}
        className="hide-mobile"
      >
        ⚗ SIM LAB
      </button>
    </header>
  );
}
