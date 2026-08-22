import { motion, AnimatePresence } from 'framer-motion';
import { useTrinetraStore } from '../../store/useTrinetraStore';

export function CriticalAlert() {
  const alertState = useTrinetraStore((s) => s.alertState);
  const activeIncident = useTrinetraStore((s) => s.activeIncident);
  const dismissAlert = useTrinetraStore((s) => s.dismissAlert);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);

  const isVisible = alertState !== 'none';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="alert-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background pulse */}
          {alertState === 'critical' && (
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,0,64,0.04)',
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          <motion.div
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#0d0d14',
              border: `1px solid ${
                alertState === 'critical' ? 'rgba(255,0,64,0.6)' :
                alertState === 'contained' ? 'rgba(255,170,0,0.5)' :
                'rgba(0,255,136,0.5)'
              }`,
              padding: '32px',
              position: 'relative',
              boxShadow: alertState === 'critical'
                ? '0 0 60px rgba(255,0,64,0.2), 0 0 120px rgba(255,0,64,0.05)'
                : alertState === 'contained'
                ? '0 0 60px rgba(255,170,0,0.15)'
                : '0 0 60px rgba(0,255,136,0.15)',
            }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Corner accents */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTop: '2px solid', borderLeft: '2px solid', borderColor: alertState === 'critical' ? '#ff0040' : alertState === 'contained' ? '#ffaa00' : '#00ff88' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTop: '2px solid', borderRight: '2px solid', borderColor: alertState === 'critical' ? '#ff0040' : alertState === 'contained' ? '#ffaa00' : '#00ff88' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderBottom: '2px solid', borderLeft: '2px solid', borderColor: alertState === 'critical' ? '#ff0040' : alertState === 'contained' ? '#ffaa00' : '#00ff88' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottom: '2px solid', borderRight: '2px solid', borderColor: alertState === 'critical' ? '#ff0040' : alertState === 'contained' ? '#ffaa00' : '#00ff88' }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {alertState === 'critical' && (
                <>
                  <motion.div
                    style={{ fontSize: '32px', marginBottom: '8px' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🔴
                  </motion.div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: '#ff0040', letterSpacing: '0.15em', textShadow: '0 0 20px rgba(255,0,64,0.5)' }}>
                    CRITICAL THREAT DETECTED
                  </div>
                  <div style={{ color: '#7a7a9a', fontSize: '12px', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                    IMMEDIATE RESPONSE REQUIRED
                  </div>
                </>
              )}
              {alertState === 'contained' && (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🟡</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: '#ffaa00', letterSpacing: '0.15em' }}>
                    ✓ THREAT CONTAINED
                  </div>
                  <div style={{ color: '#7a7a9a', fontSize: '12px', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                    RECOVERY IN PROGRESS
                  </div>
                </>
              )}
              {alertState === 'recovered' && (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: '#00ff88', letterSpacing: '0.15em', textShadow: '0 0 20px rgba(0,255,136,0.4)' }}>
                    ✓ SYSTEM RECOVERED
                  </div>
                  <div style={{ color: '#7a7a9a', fontSize: '12px', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                    ALL SYSTEMS NOMINAL
                  </div>
                </>
              )}
            </div>

            {/* Incident details */}
            {activeIncident && (
              <div style={{
                background: '#080810',
                border: '1px solid #1a1a2e',
                padding: '16px',
                marginBottom: '24px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <MetricRow label="Incident" value={activeIncident.id} color="#ff0040" />
                  <MetricRow label="Threat" value={activeIncident.threat} color="#ff0040" />
                  <MetricRow label="Target" value={activeIncident.target} />
                  <MetricRow label="Severity" value={activeIncident.severity.toUpperCase()} color={
                    activeIncident.severity === 'critical' ? '#ff0040' :
                    activeIncident.severity === 'high' ? '#ff6600' : '#ffaa00'
                  } />
                  {alertState === 'critical' && (
                    <>
                      <MetricRow label="Risk Score" value={`${activeIncident.riskScore}/100`} color="#ff0040" />
                      <MetricRow label="Confidence" value={`${activeIncident.confidence}%`} color="#ff6600" />
                      <MetricRow label="Files Affected" value={`${activeIncident.filesAffected}`} color="#ffaa00" />
                    </>
                  )}
                  {alertState === 'recovered' && (
                    <>
                      <MetricRow label="Files Secured" value={`${activeIncident.filesSecured}/${activeIncident.filesAffected}`} color="#00ff88" />
                      <MetricRow label="Status" value="RECOVERED" color="#00ff88" />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {alertState === 'critical' && (
                <>
                  <button
                    className="btn-primary"
                    onClick={() => { setActivePage('incidents'); dismissAlert(); }}
                  >
                    OPEN INCIDENT
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => { setActivePage('attack-replay'); dismissAlert(); }}
                  >
                    ATTACK REPLAY
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => { setActivePage('command-center'); dismissAlert(); }}
                  >
                    VIEW RESPONSE
                  </button>
                </>
              )}
              {alertState === 'contained' && (
                <>
                  <button
                    className="btn-primary"
                    style={{ borderColor: 'rgba(255,170,0,0.5)', color: '#ffaa00' }}
                    onClick={() => { setActivePage('recovery'); dismissAlert(); }}
                  >
                    VIEW RECOVERY
                  </button>
                  <button className="btn-secondary" onClick={dismissAlert}>DISMISS</button>
                </>
              )}
              {alertState === 'recovered' && (
                <>
                  <button
                    className="btn-green"
                    onClick={() => { setActivePage('reports'); dismissAlert(); }}
                  >
                    VIEW REPORT
                  </button>
                  <button className="btn-secondary" onClick={dismissAlert}>DISMISS</button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetricRow({ label, value, color = '#9a9ab8' }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
      <div style={{ color, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
