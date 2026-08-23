import { useState } from 'react';
import { useTrinetraStore, MOCK_INCIDENTS, Incident } from '../store/useTrinetraStore';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff0040', high: '#ff6600', medium: '#ffaa00', low: '#00aaff',
};
const STATUS_COLORS: Record<string, string> = {
  detected: '#ff0040', contained: '#ffaa00', recovered: '#00ff88',
};

export function Incidents() {
  const incidents = useTrinetraStore((s) => s.incidents);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filter, setFilter] = useState('');

  const filtered = incidents.filter(
    (i) => i.id.toLowerCase().includes(filter.toLowerCase()) ||
            i.threat.toLowerCase().includes(filter.toLowerCase()) ||
            i.target.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', background: '#050508' }} className="hud-grid">
      {/* LEFT: Incident Table */}
      <div style={{ flex: selected ? '0 0 55%' : 1, display: 'flex', flexDirection: 'column', borderRight: selected ? '1px solid #1a1a2e' : 'none', transition: 'flex 0.2s' }}>
        {/* Header */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#e8e8f0' }}>INCIDENTS</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#3a3a5a' }}>{filtered.length} records</div>
          <div style={{ flex: 1 }} />
          {/* Search */}
          <input
            placeholder="Search incidents..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: '#0a0a0f',
              border: '1px solid #1a1a2e',
              color: '#c8c8d8',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              outline: 'none',
              width: '200px',
            }}
          />
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px' }}>
          <table className="data-table" style={{ marginTop: '4px' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>THREAT</th>
                <th>SEVERITY</th>
                <th>TARGET</th>
                <th>DETECTED</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => (
                <tr
                  key={inc.id}
                  className={selected?.id === inc.id ? 'selected' : ''}
                  onClick={() => setSelected(inc)}
                >
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ff0040', fontWeight: 600 }}>{inc.id}</td>
                  <td style={{ color: '#c8c8d8' }}>
                    {inc.isReal ? (
                      <span style={{ fontSize: '8px', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)', padding: '1px 4px', marginRight: '6px', fontFamily: 'JetBrains Mono, monospace' }}>LIVE</span>
                    ) : (
                      <span style={{ fontSize: '8px', color: '#7a7a9a', border: '1px solid #2a2a3a', padding: '1px 4px', marginRight: '6px', fontFamily: 'JetBrains Mono, monospace' }}>SCENARIO</span>
                    )}
                    {inc.threat}
                  </td>
                  <td>
                    <span style={{
                      background: `${SEVERITY_COLORS[inc.severity]}15`,
                      border: `1px solid ${SEVERITY_COLORS[inc.severity]}40`,
                      color: SEVERITY_COLORS[inc.severity],
                      padding: '1px 8px',
                      fontSize: '9px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                    }}>
                      {inc.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#7a7a9a' }}>{inc.target}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#5a5a7a' }}>{inc.detectedAt}</td>
                  <td>
                    <span style={{
                      color: STATUS_COLORS[inc.status],
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '9px',
                      fontWeight: 600,
                    }}>
                      {inc.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn-ghost"
                        style={{ fontSize: '8px', padding: '2px 6px' }}
                        onClick={(e) => { e.stopPropagation(); setActivePage('attack-replay'); }}
                      >▶ REPLAY</button>
                      <button
                        className="btn-ghost"
                        style={{ fontSize: '8px', padding: '2px 6px' }}
                        onClick={(e) => { e.stopPropagation(); setActivePage('reports'); }}
                      >≡ REPORT</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Incident Detail */}
      {selected && (
        <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: '#ff0040' }}>{selected.id}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#7a7a9a' }}>{selected.threat}</div>
            <div style={{ flex: 1 }} />
            <button className="btn-ghost" style={{ fontSize: '10px' }} onClick={() => setSelected(null)}>✕ CLOSE</button>
          </div>

          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Risk Score', value: `${selected.riskScore}/100`, color: '#ff0040' },
                { label: 'Confidence', value: `${selected.confidence}%`, color: '#ff6600' },
                { label: 'Severity', value: selected.severity.toUpperCase(), color: SEVERITY_COLORS[selected.severity] },
                { label: 'Target', value: selected.target },
                { label: 'Files Affected', value: `${selected.filesAffected}`, color: '#ffaa00' },
                { label: 'Files Secured', value: `${selected.filesSecured}`, color: '#00ff88' },
              ].map((m) => (
                <div key={m.label} className="panel" style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>{m.label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: m.color || '#c8c8d8' }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="panel" style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Incident Timeline</div>
              {[
                { label: 'Detected', value: selected.detectedAt, color: '#ff0040' },
                { label: 'Contained', value: selected.containedAt || '—', color: '#ffaa00' },
                { label: 'Recovered', value: selected.recoveredAt || '—', color: '#00ff88' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.value !== '—' ? t.color : '#1a1a2e', border: `1px solid ${t.color}`, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#5a5a7a', width: '70px' }}>{t.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: t.value !== '—' ? '#c8c8d8' : '#3a3a5a' }}>{t.value}</span>
                </div>
              ))}
            </div>

            {/* Agents Involved */}
            <div className="panel" style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Agents Involved</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selected.agentsInvolved.map((a) => (
                  <span key={a} style={{ background: 'rgba(255,0,64,0.08)', border: '1px solid rgba(255,0,64,0.2)', color: '#ff0040', padding: '2px 8px', fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setActivePage('attack-replay')}>▶ ATTACK REPLAY</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setActivePage('reports')}>≡ VIEW REPORT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
