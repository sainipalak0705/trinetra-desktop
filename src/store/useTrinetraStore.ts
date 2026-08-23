import { create } from 'zustand';
import { authApi, UserInfo } from '../api/authApi';
import { dashboardApi, BackendEvent, DashboardStateResponse } from '../api/dashboardApi';
import { wsClient } from '../api/websocket';

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
  isReal?: boolean;
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

// ─── Mock / Demo Incidents (Preserved for Presentation) ───────────────────
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'TR-4821',
    threat: 'Ransomware (Scenario)',
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
    isReal: false,
  },
  {
    id: 'TR-4820',
    threat: 'Malware (Scenario)',
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
    isReal: false,
  },
  {
    id: 'TR-4786',
    threat: 'Data Exfiltration (Scenario)',
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
    isReal: false,
  },
];

// ─── Mock / Demo File Events (Preserved for Presentation) ─────────────────
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
  time: number;
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
  watchdog: { id: 'watchdog', name: 'WATCHDOG', state: 'monitoring', eventsProcessed: 14205, threatsHandled: 23, lastAction: 'Monitoring file system & canaries', currentActivity: 'Active file system & canary monitoring', uptime: '99.8%', color: '#ff0040' },
  gatekeeper: { id: 'gatekeeper', name: 'GATEKEEPER', state: 'active', eventsProcessed: 8612, threatsHandled: 198, lastAction: 'Filtering URL & file paths', currentActivity: 'Filtering URL & file paths', uptime: '99.9%', color: '#ff6600' },
  riskAnalyser: { id: 'riskAnalyser', name: 'RISK ANALYSER', state: 'active', eventsProcessed: 9812, threatsHandled: 221, lastAction: 'ML Telemetry risk evaluation', currentActivity: 'ML Telemetry risk evaluation', uptime: '99.7%', color: '#ffaa00' },
  policyEngine: { id: 'policyEngine', name: 'POLICY ENGINE', state: 'active', eventsProcessed: 6321, threatsHandled: 145, lastAction: 'Evaluating containment rules', currentActivity: 'Evaluating containment rules', uptime: '100%', color: '#00aaff' },
  enforcer: { id: 'enforcer', name: 'ENFORCER', state: 'active', eventsProcessed: 7654, threatsHandled: 186, lastAction: 'Enforcement & file locking active', currentActivity: 'Enforcement & file locking active', uptime: '99.9%', color: '#aa00ff' },
  vaultKeeper: { id: 'vaultKeeper', name: 'VAULTKEEPER', state: 'active', eventsProcessed: 10231, threatsHandled: 312, lastAction: 'Encrypted snapshot vault active', currentActivity: 'Encrypted snapshot vault active', uptime: '100%', color: '#00ff88' },
};

function genIdleHistory(): RiskDataPoint[] {
  const pts: RiskDataPoint[] = [];
  for (let i = 0; i < 30; i++) {
    pts.push({ time: `${i}`, value: 10 + Math.random() * 8, phase: 'idle' });
  }
  return pts;
}

let eventCounter = 0;
function makeEventId() { return `evt-${Date.now()}-${++eventCounter}`; }

let simulationTimeouts: Array<ReturnType<typeof setTimeout>> = [];

function clearSimulationTimeouts() {
  simulationTimeouts.forEach((t) => clearTimeout(t));
  simulationTimeouts = [];
}

// ─── Store Interface ─────────────────────────────────────────────────────
interface TrinetraState {
  // Authentication
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  initDashboard: () => Promise<void>;

  // Navigation
  activePage: string;
  setActivePage: (page: string) => void;

  // Real-Time Risk & Telemetry
  riskScore: number;
  riskHistory: RiskDataPoint[];
  addRiskPoint: (value: number, phase: string) => void;

  // Agent Status
  agents: Record<string, AgentInfo>;
  setAgentState: (id: string, state: AgentState) => void;
  setAgentActivity: (id: string, activity: string) => void;

  // Events Feed
  events: TelemetryEvent[];
  addEvent: (event: Omit<TelemetryEvent, 'id'>) => void;
  clearEvents: () => void;
  handleBackendEvent: (rawEvent: BackendEvent) => void;

  // Policy & Enforcer Config
  thresholds: Record<string, any>;
  enforcerConfig: Record<string, any>;
  unlockAllFiles: () => Promise<void>;

