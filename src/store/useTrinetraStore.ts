import { create } from 'zustand';

// ─── Types ─────────────────────────────────────────────────────────────
export type AgentState =
  | 'idle'
  | 'detecting'
  | 'analysing'
  | 'deciding'
  | 'containing'
  | 'protecting'
  | 'recovered'
  | 'monitoring'
  | 'active'
  | 'blocked';

export type SimulationPhase =
  | 'idle'
  | 'detecting'
  | 'analysing'
  | 'deciding'
  | 'containing'
  | 'protecting'
  | 'recovered';

export type AlertState = 'none' | 'critical' | 'contained' | 'recovered';
export type ReplaySpeed = 0.5 | 1 | 2 | 4;
export type AttackType =
  | 'ransomware'
  | 'malware'
  | 'data_exfiltration'
  | 'brute_force'
  | 'suspicious_process';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface TelemetryEvent {
  id: string;
  time: string;
  timestamp: number;
  agent: string;
  message: string;
  severity: Severity;
}

export interface Incident {
  id: string;
  threat: string;
  severity: Severity;
  target: string;
  detectedAt: string;
  containedAt?: string;
  recoveredAt?: string;
  status: 'detected' | 'contained' | 'recovered';
  riskScore: number;
  confidence: number;
  filesAffected: number;
  filesSecured: number;
  agentsInvolved: string[];
}

export interface FileEvent {
  id: string;
  name: string;
  path: string;
  status: 'modified' | 'encrypted' | 'secured' | 'recovered';
  timestamp: string;
  size: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  state: AgentState;
  eventsProcessed: number;
  threatsHandled: number;
  lastAction: string;
  currentActivity: string;
  uptime: string;
  color: string;
}

export interface RiskDataPoint {
  time: string;
  value: number;
  phase: string;
}

export interface FileMetrics {
  modRate: number;
  ioVelocity: number;
  entropy: number;
  processAnomaly: number;
  networkActivity: number;
}

// ─── Mock Incidents ─────────────────────────────────────────────────────
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'TR-4821',
    threat: 'Ransomware',
    severity: 'critical',
    target: 'Workstation-07',
    detectedAt: '22 May 2025 10:42',
    containedAt: '22 May 2025 10:43',
    recoveredAt: '22 May 2025 10:45',
    status: 'recovered',
    riskScore: 94,
    confidence: 97.4,
    filesAffected: 247,
    filesSecured: 247,
    agentsInvolved: ['WATCHDOG', 'RISK ANALYSER', 'POLICY ENGINE', 'ENFORCER', 'VAULTKEEPER'],
  },
  {
    id: 'TR-4820',
    threat: 'Malware',
    severity: 'critical',
    target: 'Workstation-03',
    detectedAt: '22 May 2025 09:15',
    containedAt: '22 May 2025 09:16',
    recoveredAt: '22 May 2025 09:18',
    status: 'recovered',
    riskScore: 82,
    confidence: 94.1,
    filesAffected: 89,
    filesSecured: 89,
    agentsInvolved: ['WATCHDOG', 'GATEKEEPER', 'ENFORCER'],
  },
  {
    id: 'TR-4786',
    threat: 'Data Exfiltration',
    severity: 'high',
    target: 'Workstation-02',
    detectedAt: '21 May 2025 13:22',
    containedAt: '21 May 2025 13:23',
    recoveredAt: '21 May 2025 13:28',
    status: 'recovered',
    riskScore: 76,
    confidence: 91.2,
    filesAffected: 134,
    filesSecured: 134,
    agentsInvolved: ['GATEKEEPER', 'POLICY ENGINE', 'VAULTKEEPER'],
  },
  {
    id: 'TR-4761',
    threat: 'Suspicious Process',
    severity: 'medium',
    target: 'Workstation-09',
    detectedAt: '20 May 2025 21:43',
    containedAt: '20 May 2025 21:44',
    status: 'contained',
    riskScore: 58,
    confidence: 84.6,
    filesAffected: 12,
    filesSecured: 12,
    agentsInvolved: ['WATCHDOG', 'ENFORCER'],
  },
  {
    id: 'TR-4742',
    threat: 'Ransomware',
    severity: 'critical',
    target: 'Workstation-01',
    detectedAt: '20 May 2025 11:55',
    containedAt: '20 May 2025 11:57',
    recoveredAt: '20 May 2025 12:04',
    status: 'recovered',
    riskScore: 91,
    confidence: 96.8,
    filesAffected: 312,
    filesSecured: 312,
    agentsInvolved: ['WATCHDOG', 'RISK ANALYSER', 'POLICY ENGINE', 'ENFORCER', 'VAULTKEEPER'],
  },
];

