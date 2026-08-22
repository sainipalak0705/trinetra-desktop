import { useState } from 'react';
import { useTrinetraStore, MOCK_FILES, FileEvent } from '../store/useTrinetraStore';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  modified:  { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)',  label: 'MODIFIED'  },
  encrypted: { color: '#ff0040', bg: 'rgba(255,0,64,0.1)',   label: 'ENCRYPTED' },
  secured:   { color: '#00aaff', bg: 'rgba(0,170,255,0.1)',  label: 'SECURED'   },
  recovered: { color: '#00ff88', bg: 'rgba(0,255,136,0.1)',  label: 'RECOVERED' },
};

type FilterType = 'all' | 'encrypted' | 'modified' | 'secured' | 'recovered';

export function Files() {
  const fileEvents = useTrinetraStore((s) => s.fileEvents);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<FileEvent | null>(null);
  const [search, setSearch] = useState('');

  const displayed = fileEvents.filter((f) => {
    const matchFilter = activeFilter === 'all' || f.status === activeFilter;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                        f.path.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: fileEvents.length,
    encrypted: fileEvents.filter((f) => f.status === 'encrypted').length,
    modified: fileEvents.filter((f) => f.status === 'modified').length,
    secured: fileEvents.filter((f) => f.status === 'secured').length,
    recovered: fileEvents.filter((f) => f.status === 'recovered').length,
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#050508' }} className="hud-grid">
      {/* Warning Banner */}
      <div style={{ background: 'rgba(255,170,0,0.06)', border: 'none', borderBottom: '1px solid rgba(255,170,0,0.2)', padding: '6px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#ffaa00', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: '0.1em' }}>⚠ SIMULATION MODE — No real files are accessed or modified</span>
      </div>

      {/* Header + Search + Filters */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#e8e8f0' }}>FILES</div>
        <input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: '#0a0a0f', border: '1px solid #1a1a2e', color: '#c8c8d8',
            padding: '4px 10px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
            outline: 'none', width: '200px',
          }}
        />
        <div style={{ flex: 1 }} />
        {/* Filter tabs */}
        {(['all', 'encrypted', 'modified', 'secured', 'recovered'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              background: activeFilter === f ? (f === 'all' ? 'rgba(255,255,255,0.08)' : STATUS_CONFIG[f]?.bg || 'rgba(255,255,255,0.08)') : 'transparent',
              border: `1px solid ${activeFilter === f ? (f === 'all' ? '#3a3a5a' : STATUS_CONFIG[f]?.color || '#3a3a5a') : '#1a1a2e'}`,
              color: activeFilter === f ? (f === 'all' ? '#c8c8d8' : STATUS_CONFIG[f]?.color || '#c8c8d8') : '#5a5a7a',
              padding: '3px 10px',
              fontSize: '9px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              transition: 'all 0.15s',
            }}
          >
            {f.toUpperCase()} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>FILE NAME</th>
                <th>PATH</th>
                <th>STATUS</th>
                <th>LAST ACTIVITY</th>
                <th>SIZE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((file) => {
                const cfg = STATUS_CONFIG[file.status];
                return (
                  <tr
                    key={file.id}
                    className={selected?.id === file.id ? 'selected' : ''}
                    onClick={() => setSelected(file)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px' }}>{fileIcon(file.name)}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#c8c8d8' }}>{file.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#5a5a7a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.path}</td>
                    <td>
                      <span style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color, padding: '1px 8px', fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#5a5a7a' }}>{file.timestamp}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#7a7a9a' }}>{file.size}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-ghost" style={{ fontSize: '8px', padding: '2px 6px' }}>↓ DL</button>
                        <button className="btn-ghost" style={{ fontSize: '8px', padding: '2px 6px' }}>≡ INFO</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: '260px', flexShrink: 0, borderLeft: '1px solid #1a1a2e', padding: '12px', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px' }}>{fileIcon(selected.name)}</div>
              <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#c8c8d8', fontWeight: 600, marginBottom: '4px', wordBreak: 'break-all' }}>{selected.name}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#3a3a5a', marginBottom: '16px', wordBreak: 'break-all' }}>{selected.path}{selected.name}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Status', value: STATUS_CONFIG[selected.status].label, color: STATUS_CONFIG[selected.status].color },
                { label: 'Size', value: selected.size },
                { label: 'Last Activity', value: selected.timestamp },
                { label: 'Extension', value: selected.name.split('.').pop()?.toUpperCase() || '—' },
              ].map((m) => (
                <div key={m.label} className="panel" style={{ padding: '6px 8px' }}>
                  <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>{m.label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: m.color || '#c8c8d8', fontWeight: 600 }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button className="btn-primary" style={{ width: '100%', fontSize: '10px' }}>⟲ RESTORE FILE</button>
              <button className="btn-secondary" style={{ width: '100%', fontSize: '10px' }}>≡ VIEW HASH</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function fileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'xlsx': case 'csv': return '📊';
    case 'docx': case 'doc': return '📄';
    case 'pdf': return '📕';
    case 'pptx': return '📊';
    case 'jpg': case 'png': case 'jpeg': return '🖼';
    case 'zip': case 'rar': return '🗜';
    case 'sys': case 'dll': case 'exe': return '⚙';
    default: return '📁';
  }
}
