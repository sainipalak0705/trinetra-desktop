/**
 * TRINETRA — Attack Replay Timeline
 * ────────────────────────────────────
 * Manages the visual Attack Replay section in the dashboard.
 * Reads from simulation events and animates the timeline.
 */

class TrinetraReplay {
  constructor(simulation, container) {
    this.sim          = simulation;
    this.container    = container; // The replay section container element
    this.events       = simulation.events;
    this.currentStep  = -1;
    this.isPlaying    = false;
    this.speed        = 1;
    this.playTimer    = null;

    this._buildUI();
    this._bindControls();
  }

  // ── Build replay UI ───────────────────────────────────
  _buildUI() {
    const el = this.container;
    el.innerHTML = `
      <div class="replay-container" id="replay-box">
        <div class="replay-header">
          <div>
            <div class="replay-title font-display">Attack Replay Timeline</div>
            <div style="font-size:11px;color:var(--white-500);margin-top:2px;font-family:var(--font-mono)">
              Interactive forensic reconstruction of the attack
            </div>
          </div>
          <div class="replay-controls">
            <select class="replay-speed-select" id="replay-speed" aria-label="Playback speed">
              <option value="0.5">0.5×</option>
              <option value="1" selected>1×</option>
              <option value="2">2×</option>
              <option value="4">4×</option>
            </select>
            <button class="replay-btn" id="replay-reset-btn" aria-label="Reset replay">⟳ Reset</button>
            <button class="replay-btn primary" id="replay-play-btn" aria-label="Play replay">▶ Play</button>
          </div>
        </div>

        <div class="replay-body">
          <!-- Timeline -->
          <div class="replay-timeline" id="replay-timeline" role="list" aria-label="Attack timeline">
            ${this._buildTimelineHTML()}
          </div>

          <!-- Detail sidebar -->
          <div class="replay-detail" id="replay-detail">
            <div>
              <div class="replay-detail-title">Current Step</div>
              <div id="replay-step-name" style="font-size:14px;font-weight:700;color:var(--white)">—</div>
              <div id="replay-step-desc" style="font-size:12px;color:var(--white-600);margin-top:4px;line-height:1.5">Select a step or press Play to begin</div>
            </div>

            <div>
              <div class="replay-detail-title">Risk Score</div>
              <div class="replay-risk-gauge">
                <div class="replay-risk-val safe" id="replay-risk-val">12</div>
                <div class="replay-risk-label" id="replay-risk-label">SAFE</div>
              </div>
            </div>

            <div>
              <div class="replay-detail-title">Active Agent</div>
              <div id="replay-active-agent" style="font-size:14px;color:var(--white-700)">—</div>
            </div>

            <div>
              <div class="replay-detail-title">Affected Files</div>
              <div id="replay-files" style="font-size:12px;color:var(--white-600);display:flex;flex-direction:column;gap:4px">
                <span style="color:var(--white-400)">None yet</span>
              </div>
            </div>

            <div>
              <div class="replay-detail-title">Action Taken</div>
              <div id="replay-action" style="font-size:12px;color:var(--white-600);line-height:1.5">—</div>
            </div>

            <div>
              <div class="replay-detail-title">Process Activity</div>
              <div id="replay-process" style="font-family:var(--font-mono);font-size:11px;color:var(--white-400);background:var(--black-400);padding:10px;border-radius:6px;line-height:1.8">
                Awaiting simulation...
              </div>
            </div>
          </div>
        </div>

        <!-- Scrubber -->
        <div class="replay-scrubber" id="replay-scrubber">
          <button class="replay-btn" id="replay-step-back" aria-label="Previous step" style="padding:6px 10px">‹</button>
          <span class="scrubber-label" id="scrubber-time">10:40:00</span>
          <div class="scrubber-track" id="scrubber-track" role="slider" aria-label="Timeline scrubber"
               aria-valuemin="0" aria-valuemax="${this.events.length - 1}" aria-valuenow="0">
            <div class="scrubber-fill" id="scrubber-fill"></div>
            <div class="scrubber-thumb" id="scrubber-thumb"></div>
          </div>
          <span class="scrubber-label" id="scrubber-end">${this.events[this.events.length-1]?.time || ''}</span>
          <button class="replay-btn" id="replay-step-fwd" aria-label="Next step" style="padding:6px 10px">›</button>
        </div>
      </div>
    `;

    // Initially mark all events as pending
    document.querySelectorAll('.timeline-event').forEach(e => {
      e.querySelector('.tl-node')?.classList.add('pending');
    });
  }

