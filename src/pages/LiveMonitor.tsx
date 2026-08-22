import { useEffect, useState, useRef } from 'react';
import { useTrinetraStore } from '../store/useTrinetraStore';
import { LiveRiskGraph, MiniSparkline } from '../components/shared/LiveRiskGraph';
import { EventFeed } from '../components/shared/EventFeed';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const THREAT_DIST = [
  { name: 'Ransomware', value: 38, color: '#ff0040' },
  { name: 'Malware', value: 28, color: '#ff6600' },
  { name: 'Exfiltration', value: 18, color: '#ffaa00' },
  { name: 'Brute Force', value: 12, color: '#aa00ff' },
  { name: 'Other', value: 4, color: '#3a3a5a' },
];

const TOP_TARGETS = [
  { host: '192.168.103.112', count: 247 },
  { host: '192.168.165.60', count: 180 },
  { host: '192.168.168.1.25', count: 96 },
  { host: '192.168.31.25', count: 36 },
  { host: '168.31.0.73', count: 54 },
];

function useAutoData(base: number, range: number, ms = 1000) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setVal(base + (Math.random() - 0.5) * range), ms);
    return () => clearInterval(id);
  }, [base, range, ms]);
  return val;
}

function genHistory(base: number, range: number, n = 30) {
  return Array.from({ length: n }, () => ({ v: base + (Math.random() - 0.5) * range }));
}