// ─── Mock File Events ────────────────────────────────────────────────────
export const MOCK_FILES: FileEvent[] = [
  { id: 'f1', name: 'budget.xlsx', path: 'C:\\Users\\Admin\\Documents\\', status: 'encrypted', timestamp: '22 May 2025 10:43', size: '34 KB' },
  { id: 'f2', name: 'report.docx', path: 'C:\\Users\\Admin\\Documents\\', status: 'secured', timestamp: '22 May 2025 10:43', size: '2.1 MB' },
  { id: 'f3', name: 'data.pdf', path: 'C:\\Users\\Admin\\Documents\\', status: 'modified', timestamp: '22 May 2025 10:41', size: '780 KB' },
  { id: 'f4', name: 'project.pptx', path: 'C:\\Users\\Admin\\Documents\\', status: 'secured', timestamp: '22 May 2025 10:42', size: '12.4 MB' },
  { id: 'f5', name: 'photo.jpg', path: 'C:\\Users\\Admin\\Pictures\\', status: 'recovered', timestamp: '22 May 2025 10:44', size: '3.8 MB' },
  { id: 'f6', name: 'invoice.xlsx', path: 'C:\\Users\\Admin\\Documents\\', status: 'secured', timestamp: '22 May 2025 10:43', size: '156 KB' },
  { id: 'f7', name: 'backup.zip', path: 'C:\\Users\\Admin\\Backup\\', status: 'secured', timestamp: '22 May 2025 10:43', size: '2 GB' },
  { id: 'f8', name: 'config.sys', path: 'C:\\Windows\\System32\\', status: 'modified', timestamp: '22 May 2025 10:41', size: '4 KB' },
];

// ─── Replay Timeline ─────────────────────────────────────────────────────
export interface ReplayEvent {
  time: number; // seconds from start
  label: string;
  agent: string;
  agentStateChanges?: Partial<Record<string, AgentState>>;
  riskScore?: number;
  phase?: SimulationPhase;
  alertState?: AlertState;
}

export const REPLAY_TIMELINE: ReplayEvent[] = [
  { time: 4, label: 'Suspicious process detected', agent: 'WATCHDOG', agentStateChanges: { watchdog: 'detecting' }, riskScore: 31, phase: 'detecting' },
  { time: 12, label: 'Behaviour analysed', agent: 'RISK ANALYSER', agentStateChanges: { riskAnalyser: 'analysing' }, riskScore: 47, phase: 'analysing' },
  { time: 21, label: 'Threat classified — 97.4% confidence', agent: 'RISK ANALYSER', agentStateChanges: { riskAnalyser: 'deciding' }, riskScore: 63, phase: 'deciding', alertState: 'critical' },
  { time: 38, label: 'Policy triggered', agent: 'POLICY ENGINE', agentStateChanges: { policyEngine: 'deciding' }, riskScore: 78 },
  { time: 51, label: 'Malicious process blocked', agent: 'ENFORCER', agentStateChanges: { enforcer: 'containing', policyEngine: 'containing' }, riskScore: 94, phase: 'containing' },
  { time: 77, label: 'Critical files secured', agent: 'VAULTKEEPER', agentStateChanges: { vaultKeeper: 'protecting', enforcer: 'protecting' }, riskScore: 72, phase: 'protecting', alertState: 'contained' },
  { time: 161, label: 'System recovered', agent: 'SYSTEM', agentStateChanges: { watchdog: 'recovered', gatekeeper: 'recovered', riskAnalyser: 'recovered', policyEngine: 'recovered', enforcer: 'recovered', vaultKeeper: 'recovered' }, riskScore: 5, phase: 'recovered', alertState: 'recovered' },
];