  _buildTimelineHTML() {
    return this.events.map((ev, i) => `
      <div class="timeline-event" id="tl-event-${i}" data-index="${i}" role="listitem">
        <div class="tl-time">${ev.time}</div>
        <div class="tl-node-wrap">
          <div class="tl-node ${ev.type} pending" id="tl-node-${i}" aria-label="${ev.title}"></div>
        </div>
        <div class="tl-content" id="tl-content-${i}">
          <div class="tl-event-title">${ev.icon} ${ev.title}</div>
          <div class="tl-event-desc">${ev.description}</div>
          <div class="tl-event-meta">
            <span class="tl-meta-item agent-tag-meta">🤖 ${ev.agentName}</span>
            <span class="tl-meta-item risk-tag-meta">⚡ Risk: ${ev.riskScore}</span>
            ${ev.filesAffected.length > 0 ? `<span class="tl-meta-item">📁 ${ev.filesAffected.length} file${ev.filesAffected.length > 1 ? 's' : ''}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── Bind controls ─────────────────────────────────────
  _bindControls() {
    // Play / Pause
    document.addEventListener('click', (e) => {
      if (e.target.id === 'replay-play-btn') {
        this.isPlaying ? this.pause() : this.play();
      }
      if (e.target.id === 'replay-reset-btn') { this.resetReplay(); }
      if (e.target.id === 'replay-step-back') { this.stepBack(); }
      if (e.target.id === 'replay-step-fwd')  { this.stepForward(); }
    });

    // Speed
    document.addEventListener('change', (e) => {
      if (e.target.id === 'replay-speed') {
        this.speed = parseFloat(e.target.value);
      }
    });

    // Click on timeline events
    document.addEventListener('click', (e) => {
      const tlEvent = e.target.closest('.timeline-event');
      if (!tlEvent) return;
      const idx = parseInt(tlEvent.dataset.index);
      if (!isNaN(idx)) this.seekTo(idx);
    });

    // Scrubber click
    document.addEventListener('click', (e) => {
      const track = document.getElementById('scrubber-track');
      if (!track || !track.contains(e.target)) return;
      const rect = track.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      const idx  = Math.round(pct * (this.events.length - 1));
      this.seekTo(Math.max(0, Math.min(idx, this.events.length - 1)));
    });
  }

  // ── Playback ──────────────────────────────────────────
  play() {
    if (this.currentStep >= this.events.length - 1) {
      this.resetReplay();
    }
    this.isPlaying = true;
    this._updatePlayBtn();
    this._scheduleNext();
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.playTimer);
    this._updatePlayBtn();
  }

  resetReplay() {
    this.pause();
    this.currentStep = -1;
    // Reset all events visually
    this.events.forEach((_, i) => {
      const evEl = document.getElementById(`tl-event-${i}`);
      const node = document.getElementById(`tl-node-${i}`);
      const cont = document.getElementById(`tl-content-${i}`);
      if (evEl)  { evEl.classList.remove('revealed', 'current'); }
      if (node)  { node.classList.add('pending'); }
      if (cont)  { cont.classList.remove('current'); }
    });
    this._updateScrubber(-1);
    this._updateDetail(null);
    this._updatePlayBtn();
  }

  _scheduleNext() {
    if (!this.isPlaying) return;
    const next = this.currentStep + 1;
    if (next >= this.events.length) {
      this.isPlaying = false;
      this._updatePlayBtn();
      return;
    }
    const interval = 2000 / this.speed;
    this.playTimer = setTimeout(() => {
      this._revealStep(next);
      this._scheduleNext();
    }, interval);
  }

  _revealStep(index) {
    // Remove 'current' from previous
    if (this.currentStep >= 0) {
      document.getElementById(`tl-event-${this.currentStep}`)?.classList.remove('current');
      document.getElementById(`tl-content-${this.currentStep}`)?.classList.remove('current');
    }

    this.currentStep = index;
    const ev    = this.events[index];
    const evEl  = document.getElementById(`tl-event-${index}`);
    const node  = document.getElementById(`tl-node-${index}`);
    const cont  = document.getElementById(`tl-content-${index}`);

    if (evEl) { evEl.classList.add('revealed', 'current'); }
    if (node) { node.classList.remove('pending'); }
    if (cont) { cont.classList.add('current'); }

    // Scroll into view
    evEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    this._updateScrubber(index);
    this._updateDetail(ev);
  }

  seekTo(index) {
    clearTimeout(this.playTimer);
    // Reveal all steps up to index
    for (let i = 0; i <= index; i++) {
      const evEl = document.getElementById(`tl-event-${i}`);
      const node = document.getElementById(`tl-node-${i}`);
      if (evEl) evEl.classList.add('revealed');
      if (node) node.classList.remove('pending');
    }
    // Hide steps after index
    for (let i = index + 1; i < this.events.length; i++) {
      const evEl = document.getElementById(`tl-event-${i}`);
      const node = document.getElementById(`tl-node-${i}`);
      if (evEl) evEl.classList.remove('revealed', 'current');
      if (node) node.classList.add('pending');
    }

    this._revealStep(index);

    if (this.isPlaying) {
      this._scheduleNext();
    }
  }

  stepBack() {
    const idx = Math.max(0, this.currentStep - 1);
    this.seekTo(idx);
  }

  stepForward() {
    const idx = Math.min(this.events.length - 1, this.currentStep + 1);
    this.seekTo(idx);
  }

  // ── UI updates ────────────────────────────────────────
  _updatePlayBtn() {
    const btn = document.getElementById('replay-play-btn');
    if (!btn) return;
    btn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    btn.setAttribute('aria-label', this.isPlaying ? 'Pause replay' : 'Play replay');
  }

  _updateScrubber(index) {
    const fill  = document.getElementById('scrubber-fill');
    const thumb = document.getElementById('scrubber-thumb');
    const label = document.getElementById('scrubber-time');
    const track = document.getElementById('scrubber-track');
    if (!fill || !thumb) return;

    const pct = index < 0 ? 0 : ((index + 1) / this.events.length) * 100;
    fill.style.width  = `${pct}%`;
    thumb.style.left  = `${pct}%`;

    if (track) {
      track.setAttribute('aria-valuenow', String(Math.max(0, index)));
    }
    if (label && index >= 0) {
      label.textContent = this.events[index]?.time || '';
    }
  }

  _updateDetail(ev) {
    const name    = document.getElementById('replay-step-name');
    const desc    = document.getElementById('replay-step-desc');
    const riskVal = document.getElementById('replay-risk-val');
    const riskLbl = document.getElementById('replay-risk-label');
    const agent   = document.getElementById('replay-active-agent');
    const files   = document.getElementById('replay-files');
    const action  = document.getElementById('replay-action');
    const proc    = document.getElementById('replay-process');

    if (!ev) {
      if (name)    name.textContent    = '—';
      if (desc)    desc.textContent    = 'Select a step or press Play to begin';
      if (riskVal) { riskVal.textContent = '12'; riskVal.className = 'replay-risk-val safe'; }
      if (riskLbl) riskLbl.textContent = 'SAFE';
      if (agent)   agent.textContent   = '—';
      if (files)   files.innerHTML     = '<span style="color:var(--white-400)">None yet</span>';
      if (action)  action.textContent  = '—';
      if (proc)    proc.textContent    = 'Awaiting simulation...';
      return;
    }

    if (name) name.textContent = `${ev.icon} ${ev.title}`;
    if (desc) desc.textContent = ev.description;

    // Risk color
    if (riskVal) {
      riskVal.textContent = ev.riskScore;
      riskVal.className   = 'replay-risk-val ' + (
        ev.riskScore >= 75 ? 'danger' :
        ev.riskScore >= 40 ? 'warning' : 'safe'
      );
    }
    if (riskLbl) {
      riskLbl.textContent = ev.riskScore >= 75 ? 'CRITICAL' :
                            ev.riskScore >= 40 ? 'ELEVATED' : 'SAFE';
    }

    if (agent) agent.innerHTML = `
      <span style="font-size:16px;margin-right:6px">${_agentIcon(ev.agent)}</span>
      ${ev.agentName}
    `;

    if (files) {
      files.innerHTML = ev.filesAffected.length === 0
        ? '<span style="color:var(--white-400)">No files affected</span>'
        : ev.filesAffected.map(f =>
            `<span style="font-family:var(--font-mono);font-size:11px;color:var(--white-700)">📄 ${f}</span>`
          ).join('');
    }

    if (action) action.textContent = ev.action;

    if (proc) {
      const processLines = [
        `[${ev.time}] ${ev.title}`,
        `Agent: ${ev.agentName}`,
        `Risk: ${ev.riskScore}/100`,
        ev.filesAffected.length ? `Files: ${ev.filesAffected.join(', ')}` : '',
        `Action: ${ev.action}`,
      ].filter(Boolean);
      proc.textContent = processLines.join('\n');
    }
  }

  // ── Load completed simulation events ──────────────────
  loadFromSimulation(completedEvents) {
    this.resetReplay();
    // Auto-reveal all steps
    setTimeout(() => {
      completedEvents.forEach((_, i) => {
        setTimeout(() => this._revealStep(i), i * 100);
      });
    }, 200);
  }
}

// Helper
function _agentIcon(agentId) {
  const icons = {
    'gatekeeper':    '🛡',
    'watchdog':      '👁',
    'risk-analyzer': '📊',
    'policy-engine': '⚖',
    'enforcer':      '⚡',
    'vaultkeeper':   '🔒',
  };
  return icons[agentId] || '🤖';
}