export function LiveMonitor() {
  const riskScore = useTrinetraStore((s) => s.riskScore);
  const addRiskPoint = useTrinetraStore((s) => s.addRiskPoint);
  const simulationPhase = useTrinetraStore((s) => s.simulationPhase);
  const agents = useTrinetraStore((s) => s.agents);
  const activeThreats = Object.values(agents).filter((a) => a.state === 'detecting' || a.state === 'containing').length;

  const confidence = useAutoData(95.2, 2);
  const responseTime = '01:12:33';
  const fileActivity = useAutoData(1248, 200);
  const processActivity = useAutoData(1.2, 0.3);
  const networkActivity = useAutoData(0.88, 0.2);
  const ioVelocity = useAutoData(2.1, 0.4);

  const [fileHist, setFileHist] = useState(genHistory(1200, 300));
  const [procHist, setProcHist] = useState(genHistory(12, 4));
  const [netHist, setNetHist] = useState(genHistory(9, 3));
  const [ioHist, setIoHist] = useState(genHistory(21, 5));

  useEffect(() => {
    const id = setInterval(() => {
      setFileHist((h) => [...h.slice(-29), { v: fileActivity }]);
      setProcHist((h) => [...h.slice(-29), { v: processActivity * 10 }]);
      setNetHist((h) => [...h.slice(-29), { v: networkActivity * 10 }]);
      setIoHist((h) => [...h.slice(-29), { v: ioVelocity * 10 }]);
    }, 1000);
    return () => clearInterval(id);
  }, [fileActivity, processActivity, networkActivity, ioVelocity]);

  // Idle fluctuation
  useEffect(() => {
    if (simulationPhase !== 'idle') return;
    const id = setInterval(() => addRiskPoint(10 + Math.random() * 8, 'idle'), 2000);
    return () => clearInterval(id);
  }, [simulationPhase, addRiskPoint]);

  const riskColor = riskScore >= 80 ? '#ff0040' : riskScore >= 60 ? '#ff6600' : riskScore >= 40 ? '#ffaa00' : '#00ff88';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', overflow: 'hidden', background: '#050508' }} className="hud-grid">
      {/* Top metrics */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {[
          { label: 'Risk Score', value: Math.round(riskScore), unit: '', color: riskColor },
          { label: 'Active Threats', value: activeThreats, unit: '', color: activeThreats > 0 ? '#ff0040' : '#00ff88' },
          { label: 'Confidence', value: `${confidence.toFixed(1)}%`, unit: '', color: '#00aaff' },
          { label: 'Response Time', value: responseTime, unit: '', color: '#e8e8f0' },
          { label: 'File Activity', value: `${Math.round(fileActivity)}`, unit: '/s', color: '#ff6600' },
        ].map((m) => (
          <div key={m.label} className="panel" style={{ flex: 1, padding: '10px 12px' }}>
            <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: m.color, lineHeight: 1 }}>
              {m.value}<span style={{ fontSize: '10px', color: '#5a5a7a' }}>{m.unit}</span>
            </div>
          </div>
        ))}
        {/* Live badge */}
        <div className="panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
          <span className="live-badge" style={{ fontSize: '11px', padding: '4px 12px' }}>LIVE</span>
        </div>
      </div>

      {/* Middle: Risk Graph + Threat Distribution */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {/* Risk Graph */}
        <div className="panel panel-red-border" style={{ flex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #1a1a2e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 3, height: 10, background: '#ff0040', display: 'block' }} />
              <span className="panel-title">Live Risk Graph</span>
              <span className="live-badge">LIVE</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 700, color: riskColor }}>
              {Math.round(riskScore)}
            </div>
          </div>
          <LiveRiskGraph height={100} showThresholds />
        </div>

        {/* Threat Distribution Pie */}
        <div className="panel" style={{ width: '220px', flexShrink: 0 }}>
          <div style={{ padding: '5px 10px', borderBottom: '1px solid #1a1a2e' }}>
            <span className="panel-title">Threat Distribution</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px' }}>
            <div style={{ width: '90px', height: '90px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={THREAT_DIST} dataKey="value" innerRadius={25} outerRadius={42} paddingAngle={2}>
                    {THREAT_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0d0d14', border: '1px solid #1a1a2e', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ color: '#e8e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, padding: '0 6px' }}>
              {THREAT_DIST.map((d) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', fontSize: '9px', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, display: 'block' }} />
                    <span style={{ color: '#7a7a9a' }}>{d.name}</span>
                  </span>
                  <span style={{ color: d.color, fontWeight: 600 }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Targets */}
        <div className="panel" style={{ width: '200px', flexShrink: 0 }}>
          <div style={{ padding: '5px 10px', borderBottom: '1px solid #1a1a2e' }}><span className="panel-title">Top Targets</span></div>
          <div style={{ padding: '4px 8px' }}>
            {TOP_TARGETS.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '9px', fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: '#7a7a9a' }}>{t.host}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: `${(t.count / 247) * 50}px`, height: '2px', background: '#ff0040', opacity: 0.6 }} />
                  <span style={{ color: '#ff0040', fontWeight: 600 }}>{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: 4 mini charts + event feed */}
      <div style={{ display: 'flex', gap: '8px', flex: 1, minHeight: 0 }}>
        {/* Mini charts column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '520px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
            {[
              { label: 'File Activity', value: `${Math.round(fileActivity)} /s`, history: fileHist, color: '#ff0040' },
              { label: 'Process Activity', value: `${processActivity.toFixed(1)} GHz`, history: procHist, color: '#ff6600' },
            ].map((m) => (
              <div key={m.label} className="panel" style={{ flex: 1 }}>
                <div style={{ padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a2e' }}>
                  <span className="panel-title">{m.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: m.color, fontWeight: 600 }}>{m.value}</span>
                </div>
                <MiniSparkline data={m.history} color={m.color} height={50} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
            {[
              { label: 'Network Activity', value: `${networkActivity.toFixed(2)} Gbps`, history: netHist, color: '#00aaff' },
              { label: 'I/O Velocity', value: `${ioVelocity.toFixed(1)} MB/s`, history: ioHist, color: '#aa00ff' },
            ].map((m) => (
              <div key={m.label} className="panel" style={{ flex: 1 }}>
                <div style={{ padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1a2e' }}>
                  <span className="panel-title">{m.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: m.color, fontWeight: 600 }}>{m.value}</span>
                </div>
                <MiniSparkline data={m.history} color={m.color} height={50} />
              </div>
            ))}
          </div>
        </div>

        {/* Event Feed */}
        <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '5px 10px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span className="panel-title">Live Event Feed</span>
            <span className="live-badge">LIVE</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '6px 10px' }}>
            <EventFeed maxHeight="100%" showSeverity />
          </div>
        </div>
      </div>
    </div>
  );
}
