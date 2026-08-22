import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTrinetraStore } from '../../store/useTrinetraStore';

const PAGES = [
  { id: 'command-center', label: 'Command Center', shortcut: 'G C' },
  { id: 'live-monitor', label: 'Live Monitor', shortcut: 'G M' },
  { id: 'attack-replay', label: 'Attack Replay', shortcut: 'G R' },
  { id: 'incidents', label: 'Incidents', shortcut: 'G I' },
  { id: 'files', label: 'Files', shortcut: 'G F' },
  { id: 'recovery', label: 'Recovery', shortcut: 'G V' },
  { id: 'agents', label: 'Agents', shortcut: 'G A' },
  { id: 'simulation-lab', label: 'Simulation Lab', shortcut: 'G S' },
  { id: 'reports', label: 'Reports', shortcut: 'G P' },
];

const ACTIONS = [
  { id: 'start-sim', label: 'Start Simulation', icon: '▶' },
  { id: 'reset-replay', label: 'Reset Attack Replay', icon: '↺' },
  { id: 'dismiss-alert', label: 'Dismiss Alert', icon: '✕' },
];

export function CommandPalette() {
  const open = useTrinetraStore((s) => s.cmdPaletteOpen);
  const setCmdPaletteOpen = useTrinetraStore((s) => s.setCmdPaletteOpen);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);
  const dismissAlert = useTrinetraStore((s) => s.dismissAlert);
  const resetReplay = useTrinetraStore((s) => s.resetReplay);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = [
    ...PAGES.map((p) => ({ ...p, type: 'page' })),
    ...ACTIONS.map((a) => ({ ...a, type: 'action', shortcut: '' })),
  ];

  const filtered = allItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(!open);
      }
      if (e.key === 'Escape') setCmdPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setCmdPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) execute(filtered[selected]);
  };

  const execute = (item: typeof allItems[0]) => {
    if (item.type === 'page') {
      setActivePage(item.id);
    } else if (item.id === 'dismiss-alert') {
      dismissAlert();
    } else if (item.id === 'reset-replay') {
      resetReplay();
    }
    setCmdPaletteOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="alert-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ alignItems: 'flex-start', paddingTop: '15vh', zIndex: 10000 }}
          onClick={() => setCmdPaletteOpen(false)}
        >
          <motion.div
            className="cmd-palette"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a1a2e', padding: '0 16px' }}>
              <span style={{ color: '#3a3a5a', marginRight: '10px', fontSize: '16px' }}>⌘</span>
              <input
                ref={inputRef}
                className="cmd-input"
                placeholder="Search pages, commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <kbd style={{ background: '#1a1a2e', color: '#5a5a7a', fontSize: '9px', padding: '2px 6px', fontFamily: 'JetBrains Mono, monospace', marginLeft: '8px' }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {filtered.length > 0 ? (
                <>
                  {/* Group: Pages */}
                  {filtered.some((i) => i.type === 'page') && (
                    <div style={{ padding: '8px 16px 4px', fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>NAVIGATE</div>
                  )}
                  {filtered.filter((i) => i.type === 'page').map((item, idx) => (
                    <div
                      key={item.id}
                      className={`cmd-item ${selected === idx ? 'selected' : ''}`}
                      onClick={() => execute(item)}
                    >
                      <span style={{ color: '#ff0040', fontSize: '10px' }}>→</span>
                      <span style={{ color: '#c8c8d8', flex: 1 }}>{item.label}</span>
                      {item.shortcut && <kbd style={{ background: '#1a1a2e', color: '#5a5a7a', fontSize: '9px', padding: '2px 6px', fontFamily: 'JetBrains Mono, monospace' }}>{item.shortcut}</kbd>}
                    </div>
                  ))}
                  {/* Group: Actions */}
                  {filtered.some((i) => i.type === 'action') && (
                    <div style={{ padding: '8px 16px 4px', fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.15em', textTransform: 'uppercase', borderTop: '1px solid #1a1a2e', marginTop: '4px' }}>ACTIONS</div>
                  )}
                  {filtered.filter((i) => i.type === 'action').map((item, idx) => {
                    const absIdx = filtered.filter((i) => i.type === 'page').length + idx;
                    return (
                      <div
                        key={item.id}
                        className={`cmd-item ${selected === absIdx ? 'selected' : ''}`}
                        onClick={() => execute(item)}
                      >
                        <span style={{ color: '#ffaa00' }}>{(item as { icon?: string }).icon}</span>
                        <span style={{ color: '#c8c8d8', flex: 1 }}>{item.label}</span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#3a3a5a', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                  No results for "{query}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid #1a1a2e', display: 'flex', gap: '16px', fontSize: '10px', color: '#3a3a5a', fontFamily: 'JetBrains Mono, monospace' }}>
              <span><kbd style={{ background: '#1a1a2e', padding: '1px 4px' }}>↑↓</kbd> navigate</span>
              <span><kbd style={{ background: '#1a1a2e', padding: '1px 4px' }}>↵</kbd> select</span>
              <span><kbd style={{ background: '#1a1a2e', padding: '1px 4px' }}>esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
