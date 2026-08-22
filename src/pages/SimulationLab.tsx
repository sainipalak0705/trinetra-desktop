import { useState } from 'react';
import { useTrinetraStore, AttackType } from '../store/useTrinetraStore';
import { motion, AnimatePresence } from 'framer-motion';

const ATTACK_TYPES: { id: AttackType; label: string; icon: string; desc: string; severity: string; color: string }[] = [
  { id: 'ransomware', label: 'RANSOMWARE', icon: '🔒', desc: 'Simulates file encryption and extortion attack patterns', severity: 'CRITICAL', color: '#ff0040' },
  { id: 'malware', label: 'MALWARE', icon: '🦠', desc: 'Simulates malicious software installation and execution', severity: 'CRITICAL', color: '#ff6600' },
  { id: 'data_exfiltration', label: 'DATA EXFILTRATION', icon: '📤', desc: 'Simulates unauthorized data transfer to external systems', severity: 'HIGH', color: '#ffaa00' },
  { id: 'brute_force', label: 'BRUTE FORCE', icon: '🔨', desc: 'Simulates credential stuffing and password attack patterns', severity: 'HIGH', color: '#aa00ff' },
  { id: 'suspicious_process', label: 'SUSPICIOUS PROCESS', icon: '⚠', desc: 'Simulates suspicious system process behaviour detection', severity: 'MEDIUM', color: '#00aaff' },
];

const TARGETS = ['Workstation-07', 'Workstation-03', 'Workstation-02', 'Server-01', 'Domain-Controller'];
const DURATIONS = ['30 Seconds', '1 Minute', '2 Minutes', '5 Minutes'];
const INTENSITIES = ['Low', 'Medium', 'High', 'Critical'];

const AGENT_INIT_STATES = [
  { label: 'WATCHDOG', key: 'watchdog' },
  { label: 'GATEKEEPER', key: 'gatekeeper' },
  { label: 'RISK ANALYSER', key: 'riskAnalyser' },
  { label: 'POLICY ENGINE', key: 'policyEngine' },
  { label: 'ENFORCER', key: 'enforcer' },
  { label: 'VAULTKEEPER', key: 'vaultKeeper' },
];

