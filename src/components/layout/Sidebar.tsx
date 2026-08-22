import { useTrinetraStore } from '../../store/useTrinetraStore';

const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: '⬡' },
  { id: 'live-monitor', label: 'Live Monitor', icon: '◉' },
  { id: 'attack-replay', label: 'Attack Replay', icon: '▶' },
  { id: 'incidents', label: 'Incidents', icon: '⚠' },
  { id: 'files', label: 'Files', icon: '⬛' },
  { id: 'recovery', label: 'Recovery', icon: '✦' },
  { id: 'agents', label: 'Agents', icon: '◈' },
  { id: 'simulation-lab', label: 'Simulation Lab', icon: '⚗' },
  { id: 'reports', label: 'Reports', icon: '≡' },
];

export function Sidebar() {
  const activePage = useTrinetraStore((s) => s.activePage);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);
  const simulationPhase = useTrinetraStore((s) => s.simulationPhase);
  const alertState = useTrinetraStore((s) => s.alertState);

  return (
    <aside
      style={{
        width: '200px',
        minWidth: '44px',
        background: '#07070d',
        borderRight: '1px solid #1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
      }}
      className="relative"
    >
      {/* Logo */}
      <div
        style={{
          padding: '14px 12px',
          borderBottom: '1px solid #1a1a2e',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            background: 'rgba(255,0,64,0.12)',
            border: '1px solid rgba(255,0,64,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '14px',
          }}
        >
          ⬡
        </div>
        <div className="sidebar-label">
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.2em',
              color: '#ff0040',
            }}
          >
            TRINETRA
          </div>
          <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.15em' }}>
            CYBER SOC
          </div>
        </div>
      </div>

      {/* System Status */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #1a1a2e',
          fontSize: '9px',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.1em',
        }}
        className="sidebar-label"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span
            className="status-dot"
            style={{
              background: alertState === 'critical' ? '#ff0040' :
                          alertState === 'contained' ? '#ffaa00' :
                          simulationPhase === 'recovered' ? '#00ff88' :
                          simulationPhase !== 'idle' ? '#ffaa00' : '#00ff88',
              boxShadow: alertState === 'critical' ? '0 0 6px rgba(255,0,64,0.8)' :
                         simulationPhase !== 'idle' ? '0 0 6px rgba(255,170,0,0.6)' :
                         '0 0 6px rgba(0,255,136,0.6)',
            }}
          />
          <span
            style={{
              color: alertState === 'critical' ? '#ff0040' :
                     simulationPhase !== 'idle' ? '#ffaa00' : '#00ff88',
            }}
          >
            {alertState === 'critical' ? 'THREAT ACTIVE' :
             alertState === 'contained' ? 'CONTAINING' :
             alertState === 'recovered' ? 'RECOVERED' :
             simulationPhase !== 'idle' ? simulationPhase.toUpperCase() : 'PROTECTED'}
          </span>
        </div>
        <div style={{ color: '#3a3a5a' }}>SYSTEM STATUS</div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item w-full text-left ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
            style={{ background: 'none', width: '100%' }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {/* Alert badge */}
            {item.id === 'incidents' && alertState === 'critical' && (
              <span
                className="sidebar-label"
                style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#ff0040',
                  boxShadow: '0 0 6px rgba(255,0,64,0.8)',
                  animation: 'blink 1s step-end infinite',
                  flexShrink: 0,
                }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '10px 12px',
          borderTop: '1px solid #1a1a2e',
          fontSize: '8px',
          color: '#2a2a3a',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.1em',
        }}
        className="sidebar-label"
      >
        <div>v1.0.0-ALPHA</div>
        <div>CTRL+K COMMANDS</div>
      </div>
    </aside>
  );
}