// ─── Initial Agent Infos ─────────────────────────────────────────────────
const initialAgents: Record<string, AgentInfo> = {
  watchdog: { id: 'watchdog', name: 'WATCHDOG', state: 'monitoring', eventsProcessed: 14205, threatsHandled: 23, lastAction: 'Monitoring system behaviour', currentActivity: 'Monitoring system behaviour', uptime: '99.8%', color: '#ff0040' },
  gatekeeper: { id: 'gatekeeper', name: 'GATEKEEPER', state: 'active', eventsProcessed: 8612, threatsHandled: 198, lastAction: 'Filtering network traffic', currentActivity: 'Filtering network traffic', uptime: '99.9%', color: '#ff6600' },
  riskAnalyser: { id: 'riskAnalyser', name: 'RISK ANALYSER', state: 'active', eventsProcessed: 9812, threatsHandled: 221, lastAction: 'Analysing behaviour patterns', currentActivity: 'Analysing behaviour patterns', uptime: '99.7%', color: '#ffaa00' },
  policyEngine: { id: 'policyEngine', name: 'POLICY ENGINE', state: 'active', eventsProcessed: 6321, threatsHandled: 145, lastAction: 'Evaluating containment rules', currentActivity: 'Evaluating containment rules', uptime: '100%', color: '#00aaff' },
  enforcer: { id: 'enforcer', name: 'ENFORCER', state: 'active', eventsProcessed: 7654, threatsHandled: 186, lastAction: 'Monitoring and enforcing', currentActivity: 'Monitoring and enforcing', uptime: '99.9%', color: '#aa00ff' },
  vaultKeeper: { id: 'vaultKeeper', name: 'VAULTKEEPER', state: 'active', eventsProcessed: 10231, threatsHandled: 312, lastAction: 'Securing critical files', currentActivity: 'Securing critical files', uptime: '100%', color: '#00ff88' },
};

// ─── Initial Risk History ────────────────────────────────────────────────
function genIdleHistory(): RiskDataPoint[] {
  const pts: RiskDataPoint[] = [];
  for (let i = 0; i < 30; i++) {
    pts.push({ time: `${i}`, value: 10 + Math.random() * 8, phase: 'idle' });
  }
  return pts;
}

// ─── Store Interface ─────────────────────────────────────────────────────
interface TrinetraState {
  // Navigation
  activePage: string;
  setActivePage: (page: string) => void;

  // Risk
  riskScore: number;
  riskHistory: RiskDataPoint[];
  addRiskPoint: (value: number, phase: string) => void;

  // Agents
  agents: Record<string, AgentInfo>;
  setAgentState: (id: string, state: AgentState) => void;
  setAgentActivity: (id: string, activity: string) => void;

  // Events
  events: TelemetryEvent[];
  addEvent: (event: Omit<TelemetryEvent, 'id'>) => void;
  clearEvents: () => void;

  // Simulation
  simulationPhase: SimulationPhase;
  setSimulationPhase: (phase: SimulationPhase) => void;
  activeIncident: Incident | null;
  setActiveIncident: (incident: Incident | null) => void;
  isSimulating: boolean;

  // Alert
  alertState: AlertState;
  setAlertState: (state: AlertState) => void;
  dismissAlert: () => void;

  // File Metrics
  fileMetrics: FileMetrics;
  setFileMetrics: (metrics: Partial<FileMetrics>) => void;

  // Files
  fileEvents: FileEvent[];
  filesSecured: number;
  filesAffected: number;

  // Recovery
  recoveryProgress: number;
  recoverySteps: { label: string; done: boolean }[];

  // Replay
  replayProgress: number;
  replayPlaying: boolean;
  replaySpeed: ReplaySpeed;
  replayIncidentId: string;
  setReplayProgress: (p: number) => void;
  setReplayPlaying: (v: boolean) => void;
  setReplaySpeed: (s: ReplaySpeed) => void;
  resetReplay: () => void;

  // Incidents
  incidents: Incident[];
  addIncident: (incident: Incident) => void;

  // Simulation engine start
  startSimulation: (attackType: AttackType, target: string) => void;
  stopSimulation: () => void;

