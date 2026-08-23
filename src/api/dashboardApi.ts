/**
 * Typed Dashboard & Policy API Service for TRINETRA
 */
import { apiFetch } from './client';

export interface BackendEvent {
  event: string;
  timestamp?: string;
  risk_score?: number;
  process?: string;
  pid?: number;
  severity?: string;
  reasons?: string[];
  details?: any;
  [key: string]: any;
}

export interface DashboardStateResponse {
  latest_decision: BackendEvent | null;
  recent_events: BackendEvent[];
  enforcer_config: {
    enabled?: boolean;
    dry_run?: boolean;
    kill_switch?: boolean;
    [key: string]: any;
  };
  thresholds: {
    safe_max?: number;
    suspicious_max?: number;
    high_risk_max?: number;
    ransomware_threshold?: number;
    [key: string]: any;
  };
}

export const dashboardApi = {
  async getHealth(): Promise<{ status: string; service: string }> {
    return apiFetch<{ status: string; service: string }>('/health');
  },

  async getDashboardState(): Promise<DashboardStateResponse> {
    return apiFetch<DashboardStateResponse>('/dashboard/state');
  },

  async getEvents(limit: number = 200): Promise<BackendEvent[]> {
    return apiFetch<BackendEvent[]>(`/dashboard/events?limit=${limit}`);
  },

  async clearDashboard(): Promise<{ cleared: boolean }> {
    return apiFetch<{ cleared: boolean }>('/dashboard/clear', {
      method: 'POST',
    });
  },

  async getConfig(): Promise<any> {
    return apiFetch<any>('/policy/config');
  },

  async updateThresholds(update: Record<string, number | undefined>): Promise<any> {
    return apiFetch<any>('/policy/config/thresholds', {
      method: 'POST',
      body: JSON.stringify(update),
    });
  },

  async updateEnforcerConfig(update: Record<string, boolean | undefined>): Promise<any> {
    return apiFetch<any>('/policy/config/enforcer', {
      method: 'POST',
      body: JSON.stringify(update),
    });
  },

  async unlockAllFiles(): Promise<any> {
    return apiFetch<any>('/enforcer/unlock-all', {
      method: 'POST',
    });
  },

  async getEnforcerLog(limit: number = 100): Promise<any[]> {
    return apiFetch<any[]>(`/enforcer/log?limit=${limit}`);
  },

  async snapshotBackup(paths?: string[]): Promise<any> {
    return apiFetch<any>('/vaultkeeper/snapshot', {
      method: 'POST',
      body: JSON.stringify(paths || null),
    });
  },

  async startSimulation(): Promise<any> {
    return apiFetch<any>('/simulate/start', {
      method: 'POST',
    });
  },

  async evaluatePolicy(signal: Record<string, any>): Promise<any> {
    return apiFetch<any>('/policy/evaluate', {
      method: 'POST',
      body: JSON.stringify(signal),
    });
  },
};
