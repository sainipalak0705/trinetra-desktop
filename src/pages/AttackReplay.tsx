import { useEffect, useRef } from 'react';
import { useTrinetraStore, REPLAY_TIMELINE, ReplaySpeed } from '../store/useTrinetraStore';
import { LiveRiskGraph } from '../components/shared/LiveRiskGraph';
import { EventFeed } from '../components/shared/EventFeed';
import { AgentNetworkMap } from '../components/shared/AgentNetworkMap';

const TOTAL_DURATION = 161; // seconds

const AGENT_COLORS: Record<string, string> = {
  watchdog: '#ff0040', gatekeeper: '#ff6600', riskAnalyser: '#ffaa00',
  policyEngine: '#00aaff', enforcer: '#aa00ff', vaultKeeper: '#00ff88',
};

const STATE_COLORS: Record<string, string> = {
  idle: '#3a3a5a', monitoring: '#00ff88', active: '#00ff88',
  detecting: '#ffaa00', analysing: '#ff6600', deciding: '#ff6600',
  containing: '#ff0040', protecting: '#aa00ff', recovered: '#00ff88',
};

const TIMELINE_EVENTS = [
  { time: '00:04', label: 'Suspicious process detected', agent: 'WATCHDOG', color: '#ff0040' },
  { time: '00:12', label: 'Behaviour analysed', agent: 'RISK ANALYSER', color: '#ffaa00' },
  { time: '00:21', label: 'Threat classified — 97.4% confidence', agent: 'RISK ANALYSER', color: '#ffaa00' },
  { time: '00:38', label: 'Policy triggered', agent: 'POLICY ENGINE', color: '#00aaff' },
  { time: '00:51', label: 'Malicious process blocked', agent: 'ENFORCER', color: '#aa00ff' },
  { time: '01:17', label: 'Critical files secured', agent: 'VAULTKEEPER', color: '#00ff88' },
  { time: '02:41', label: 'System recovered', agent: 'SYSTEM', color: '#3a3a5a' },
];

// Replay risk curve: simulate 18→31→47→63→78→94→72→45→18→5
const RISK_CURVE = [
  { t: 0, v: 18 }, { t: 4, v: 31 }, { t: 12, v: 47 }, { t: 21, v: 63 },
  { t: 38, v: 78 }, { t: 51, v: 94 }, { t: 77, v: 72 }, { t: 110, v: 45 },
  { t: 140, v: 18 }, { t: 161, v: 5 },
];

function interpolateRisk(t: number): number {
  for (let i = 0; i < RISK_CURVE.length - 1; i++) {
    if (t >= RISK_CURVE[i].t && t <= RISK_CURVE[i + 1].t) {
      const p = (t - RISK_CURVE[i].t) / (RISK_CURVE[i + 1].t - RISK_CURVE[i].t);
      return RISK_CURVE[i].v + (RISK_CURVE[i + 1].v - RISK_CURVE[i].v) * p;
    }
  }
  return RISK_CURVE[RISK_CURVE.length - 1].v;
}

function genReplayHistory(upToTime: number) {
  const pts = [];
  for (let t = 0; t <= Math.min(upToTime, TOTAL_DURATION); t += 3) {
    pts.push({ time: `${t}`, value: interpolateRisk(t), phase: getPhaseAtTime(t) });
  }
  return pts;
}