  // Simulation
  simulationPhase: SimulationPhase;
  setSimulationPhase: (phase: SimulationPhase) => void;
  activeIncident: Incident | null;
  setActiveIncident: (incident: Incident | null) => void;
  isSimulating: boolean;
  startSimulation: (attackType: AttackType, target: string) => Promise<void>;
  stopSimulation: () => void;

  // Alert Overlays
  alertState: AlertState;
  setAlertState: (state: AlertState) => void;
  dismissAlert: () => void;

  // File Metrics & Security
  fileMetrics: FileMetrics;
  setFileMetrics: (metrics: Partial<FileMetrics>) => void;
  fileEvents: FileEvent[];
  filesSecured: number;
  filesAffected: number;

  // Recovery
  recoveryProgress: number;
  recoverySteps: { label: string; done: boolean }[];

  // Attack Replay (Demo)
  replayProgress: number;
  replayPlaying: boolean;
  replaySpeed: ReplaySpeed;
  replayIncidentId: string;
  setReplayProgress: (p: number) => void;
  setReplayPlaying: (v: boolean) => void;
  setReplaySpeed: (s: ReplaySpeed) => void;
  resetReplay: () => void;

  // Incidents List
  incidents: Incident[];
  addIncident: (incident: Incident) => void;

  // Command Palette
  cmdPaletteOpen: boolean;
  setCmdPaletteOpen: (v: boolean) => void;
}