export function SimulationLab() {
  const [selectedAttack, setSelectedAttack] = useState<AttackType>('ransomware');
  const [target, setTarget] = useState('Workstation-07');
  const [duration, setDuration] = useState('5 Minutes');
  const [intensity, setIntensity] = useState('High');
  const [fileCount, setFileCount] = useState('500');
  const [networkEnabled, setNetworkEnabled] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [started, setStarted] = useState(false);

  const startSimulation = useTrinetraStore((s) => s.startSimulation);
  const isSimulating = useTrinetraStore((s) => s.isSimulating);
  const simulationPhase = useTrinetraStore((s) => s.simulationPhase);
  const setActivePage = useTrinetraStore((s) => s.setActivePage);
  const agents = useTrinetraStore((s) => s.agents);

  const selectedAttackInfo = ATTACK_TYPES.find((a) => a.id === selectedAttack)!;

  const handleStart = () => {
    if (isSimulating) return;
    setIsStarting(true);
    setTimeout(() => {
      startSimulation(selectedAttack, target);
      setStarted(true);
      setIsStarting(false);
    }, 1500);
  };

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', background: '#050508' }} className="hud-grid">
      {/* LEFT: Attack Type Selection */}
      <div style={{ width: '250px', flexShrink: 0, borderRight: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a2e', flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: '#3a3a5a', textTransform: 'uppercase' }}>SELECT ATTACK TYPE</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {ATTACK_TYPES.map((attack) => (
            <div
              key={attack.id}
              className={`attack-type-card ${selectedAttack === attack.id ? 'selected' : ''}`}
              style={{ marginBottom: '6px', position: 'relative' }}
              onClick={() => !isSimulating && setSelectedAttack(attack.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '16px' }}>{attack.icon}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: selectedAttack === attack.id ? attack.color : '#7a7a9a', letterSpacing: '0.08em' }}>
                  {attack.label}
                </span>
              </div>
              <div style={{ fontSize: '9px', color: '#3a3a5a', lineHeight: 1.5, marginBottom: '6px' }}>{attack.desc}</div>
              <span style={{
                background: `${attack.color}15`,
                border: `1px solid ${attack.color}30`,
                color: attack.color,
                padding: '1px 6px',
                fontSize: '8px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
              }}>
                {attack.severity}
              </span>
              {selectedAttack === attack.id && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: attack.color }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE: Simulation Settings */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1a1a2e', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a2e', flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: '#3a3a5a', textTransform: 'uppercase' }}>SIMULATION SETTINGS</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
          {[
            { label: 'Target', options: TARGETS, value: target, onChange: setTarget },
            { label: 'Duration', options: DURATIONS, value: duration, onChange: setDuration },
            { label: 'Intensity', options: INTENSITIES, value: intensity, onChange: setIntensity },
          ].map((setting) => (
            <div key={setting.label} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>{setting.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {setting.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => !isSimulating && setting.onChange(opt)}
                    style={{
                      background: setting.value === opt ? 'rgba(255,0,64,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${setting.value === opt ? 'rgba(255,0,64,0.4)' : '#1a1a2e'}`,
                      color: setting.value === opt ? '#ff0040' : '#5a5a7a',
                      padding: '4px 12px',
                      fontSize: '10px',
                      fontFamily: 'JetBrains Mono, monospace',
                      cursor: isSimulating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* File Count */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>File Count</div>
            <input
              type="number"
              value={fileCount}
              onChange={(e) => setFileCount(e.target.value)}
              disabled={isSimulating}
              style={{
                background: '#0a0a0f', border: '1px solid #1a1a2e', color: '#c8c8d8',
                padding: '5px 10px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
                outline: 'none', width: '120px',
              }}
            />
          </div>

          {/* Network Activity */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', color: '#3a3a5a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Network Activity</div>
            <button
              onClick={() => !isSimulating && setNetworkEnabled(!networkEnabled)}
              style={{
                background: networkEnabled ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${networkEnabled ? 'rgba(0,255,136,0.3)' : '#1a1a2e'}`,
                color: networkEnabled ? '#00ff88' : '#5a5a7a',
                padding: '4px 12px',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                cursor: isSimulating ? 'not-allowed' : 'pointer',
              }}
            >
              {networkEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Info */}
          <div style={{ background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.15)', padding: '10px 12px', marginTop: '8px' }}>
            <div style={{ fontSize: '9px', color: '#ffaa00', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginBottom: '4px' }}>⚠ SIMULATION MODE</div>
            <div style={{ fontSize: '9px', color: '#5a5a7a', lineHeight: 1.6 }}>
              All simulations are completely safe and contained within TRINETRA. No real processes are executed, no real files are accessed, and no real network connections are made.
            </div>
          </div>

          {/* Navigation shortcuts */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-ghost" style={{ fontSize: '9px', padding: '4px 10px' }} onClick={() => setActivePage('attack-replay')}>▶ ATTACK REPLAY</button>
            <button className="btn-ghost" style={{ fontSize: '9px', padding: '4px 10px' }} onClick={() => setActivePage('live-monitor')}>◉ LIVE MONITOR</button>
            <button className="btn-ghost" style={{ fontSize: '9px', padding: '4px 10px' }} onClick={() => setActivePage('recovery')}>✦ RECOVERY</button>
          </div>
        </div>

        {/* START button */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #1a1a2e', flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            {isSimulating ? (
              <motion.div
                key="simulating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(255,170,0,0.1)',
                  border: '1px solid rgba(255,170,0,0.3)',
                  color: '#ffaa00',
                  padding: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: '0.12em',
                }}
              >
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  ⚡ SIMULATION RUNNING — {simulationPhase.toUpperCase()}
                </motion.span>
              </motion.div>
            ) : isStarting ? (
              <motion.div
                key="starting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(255,0,64,0.1)',
                  border: '1px solid rgba(255,0,64,0.3)',
                  color: '#ff0040',
                  padding: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: '0.12em',
                }}
              >
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>
                  INITIALIZING SIMULATION...
                </motion.span>
              </motion.div>
            ) : (
              <motion.button
                key="start"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  letterSpacing: '0.2em',
                  background: 'rgba(255,0,64,0.12)',
                  borderColor: 'rgba(255,0,64,0.5)',
                }}
                onClick={handleStart}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                ▶ START SIMULATION
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: Agent Initialization Status */}
      <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a2e', flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: '#3a3a5a', textTransform: 'uppercase' }}>AGENT INITIALIZATION</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px' }}>
          {AGENT_INIT_STATES.map((agent) => {
            const agentData = agents[agent.key];
            const isActive = agentData?.state !== 'idle' && agentData?.state !== 'monitoring';
            const stateColor: Record<string, string> = {
              idle: '#3a3a5a', monitoring: '#00ff88', active: '#00ff88',
              detecting: '#ffaa00', analysing: '#ff6600', deciding: '#ff6600',
              containing: '#ff0040', protecting: '#aa00ff', recovered: '#00ff88',
              blocked: '#ff0040',
            };
            const agentColor = stateColor[agentData?.state || 'idle'] || '#3a3a5a';
            return (
              <div key={agent.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: agentColor, display: 'block', boxShadow: isActive ? `0 0 6px ${agentColor}` : 'none' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#7a7a9a' }}>{agent.label}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', fontWeight: 600, color: agentColor, letterSpacing: '0.08em' }}>
                  {agentData?.state?.toUpperCase() || 'IDLE'}
                </span>
              </div>
            );
          })}

          {/* Attack summary */}
          {started && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '16px', background: 'rgba(255,0,64,0.05)', border: '1px solid rgba(255,0,64,0.2)', padding: '10px' }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#ff0040', fontWeight: 700, marginBottom: '8px' }}>ACTIVE SIMULATION</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#5a5a7a', lineHeight: 1.8 }}>
                <div>Attack: <span style={{ color: selectedAttackInfo.color }}>{selectedAttackInfo.label}</span></div>
                <div>Target: <span style={{ color: '#c8c8d8' }}>{target}</span></div>
                <div>Phase: <span style={{ color: '#ffaa00' }}>{simulationPhase.toUpperCase()}</span></div>
              </div>
            </motion.div>
          )}

          <div style={{ marginTop: '16px' }}>
            <button className="btn-ghost" style={{ width: '100%', fontSize: '9px', marginBottom: '6px' }} onClick={() => setActivePage('command-center')}>
              ⬡ COMMAND CENTER
            </button>
            <button className="btn-ghost" style={{ width: '100%', fontSize: '9px' }} onClick={() => setActivePage('live-monitor')}>
              ◉ LIVE MONITOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