  // Command palette
  cmdPaletteOpen: boolean;
  setCmdPaletteOpen: (v: boolean) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────
let eventCounter = 0;
function makeEventId() { return `evt-${++eventCounter}`; }

export const useTrinetraStore = create<TrinetraState>((set, get) => ({
  // Navigation
  activePage: 'command-center',
  setActivePage: (page) => set({ activePage: page }),

  // Risk
  riskScore: 18,
  riskHistory: genIdleHistory(),
  addRiskPoint: (value, phase) => set((s) => ({
    riskScore: value,
    riskHistory: [...s.riskHistory.slice(-59), { time: `${s.riskHistory.length}`, value, phase }],
  })),

  // Agents
  agents: initialAgents,
  setAgentState: (id, state) => set((s) => ({
    agents: { ...s.agents, [id]: { ...s.agents[id], state } },
  })),
  setAgentActivity: (id, activity) => set((s) => ({
    agents: { ...s.agents, [id]: { ...s.agents[id], currentActivity: activity, lastAction: activity } },
  })),

  // Events
  events: [
    { id: 'init-1', time: '10:40:01', timestamp: Date.now() - 120000, agent: 'WATCHDOG', message: 'System monitoring active — all clear', severity: 'low' },
    { id: 'init-2', time: '10:40:15', timestamp: Date.now() - 100000, agent: 'GATEKEEPER', message: 'Network baseline established', severity: 'low' },
    { id: 'init-3', time: '10:41:00', timestamp: Date.now() - 60000, agent: 'RISK ANALYSER', message: 'Behaviour profile loaded for Workstation-07', severity: 'low' },
  ],
  addEvent: (evt) => set((s) => ({
    events: [{ ...evt, id: makeEventId() }, ...s.events].slice(0, 200),
  })),
  clearEvents: () => set({ events: [] }),

  // Simulation
  simulationPhase: 'idle',
  setSimulationPhase: (phase) => set({ simulationPhase: phase }),
  activeIncident: null,
  setActiveIncident: (incident) => set({ activeIncident: incident }),
  isSimulating: false,

  // Alert
  alertState: 'none',
  setAlertState: (state) => set({ alertState: state }),
  dismissAlert: () => set({ alertState: 'none' }),

  // File Metrics
  fileMetrics: { modRate: 1425, ioVelocity: 2.4, entropy: 0.92, processAnomaly: 87, networkActivity: 1.3 },
  setFileMetrics: (m) => set((s) => ({ fileMetrics: { ...s.fileMetrics, ...m } })),

  // Files
  fileEvents: MOCK_FILES,
  filesSecured: 0,
  filesAffected: 0,

  // Recovery
  recoveryProgress: 0,
  recoverySteps: [
    { label: 'Threat isolated', done: false },
    { label: 'Malicious process terminated', done: false },
    { label: 'Network restricted', done: false },
    { label: 'Critical files secured', done: false },
    { label: 'Backup verified', done: false },
    { label: 'System restored', done: false },
  ],

  // Replay
  replayProgress: 0,
  replayPlaying: false,
  replaySpeed: 1,
  replayIncidentId: 'TR-4821',
  setReplayProgress: (p) => set({ replayProgress: p }),
  setReplayPlaying: (v) => set({ replayPlaying: v }),
  setReplaySpeed: (s) => set({ replaySpeed: s }),
  resetReplay: () => {
    set({
      replayProgress: 0,
      replayPlaying: false,
      riskScore: 18,
      simulationPhase: 'idle',
      alertState: 'none',
      agents: initialAgents,
      recoveryProgress: 0,
      events: [
        { id: 'init-1', time: '10:40:01', timestamp: Date.now(), agent: 'WATCHDOG', message: 'System monitoring active — all clear', severity: 'low' },
      ],
      recoverySteps: [
        { label: 'Threat isolated', done: false },
        { label: 'Malicious process terminated', done: false },
        { label: 'Network restricted', done: false },
        { label: 'Critical files secured', done: false },
        { label: 'Backup verified', done: false },
        { label: 'System restored', done: false },
      ],
    });
  },

  // Incidents
  incidents: MOCK_INCIDENTS,
  addIncident: (incident) => set((s) => ({ incidents: [incident, ...s.incidents] })),

  // Start Simulation
  startSimulation: (attackType, target) => {
    const store = get();
    const threatNames: Record<AttackType, string> = {
      ransomware: 'Ransomware', malware: 'Malware',
      data_exfiltration: 'Data Exfiltration', brute_force: 'Brute Force', suspicious_process: 'Suspicious Process',
    };
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const incident: Incident = {
      id: `TR-${4822 + Math.floor(Math.random() * 100)}`,
      threat: threatNames[attackType],
      severity: attackType === 'suspicious_process' ? 'medium' : attackType === 'brute_force' ? 'high' : 'critical',
      target,
      detectedAt: now.toLocaleString(),
      status: 'detected',
      riskScore: 0,
      confidence: 97.4,
      filesAffected: 247,
      filesSecured: 0,
      agentsInvolved: ['WATCHDOG', 'GATEKEEPER', 'RISK ANALYSER', 'POLICY ENGINE', 'ENFORCER', 'VAULTKEEPER'],
    };
    set({ isSimulating: true, activeIncident: incident, filesAffected: 247, filesSecured: 0, recoveryProgress: 0 });
    store.addIncident(incident);

    // Phase sequence
    const phases: Array<{ delay: number; fn: () => void }> = [
      { delay: 500, fn: () => {
        store.setSimulationPhase('detecting');
        store.setAgentState('watchdog', 'detecting');
        store.addEvent({ time: timeStr, timestamp: Date.now(), agent: 'WATCHDOG', message: `Suspicious process detected on ${target}`, severity: 'high' });
        store.addRiskPoint(31, 'detecting');
      }},
      { delay: 2500, fn: () => {
        store.setSimulationPhase('analysing');
        store.setAgentState('riskAnalyser', 'analysing');
        store.addEvent({ time: timeStr, timestamp: Date.now(), agent: 'RISK ANALYSER', message: 'Entropy anomaly detected — file modification rate elevated', severity: 'high' });
        store.addRiskPoint(47, 'analysing');
        store.setFileMetrics({ entropy: 0.97, modRate: 4200 });
      }},
      { delay: 5000, fn: () => {
        store.setSimulationPhase('deciding');
        store.setAgentState('riskAnalyser', 'deciding');
        store.addEvent({ time: timeStr, timestamp: Date.now(), agent: 'RISK ANALYSER', message: 'Risk score 94 — threat classification: RANSOMWARE (97.4% confidence)', severity: 'critical' });
        store.addRiskPoint(63, 'deciding');
        store.setAlertState('critical');
        set((s) => ({ activeIncident: s.activeIncident ? { ...s.activeIncident, riskScore: 94 } : null }));
      }},
      { delay: 8000, fn: () => {
        store.setAgentState('policyEngine', 'deciding');
        store.addEvent({ time: timeStr, timestamp: Date.now(), agent: 'POLICY ENGINE', message: 'Containment policy triggered — isolating process', severity: 'critical' });
        store.addRiskPoint(78, 'deciding');
        store.setFileMetrics({ processAnomaly: 99, networkActivity: 4.8 });
      }},
      { delay: 11000, fn: () => {
        store.setSimulationPhase('containing');
        store.setAgentState('enforcer', 'containing');
        store.setAgentState('policyEngine', 'containing');
        store.addEvent({ time: timeStr, timestamp: Date.now(), agent: 'ENFORCER', message: 'Malicious process terminated — PID 7721', severity: 'critical' });
        store.addRiskPoint(94, 'containing');
      }},
      { delay: 14000, fn: () => {
        store.setSimulationPhase('protecting');
        store.setAgentState('vaultKeeper', 'protecting');
        store.addEvent({ time: timeStr, timestamp: Date.now(), agent: 'VAULTKEEPER', message: 'Critical files secured — 247 files protected', severity: 'high' });
        store.addRiskPoint(72, 'protecting');
        store.setAlertState('contained');
        set({ filesSecured: 247 });
        set((s) => ({ activeIncident: s.activeIncident ? { ...s.activeIncident, status: 'contained', containedAt: new Date().toLocaleString(), filesSecured: 247 } : null }));
        // Recovery steps
        const steps = [
          { label: 'Threat isolated', done: true },
          { label: 'Malicious process terminated', done: true },
          { label: 'Network restricted', done: true },
          { label: 'Critical files secured', done: true },
          { label: 'Backup verified', done: false },
          { label: 'System restored', done: false },
        ];
        set({ recoverySteps: steps, recoveryProgress: 66 });
      }},
      { delay: 18000, fn: () => {
        store.addEvent({ time: timeStr, timestamp: Date.now(), agent: 'VAULTKEEPER', message: 'Backup integrity verified — SHA-256 checksum valid', severity: 'low' });
        store.addRiskPoint(45, 'protecting');
        set((s) => ({
          recoverySteps: s.recoverySteps.map((step, i) => i < 5 ? { ...step, done: true } : step),
          recoveryProgress: 83,
        }));
      }},
      { delay: 22000, fn: () => {
        store.setSimulationPhase('recovered');
        store.setAlertState('recovered');
        store.addEvent({ time: timeStr, timestamp: Date.now(), agent: 'SYSTEM', message: 'System fully recovered — all agents nominal', severity: 'low' });
        store.addRiskPoint(18, 'recovered');
        Object.keys(initialAgents).forEach(id => store.setAgentState(id, 'recovered'));
        set((s) => ({
          recoverySteps: s.recoverySteps.map(step => ({ ...step, done: true })),
          recoveryProgress: 100,
          activeIncident: s.activeIncident ? { ...s.activeIncident, status: 'recovered', recoveredAt: new Date().toLocaleString() } : null,
          isSimulating: false,
        }));
        store.addRiskPoint(5, 'recovered');
      }},
    ];

    phases.forEach(({ delay, fn }) => setTimeout(fn, delay));
  },

  stopSimulation: () => set({ isSimulating: false, simulationPhase: 'idle' }),

  // Command palette
  cmdPaletteOpen: false,
  setCmdPaletteOpen: (v) => set({ cmdPaletteOpen: v }),
}));