function getPhaseAtTime(t: number): string {
  if (t < 4) return 'idle';
  if (t < 12) return 'detecting';
  if (t < 21) return 'analysing';
  if (t < 51) return 'deciding';
  if (t < 77) return 'containing';
  if (t < 140) return 'protecting';
  return 'recovered';
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function AttackReplay() {
  const replayProgress = useTrinetraStore((s) => s.replayProgress);
  const replayPlaying = useTrinetraStore((s) => s.replayPlaying);
  const replaySpeed = useTrinetraStore((s) => s.replaySpeed);
  const setReplayProgress = useTrinetraStore((s) => s.setReplayProgress);
  const setReplayPlaying = useTrinetraStore((s) => s.setReplayPlaying);
  const setReplaySpeed = useTrinetraStore((s) => s.setReplaySpeed);
  const resetReplay = useTrinetraStore((s) => s.resetReplay);
  const agents = useTrinetraStore((s) => s.agents);
  const addRiskPoint = useTrinetraStore((s) => s.addRiskPoint);
  const setAgentState = useTrinetraStore((s) => s.setAgentState);
  const setAlertState = useTrinetraStore((s) => s.setAlertState);
  const addEvent = useTrinetraStore((s) => s.addEvent);

  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Replay tick
  useEffect(() => {
    if (!replayPlaying) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    const tick = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = ((now - lastTimeRef.current) / 1000) * replaySpeed;
      lastTimeRef.current = now;

      const newProgress = Math.min(replayProgress + dt, TOTAL_DURATION);
      setReplayProgress(newProgress);

      // Apply timeline events
      REPLAY_TIMELINE.forEach((evt) => {
        const wasAfter = replayProgress <= evt.time;
        const isNow = newProgress >= evt.time;
        if (wasAfter && isNow) {
          if (evt.agentStateChanges) {
            Object.entries(evt.agentStateChanges).forEach(([k, v]) => setAgentState(k, v as import('../store/useTrinetraStore').AgentState));
          }
          if (evt.alertState) setAlertState(evt.alertState);
          // Add telemetry event
          const t = new Date();
          addEvent({ time: t.toTimeString().slice(0, 8), timestamp: Date.now(), agent: evt.agent, message: evt.label, severity: 'high' });
        }
      });

      // Update risk score
      const risk = interpolateRisk(newProgress);
      addRiskPoint(risk, getPhaseAtTime(newProgress));

      if (newProgress >= TOTAL_DURATION) {
        setReplayPlaying(false);
      } else {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); lastTimeRef.current = null; };
  }, [replayPlaying, replaySpeed]);

  const pct = (replayProgress / TOTAL_DURATION) * 100;
  const currentRisk = interpolateRisk(replayProgress);
  const riskColor = currentRisk >= 80 ? '#ff0040' : currentRisk >= 60 ? '#ff6600' : currentRisk >= 40 ? '#ffaa00' : '#00ff88';
  const replayHistory = genReplayHistory(replayProgress);
  const currentPhase = getPhaseAtTime(replayProgress);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const newT = pct * TOTAL_DURATION;
    setReplayProgress(newT);
    addRiskPoint(interpolateRisk(newT), getPhaseAtTime(newT));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden', background: '#050508' }} className="hud-grid">
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: '#ff0040', letterSpacing: '0.15em' }}>
            ATTACK REPLAY
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#5a5a7a', marginTop: '2px' }}>
            Incident #TR-4821 — RANSOMWARE &nbsp;|&nbsp; Target: Workstation-07 &nbsp;|&nbsp; Duration: 02:41
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#3a3a5a' }}>SEVERITY</span>
          <span style={{ background: 'rgba(255,0,64,0.15)', border: '1px solid rgba(255,0,64,0.4)', color: '#ff0040', padding: '2px 10px', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>CRITICAL</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#00aaff' }}>97.4% CONFIDENCE</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', gap: '0', overflow: 'hidden' }}>
        {/* LEFT: Timeline + Controls */}
        <div style={{ width: '260px', flexShrink: 0, borderRight: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column' }}>
          {/* Timeline Events */}
          <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
            <div style={{ fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Attack Timeline</div>
            {TIMELINE_EVENTS.map((evt, idx) => {
              const evtSeconds = timeToSeconds(evt.time);
              const isPast = replayProgress >= evtSeconds;
              const isCurrent = replayProgress >= evtSeconds &&
                (idx === TIMELINE_EVENTS.length - 1 || replayProgress < timeToSeconds(TIMELINE_EVENTS[idx + 1]?.time || '99:99'));
              return (
                <div
                  key={idx}
                  style={{ display: 'flex', gap: '8px', marginBottom: '12px', opacity: isPast ? 1 : 0.3, transition: 'opacity 0.3s', cursor: 'pointer' }}
                  onClick={() => setReplayProgress(evtSeconds)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: isPast ? evt.color : '#1a1a2e', border: `1px solid ${evt.color}`, boxShadow: isCurrent ? `0 0 8px ${evt.color}` : 'none', flexShrink: 0 }} />
                    {idx < TIMELINE_EVENTS.length - 1 && <div style={{ width: 1, height: '30px', background: isPast ? `${evt.color}40` : '#1a1a2e' }} />}
                  </div>
                  <div style={{ paddingBottom: '4px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#3a3a5a' }}>{evt.time}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: isPast ? '#c8c8d8' : '#3a3a5a', marginTop: '1px' }}>{evt.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: evt.color, marginTop: '1px', fontWeight: 600 }}>{evt.agent}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent States */}
          <div style={{ borderTop: '1px solid #1a1a2e', padding: '8px 10px', fontSize: '9px' }}>
            <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Agent Status</div>
            {Object.values(agents).map((agent) => (
              <div key={agent.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: AGENT_COLORS[agent.id] || '#3a3a5a', display: 'block', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#7a7a9a' }}>{agent.name}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', fontWeight: 600, color: STATE_COLORS[agent.state] || '#3a3a5a', letterSpacing: '0.06em' }}>
                  {agent.state.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Risk Graph + Network + Events */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Risk Graph */}
          <div style={{ flexShrink: 0, borderBottom: '1px solid #1a1a2e' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 12px', borderBottom: '1px solid #1a1a2e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 3, height: 10, background: '#ff0040', display: 'block' }} />
                <span className="panel-title">Live Risk Graph</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#5a5a7a', letterSpacing: '0.1em' }}>PHASE: <span style={{ color: '#ff6600' }}>{currentPhase.toUpperCase()}</span></div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 700, color: riskColor }}>{Math.round(currentRisk)}</div>
              </div>
            </div>
            <LiveRiskGraph height={100} showThresholds dataOverride={replayHistory} showTooltip={false} />
          </div>

          {/* Agent Network */}
          <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid #1a1a2e' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
              <AgentNetworkMap width={380} height={160} />
            </div>
            {/* Incident metrics panel */}
            <div style={{ width: '160px', flexShrink: 0, borderLeft: '1px solid #1a1a2e', padding: '10px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
              <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Quick Actions</div>
              <button className="btn-primary" style={{ width: '100%', marginBottom: '6px', fontSize: '9px', padding: '4px 8px' }}
                onClick={() => { useTrinetraStore.getState().setActivePage('incidents'); }}>
                OPEN INCIDENT
              </button>
              <button className="btn-secondary" style={{ width: '100%', marginBottom: '6px', fontSize: '9px', padding: '4px 8px' }}
                onClick={() => { useTrinetraStore.getState().setActivePage('live-monitor'); }}>
                LIVE MONITOR
              </button>
              <button className="btn-ghost" style={{ width: '100%', fontSize: '9px', padding: '4px 8px' }}
                onClick={() => { useTrinetraStore.getState().setActivePage('simulation-lab'); }}>
                SIMULATION
              </button>

              <div style={{ marginTop: '12px', borderTop: '1px solid #1a1a2e', paddingTop: '8px' }}>
                <StatPair label="Risk Score" value={`${Math.round(currentRisk)}/100`} color={riskColor} />
                <StatPair label="Files Affected" value="247" />
                <StatPair label="Progress" value={`${Math.round(pct)}%`} color="#00aaff" />
              </div>
            </div>
          </div>

          {/* Event Feed */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '5px 12px', borderBottom: '1px solid #1a1a2e', fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
              Telemetry Feed
            </div>
            <div style={{ flex: 1, overflow: 'hidden', padding: '6px 12px' }}>
              <EventFeed maxHeight="100%" />
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div style={{ borderTop: '1px solid #1a1a2e', padding: '10px 14px', background: '#07070d', flexShrink: 0 }}>
        {/* Timeline scrubber */}
        <div style={{ marginBottom: '10px' }}>
          <div
            className="timeline-bar"
            onClick={handleTimelineClick}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <div className="timeline-bar-fill" style={{ width: `${pct}%` }} />
            {/* Event markers */}
            {TIMELINE_EVENTS.map((evt, i) => {
              const evtPct = (timeToSeconds(evt.time) / TOTAL_DURATION) * 100;
              return (
                <div key={i} style={{ position: 'absolute', left: `${evtPct}%`, top: '-4px', width: 2, height: 11, background: evt.color, opacity: 0.7, cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); setReplayProgress(timeToSeconds(evt.time)); }} />
              );
            })}
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Play/Pause */}
          <button
            className="btn-primary"
            style={{ minWidth: '80px' }}
            onClick={() => setReplayPlaying(!replayPlaying)}
          >
            {replayPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button className="btn-ghost" onClick={resetReplay}>↺ RESET</button>

          {/* Speed selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {([0.5, 1, 2, 4] as ReplaySpeed[]).map((s) => (
              <button
                key={s}
                className={`btn-ghost ${replaySpeed === s ? 'btn-primary' : ''}`}
                style={replaySpeed === s ? { background: 'rgba(255,0,64,0.15)', borderColor: 'rgba(255,0,64,0.4)', color: '#ff0040' } : {}}
                onClick={() => setReplaySpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Time display */}
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#c8c8d8', fontWeight: 600, letterSpacing: '0.1em' }}>
            {formatTime(replayProgress)} / {formatTime(TOTAL_DURATION)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPair({ label, value, color = '#9a9ab8' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ fontSize: '8px', color: '#3a3a5a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function timeToSeconds(time: string): number {
  const [m, s] = time.split(':').map(Number);
  return m * 60 + s;
}
