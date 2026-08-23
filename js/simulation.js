/**
 * TRINETRA — Attack Simulation Engine
 * ─────────────────────────────────────
 * Drives the mock attack sequence and broadcasts events
 * to all dashboard components via a simple event bus.
 *
 * To swap for a real backend: replace `runNextStep` with
 * a WebSocket message handler that receives the same
 * event shape as SimulationEvents[].
 */

class TrinetraSimulation {
  constructor(mockData) {
    this.data          = mockData;
    this.events        = mockData.simulation;
    this.currentStep   = -1;
    this.isRunning     = false;
    this.isPaused      = false;
    this.speed         = 1;          // 0.5x, 1x, 2x
    this.stepTimer     = null;
    this.listeners     = {};         // event bus
    this.completedSteps= [];

    // Base step interval in ms (real: 3000ms)
    this.BASE_INTERVAL = 3000;
  }

  // ── Event bus ─────────────────────────────────────────
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  // ── Control ───────────────────────────────────────────
  start() {
    if (this.isRunning) return;
    this.currentStep    = -1;
    this.completedSteps = [];
    this.isRunning      = true;
    this.isPaused       = false;
    this.emit('started', {});
    this._scheduleNext();
  }

  pause() {
    this.isPaused = true;
    clearTimeout(this.stepTimer);
    this.emit('paused', { step: this.currentStep });
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this._scheduleNext();
    this.emit('resumed', { step: this.currentStep });
  }

  setSpeed(multiplier) {
    this.speed = multiplier;
  }

  reset() {
    clearTimeout(this.stepTimer);
    this.currentStep    = -1;
    this.completedSteps = [];
    this.isRunning      = false;
    this.isPaused       = false;
    this.emit('reset', {});
  }

  // ── Internal scheduler ────────────────────────────────
  _scheduleNext() {
    if (this.isPaused) return;
    const nextIndex = this.currentStep + 1;
    if (nextIndex >= this.events.length) {
      this._complete();
      return;
    }
    const interval = this.BASE_INTERVAL / this.speed;
    this.stepTimer = setTimeout(() => {
      this._runStep(nextIndex);
    }, interval);
  }

  _runStep(index) {
    if (this.isPaused) return;
    this.currentStep = index;
    const event = this.events[index];
    this.completedSteps.push(event);

    // Broadcast step event
    this.emit('step', {
      event,
      index,
      total:    this.events.length,
      progress: ((index + 1) / this.events.length) * 100,
    });

    // Broadcast specific event-type events
    this.emit(`step:${event.type}`, event);
    this.emit(`step:agent:${event.agent}`, event);

    // Update mock state
    this._updateState(event);

    this._scheduleNext();
  }

  _complete() {
    this.isRunning = false;
    this.emit('completed', {
      totalSteps: this.events.length,
      incident:   this._buildIncident(),
    });
  }

  _updateState(event) {
    const state = this.data.state;

    // Update risk score
    state.riskScore = event.riskScore;

    // Update status based on event type
    switch (event.type) {
      case 'attack':
        state.status = 'reviewing';
        break;
      case 'threat':
      case 'detection':
        state.status = 'reviewing';
        break;
      case 'analysis':
        state.status = 'threat_detected';
        break;
      case 'decision':
      case 'containment':
        state.status = 'threat_detected';
        break;
      case 'recovery':
        state.status = 'recovering';
        break;
      case 'resolved':
        state.status = 'protected';
        state.riskScore = 12;
        break;
    }

    // Update agent statuses
    const agentMap = {
      'watchdog':      ['threat','detection'],
      'risk-analyzer': ['analysis'],
      'policy-engine': ['decision'],
      'enforcer':      ['containment'],
      'vaultkeeper':   ['recovery','resolved'],
    };

    this.data.agents.forEach(agent => {
      const activeTypes = agentMap[agent.id] || [];
      if (activeTypes.includes(event.type)) {
        agent.status   = event.type === 'containment' ? 'alert' : 'processing';
        agent.activity = event.action;
        agent.lastAction = 'just now';
      } else if (agent.status !== 'idle') {
        // Keep active agents active, reset others
        if (!['gatekeeper','watchdog','risk-analyzer','vaultkeeper'].includes(agent.id)) {
          if (event.type === 'resolved') agent.status = 'idle';
        }
      }
    });

    // After resolution, reset agent statuses
    if (event.type === 'resolved') {
      this.data.agents.forEach(a => {
        a.status = ['gatekeeper','watchdog','risk-analyzer','vaultkeeper'].includes(a.id)
          ? 'active' : 'idle';
      });
    }
  }

  _buildIncident() {
    const now = new Date();
    return {
      id:           'inc_sim_' + Date.now(),
      active:       true,
      severity:     'critical',
      riskScore:    96,
      title:        'Ransomware-like activity detected',
      summary:      'An unknown process attempted to encrypt your files. TRINETRA stopped it.',
      detectedAt:   now.toISOString(),
      resolvedAt:   new Date(now.getTime() + 20000).toISOString(),
      detectionReasons: this.data.currentIncident.detectionReasons,
      detectionSignals: this.data.currentIncident.detectionSignals,
      actionsTaken:     this.data.currentIncident.actionsTaken,
      affectedFiles:    this.data.currentIncident.affectedFiles,
      replayEvents:     [...this.completedSteps],
    };
  }

  // ── Seek to step ──────────────────────────────────────
  seekTo(stepIndex) {
    clearTimeout(this.stepTimer);
    this.completedSteps = [];
    for (let i = 0; i <= stepIndex; i++) {
      this._updateState(this.events[i]);
      this.completedSteps.push(this.events[i]);
    }
    this.currentStep = stepIndex;
    this.emit('seeked', {
      index:    stepIndex,
      event:    this.events[stepIndex],
      progress: ((stepIndex + 1) / this.events.length) * 100,
    });
  }
}
