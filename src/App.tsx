import { useEffect } from 'react';
import { useTrinetraStore } from './store/useTrinetraStore';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Overlays
import { CriticalAlert } from './components/overlay/CriticalAlert';
import { CommandPalette } from './components/overlay/CommandPalette';

// Pages
import { CommandCenter } from './pages/CommandCenter';
import { LiveMonitor } from './pages/LiveMonitor';
import { AttackReplay } from './pages/AttackReplay';
import { Incidents } from './pages/Incidents';
import { Files } from './pages/Files';
import { Recovery } from './pages/Recovery';
import { Agents } from './pages/Agents';
import { SimulationLab } from './pages/SimulationLab';

// Reports placeholder (lightweight, no dedicated page yet)
function Reports() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        color: '#3a3a5a',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '13px',
        letterSpacing: '0.12em',
      }}
    >
      <div style={{ fontSize: '32px', opacity: 0.4 }}>≡</div>
      <div>REPORTS</div>
      <div style={{ fontSize: '10px', color: '#2a2a3a' }}>COMING SOON</div>
    </div>
  );
}

const PAGE_MAP: Record<string, React.ReactNode> = {
  'command-center': <CommandCenter />,
  'live-monitor': <LiveMonitor />,
  'attack-replay': <AttackReplay />,
  'incidents': <Incidents />,
  'files': <Files />,
  'recovery': <Recovery />,
  'agents': <Agents />,
  'simulation-lab': <SimulationLab />,
  'reports': <Reports />,
};

export default function App() {
  const activePage = useTrinetraStore((s) => s.activePage);
  const setCmdPaletteOpen = useTrinetraStore((s) => s.setCmdPaletteOpen);

  // Global Ctrl+K shortcut (also handled in CommandPalette, belt-and-suspenders)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCmdPaletteOpen]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#07070d',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top bar */}
      <TopBar />

      {/* Body: sidebar + main content */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {PAGE_MAP[activePage] ?? PAGE_MAP['command-center']}
        </main>
      </div>

      {/* Global overlays */}
      <CriticalAlert />
      <CommandPalette />
    </div>
  );
}
