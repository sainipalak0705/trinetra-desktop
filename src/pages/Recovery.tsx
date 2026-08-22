import { motion } from 'framer-motion';
import { useTrinetraStore } from '../store/useTrinetraStore';

const STEPS = [
  { id: 0, label: 'Threat Isolated', icon: '🔒', desc: 'Ransomware process quarantined and isolated from system' },
  { id: 1, label: 'Malicious Process Terminated', icon: '⚡', desc: 'PID 7721 terminated — 0 remaining instances' },
  { id: 2, label: 'Network Restricted', icon: '🛡', desc: 'Lateral movement blocked — firewall rules applied' },
  { id: 3, label: 'Critical Files Secured', icon: '📦', desc: '247 files backed up to encrypted vault storage' },
  { id: 4, label: 'Backup Verified', icon: '✅', desc: 'SHA-256 integrity check passed for all 247 files' },
  { id: 5, label: 'System Restored', icon: '🔄', desc: 'System restored to clean state — all services nominal' },
];

export function Recovery() {
  const recoveryProgress = useTrinetraStore((s) => s.recoveryProgress);
  const recoverySteps = useTrinetraStore((s) => s.recoverySteps);
  const filesSecured = useTrinetraStore((s) => s.filesSecured);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);
  const activeIncident = useTrinetraStore((s) => s.activeIncident);

  const doneCount = recoverySteps.filter((s) => s.done).length;
  const isComplete = doneCount === recoverySteps.length && doneCount > 0;

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', background: '#050508', gap: '0' }} className="hud-grid">
      {/* LEFT: Recovery Steps */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1a1a2e', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a2e', flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#e8e8f0' }}>RECOVERY</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#3a3a5a', marginTop: '2px' }}>
            {activeIncident ? `Incident ${activeIncident.id} — ${activeIncident.threat}` : 'TR-4821 — RANSOMWARE — Workstation-07'}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 14px' }}>
          {STEPS.map((step, idx) => {
            const done = recoverySteps[idx]?.done ?? false;
            const inProgress = !done && idx === doneCount && doneCount < recoverySteps.length;
            return (
              <motion.div
                key={step.id}
                className="recovery-step"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: done ? 1 : 0.35 }}
                style={{ gap: '14px', padding: '12px 0' }}
              >
                {/* Icon */}
                <div
                  className="recovery-step-icon"
                  style={{
                    background: done ? 'rgba(0,255,136,0.1)' : inProgress ? 'rgba(255,170,0,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${done ? '#00ff88' : inProgress ? '#ffaa00' : '#1a1a2e'}`,
                    fontSize: '14px',
                  }}
                >
                  {done ? '✓' : inProgress ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'block' }}
                    >↻</motion.span>
                  ) : <span style={{ color: '#1a1a2e' }}>○</span>}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: done ? '#00ff88' : inProgress ? '#ffaa00' : '#3a3a5a',
                    marginBottom: '3px',
                  }}>
                    {step.label}
                    {done && <span style={{ marginLeft: '8px', color: '#00ff88' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: '10px', color: done ? '#5a5a7a' : '#2a2a3a', fontFamily: 'JetBrains Mono, monospace' }}>
                    {step.desc}
                  </div>
                </div>

                {/* Status badge */}
                {done && (
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#00ff88', fontWeight: 700, letterSpacing: '0.1em' }}>
                    COMPLETED
                  </div>
                )}
                {inProgress && (
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#ffaa00', fontWeight: 700, letterSpacing: '0.1em', animation: 'blink 1s step-end infinite' }}>
                    IN PROGRESS
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Recovery Stats */}
      <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Recovery Dial */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Circle Progress */}
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r="58" fill="none" stroke="#1a1a2e" strokeWidth="6" />
              <motion.circle
                cx="70" cy="70" r="58"
                fill="none"
                stroke={isComplete ? '#00ff88' : recoveryProgress > 0 ? '#ffaa00' : '#1a1a2e'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - recoveryProgress / 100) }}
                transition={{ duration: 0.5 }}
                style={{ filter: isComplete ? 'drop-shadow(0 0 8px #00ff88)' : recoveryProgress > 0 ? 'drop-shadow(0 0 6px #ffaa00)' : 'none' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '28px',
                fontWeight: 700,
                color: isComplete ? '#00ff88' : recoveryProgress > 0 ? '#ffaa00' : '#3a3a5a',
                lineHeight: 1,
              }}>
                {Math.round(recoveryProgress)}%
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: isComplete ? '14px' : '11px',
            fontWeight: 700,
            color: isComplete ? '#00ff88' : recoveryProgress > 0 ? '#ffaa00' : '#3a3a5a',
            letterSpacing: '0.15em',
            marginTop: '10px',
            textAlign: 'center',
            textShadow: isComplete ? '0 0 20px rgba(0,255,136,0.4)' : 'none',
          }}>
            {isComplete ? '# 100% SYSTEM RECOVERED' : recoveryProgress > 0 ? 'RECOVERY IN PROGRESS...' : 'AWAITING RECOVERY'}
          </div>
          {isComplete && (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#5a5a7a', marginTop: '6px', textAlign: 'center' }}>
              All systems secure and operating normally
            </div>
          )}
        </div>

        {/* Recovery Details */}
        <div style={{ padding: '12px 14px', flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Recovery Details</div>
          {[
            { label: 'Files Recovered', value: `${filesSecured > 0 ? filesSecured : 0} / 247`, color: '#00ff88' },
            { label: 'Files Secured', value: filesSecured > 0 ? '1,842' : '0', color: '#00aaff' },
            { label: 'Data Integrity', value: isComplete ? '100%' : recoveryProgress > 50 ? `${Math.round(recoveryProgress)}%` : '—', color: isComplete ? '#00ff88' : '#ffaa00' },
            { label: 'Recovery Time', value: activeIncident?.recoveredAt ? '02:41' : '—', color: '#e8e8f0' },
            { label: 'Backup Used', value: '22 May 2025 10:40', color: '#7a7a9a' },
            { label: 'Status', value: isComplete ? 'Successful' : recoveryProgress > 0 ? 'In Progress' : 'Pending', color: isComplete ? '#00ff88' : recoveryProgress > 0 ? '#ffaa00' : '#3a3a5a' },
          ].map((m) => (
            <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '10px', color: '#5a5a7a', fontFamily: 'JetBrains Mono, monospace' }}>{m.label}</span>
              <span style={{ fontSize: '11px', color: m.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Action */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #1a1a2e' }}>
          <button
            className={isComplete ? 'btn-green' : 'btn-secondary'}
            style={{ width: '100%', marginBottom: '6px' }}
            onClick={() => setActivePage('reports')}
          >
            {isComplete ? '≡ VIEW RECOVERY REPORT' : '≡ GENERATE REPORT'}
          </button>
          {!isComplete && recoveryProgress === 0 && (
            <button
              className="btn-ghost"
              style={{ width: '100%', fontSize: '10px' }}
              onClick={() => setActivePage('simulation-lab')}
            >
              ⚗ RUN SIMULATION
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