// ─── Store Implementation ─────────────────────────────────────────────────
export const useTrinetraStore = create<TrinetraState>((set, get) => {
  // Listen for 401 unauthorized event across windows
  if (typeof window !== 'undefined') {
    window.addEventListener('trinetra:unauthorized', () => {
      get().logout();
    });
  }

  return {
    // ─── Auth State ────────────────────────────────────────────────────────
    token: typeof localStorage !== 'undefined' ? localStorage.getItem('trinetra_auth_token') : null,
    user: typeof localStorage !== 'undefined' && localStorage.getItem('trinetra_auth_user')
      ? JSON.parse(localStorage.getItem('trinetra_auth_user')!)
      : null,
    isAuthenticated: typeof localStorage !== 'undefined' ? !!localStorage.getItem('trinetra_auth_token') : false,
    isAuthLoading: false,
    authError: null,

    login: async (username: string, password: string) => {
      set({ isAuthLoading: true, authError: null });
      try {
        const res = await authApi.login(username, password);
        localStorage.setItem('trinetra_auth_token', res.access_token);
        localStorage.setItem('trinetra_auth_user', JSON.stringify(res.user));
        set({
          token: res.access_token,
          user: res.user,
          isAuthenticated: true,
          isAuthLoading: false,
          authError: null,
        });

        // Initialize WebSocket and dashboard state on successful login
        get().initDashboard();
        return true;
      } catch (err: any) {
        set({
          authError: err.message || 'Login failed. Please check your credentials.',
          isAuthLoading: false,
          isAuthenticated: false,
        });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('trinetra_auth_token');
      localStorage.removeItem('trinetra_auth_user');
      wsClient.disconnect();
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        authError: null,
        activePage: 'command-center',
      });
    },

    checkAuth: async () => {
      const token = localStorage.getItem('trinetra_auth_token');
      if (!token) {
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }
      try {
        const user = await authApi.getMe();
        localStorage.setItem('trinetra_auth_user', JSON.stringify(user));
        set({ user, isAuthenticated: true, token });
        get().initDashboard();
      } catch {
        get().logout();
      }
    },

    initDashboard: async () => {
      if (!get().isAuthenticated) return;

      // 1. Connect authenticated WebSocket
      wsClient.connect();
      wsClient.subscribe((backendEvent) => {
        get().handleBackendEvent(backendEvent);
      });

      // 2. Fetch initial dashboard state from backend
      try {
        const state = await dashboardApi.getDashboardState();
        if (state) {
          set({
            thresholds: state.thresholds || {},
            enforcerConfig: state.enforcer_config || {},
          });

          // Hydrate recent events into feed
          if (state.recent_events && state.recent_events.length > 0) {
            const parsedEvents: TelemetryEvent[] = state.recent_events.map((e, idx) => ({
              id: `init-evt-${idx}-${Date.now()}`,
              time: e.timestamp ? new Date(e.timestamp).toTimeString().slice(0, 8) : new Date().toTimeString().slice(0, 8),
              timestamp: e.timestamp ? new Date(e.timestamp).getTime() : Date.now(),
              agent: e.process ? `PROCESS: ${e.process}` : (e.event || 'SYSTEM'),
              message: e.reasons ? e.reasons.join(' | ') : `Event: ${e.event}`,
              severity: (e.severity?.toLowerCase() as Severity) || (e.event === 'THREAT_CONFIRMED' ? 'critical' : 'low'),
            }));
            set({ events: parsedEvents.slice(0, 100) });
          }

          if (state.latest_decision) {
            const score = state.latest_decision.risk_score ?? get().riskScore;
            get().addRiskPoint(score, state.latest_decision.event || 'idle');
          }
        }
      } catch (err) {
        console.warn('Could not fetch initial dashboard state:', err);
      }
    },

    // ─── Navigation ────────────────────────────────────────────────────────
    activePage: 'command-center',
    setActivePage: (page) => set({ activePage: page }),

    // ─── Real Telemetry & Events ───────────────────────────────────────────
    riskScore: 12,
    riskHistory: genIdleHistory(),
    addRiskPoint: (value, phase) => set((s) => ({
      riskScore: value,
      riskHistory: [...s.riskHistory.slice(-59), { time: `${s.riskHistory.length}`, value, phase }],
    })),

    agents: initialAgents,
    setAgentState: (id, state) => set((s) => ({
      agents: { ...s.agents, [id]: { ...s.agents[id], state } },
    })),
    setAgentActivity: (id, activity) => set((s) => ({
      agents: { ...s.agents, [id]: { ...s.agents[id], currentActivity: activity, lastAction: activity } },
    })),

    events: [
      { id: 'init-1', time: new Date().toTimeString().slice(0, 8), timestamp: Date.now() - 120000, agent: 'WATCHDOG', message: 'TRINETRA SOC active — passive monitoring nominal', severity: 'low' },
      { id: 'init-2', time: new Date().toTimeString().slice(0, 8), timestamp: Date.now() - 60000, agent: 'GATEKEEPER', message: 'Screening policies loaded and armed', severity: 'low' },
    ],
    addEvent: (evt) => set((s) => ({
      events: [{ ...evt, id: makeEventId() }, ...s.events].slice(0, 200),
    })),
    clearEvents: () => set({ events: [] }),

    handleBackendEvent: (rawEvent: BackendEvent) => {
      const store = get();
      const timeStr = rawEvent.timestamp
        ? new Date(rawEvent.timestamp).toTimeString().slice(0, 8)
        : new Date().toTimeString().slice(0, 8);

      const eventName = rawEvent.event || 'EVENT';
      const risk = typeof rawEvent.risk_score === 'number' ? rawEvent.risk_score : null;

      if (risk !== null) {
        store.addRiskPoint(risk, eventName.toLowerCase());
      }

      // Map event severity
      let sev: Severity = 'low';
      if (['THREAT_CONFIRMED', 'ENFORCER_ACTIVATED'].includes(eventName)) sev = 'critical';
      else if (['HIGH_RISK', 'HIGH_RISK_MONITORING_INCREASED'].includes(eventName)) sev = 'high';
      else if (['SUSPICIOUS', 'SUSPICIOUS_ACTIVITY_LOGGED'].includes(eventName)) sev = 'medium';

      // Map Agent states according to event
      if (eventName === 'THREAT_CONFIRMED') {
        store.setAgentState('policyEngine', 'deciding');
        store.setAgentState('enforcer', 'containing');
        store.setAlertState('critical');
      } else if (eventName === 'ENFORCER_ACTIVATED') {
        store.setAgentState('enforcer', 'containing');
        store.setAgentActivity('enforcer', `Containing threat on PID ${rawEvent.pid || 'N/A'}`);
      } else if (eventName === 'VAULTKEEPER_NOTIFIED') {
        store.setAgentState('vaultKeeper', 'protecting');
        store.setAgentActivity('vaultKeeper', 'Securing recovery snapshots');
      } else if (eventName === 'FILES_UNLOCKED') {
        store.setAgentState('enforcer', 'active');
        store.setAlertState('none');
      } else if (eventName === 'SAFE') {
        store.setAgentState('watchdog', 'monitoring');
        store.setAgentState('riskAnalyser', 'active');
        store.setAlertState('none');
      }

      // Add to event stream
      const msg = rawEvent.reasons && rawEvent.reasons.length > 0
        ? rawEvent.reasons.join(', ')
        : rawEvent.process
        ? `Signal on ${rawEvent.process} (PID ${rawEvent.pid || 'N/A'})`
        : `Backend event: ${eventName}`;

      store.addEvent({
        time: timeStr,
        timestamp: Date.now(),
        agent: rawEvent.process ? `PID ${rawEvent.pid || ''} (${rawEvent.process})` : eventName,
        message: msg,
        severity: sev,
      });
    },

    thresholds: {},
    enforcerConfig: {},
    unlockAllFiles: async () => {
      try {
        await dashboardApi.unlockAllFiles();
        get().setAlertState('none');
      } catch (err) {
        console.error('Failed to unlock files:', err);
      }
    },

    // ─── Simulation Engine ─────────────────────────────────────────────────
    simulationPhase: 'idle',
    setSimulationPhase: (phase) => set({ simulationPhase: phase }),
    activeIncident: null,
    setActiveIncident: (incident) => set({ activeIncident: incident }),
    isSimulating: false,

    startSimulation: async (attackType: AttackType, target: string) => {
      const store = get();
      set({ isSimulating: true, simulationPhase: 'detecting' });

      const incident: Incident = {
        id: `TR-LIVE-${Date.now().toString().slice(-4)}`,
        threat: `${attackType.toUpperCase()} (Live Backend Simulation)`,
        severity: 'critical',
        target,
        detectedAt: new Date().toLocaleString(),
        status: 'detected',
        riskScore: 92,
        confidence: 98.2,
        filesAffected: 8,
        filesSecured: 8,
        agentsInvolved: ['WATCHDOG', 'RISK ANALYSER', 'POLICY ENGINE', 'ENFORCER', 'VAULTKEEPER'],
        isReal: true,
      };
      set({ activeIncident: incident });
      store.addIncident(incident);

      try {
        // Trigger real backend ransomware simulator
        await new Promise(resolve => setTimeout(resolve, 1200));
        set({ simulationPhase: 'analysing' });
        await new Promise(resolve => setTimeout(resolve, 1200));
        set({ simulationPhase: 'deciding' });
        await new Promise(resolve => setTimeout(resolve, 1200));
        set({ simulationPhase: 'containing' });
        await new Promise(resolve => setTimeout(resolve, 1200));
        set({ simulationPhase: 'protecting' });
        await dashboardApi.startSimulation();
      } catch (err) {
        console.warn('Backend simulator execution:', err);
      } finally {
        set({ simulationPhase: 'recovered' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({ isSimulating: false });
      }
    },

    stopSimulation: () => set({ isSimulating: false, simulationPhase: 'idle' }),

    // ─── Alert ─────────────────────────────────────────────────────────────
    alertState: 'none',
    setAlertState: (state) => set({ alertState: state }),
    dismissAlert: () => set({ alertState: 'none' }),

    // ─── Metrics ───────────────────────────────────────────────────────────
    fileMetrics: { modRate: 1425, ioVelocity: 2.4, entropy: 0.92, processAnomaly: 87, networkActivity: 1.3 },
    setFileMetrics: (m) => set((s) => ({ fileMetrics: { ...s.fileMetrics, ...m } })),
    fileEvents: MOCK_FILES,
    filesSecured: 0,
    filesAffected: 0,

    // ─── Recovery ──────────────────────────────────────────────────────────
    recoveryProgress: 0,
    recoverySteps: [
      { label: 'Threat isolated', done: false },
      { label: 'Malicious process terminated', done: false },
      { label: 'Network restricted', done: false },
      { label: 'Critical files secured', done: false },
      { label: 'Backup verified', done: false },
      { label: 'System restored', done: false },
    ],

    // ─── Replay ────────────────────────────────────────────────────────────
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
        riskScore: 12,
        simulationPhase: 'idle',
        alertState: 'none',
        agents: initialAgents,
        recoveryProgress: 0,
      });
    },

    // ─── Incidents ─────────────────────────────────────────────────────────
    incidents: MOCK_INCIDENTS,
    addIncident: (incident) => set((s) => ({ incidents: [incident, ...s.incidents] })),

    // ─── Command Palette ───────────────────────────────────────────────────
    cmdPaletteOpen: false,
    setCmdPaletteOpen: (v) => set({ cmdPaletteOpen: v }),
  };
});


