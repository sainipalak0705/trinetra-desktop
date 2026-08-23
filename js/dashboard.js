/**
 * TRINETRA — Dashboard Controller
 * ──────────────────────────────────
 * Manages all dashboard sections, reactive state updates,
 * and ties the simulation engine to the UI.
 */

// ── Web Audio Sound Effects Synthesizer ───────────────────
class CyberAudioSynth {
  constructor() {
    this.ctx = null;
    this.muted = true;
  }
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  toggle() {
    this.muted = !this.muted;
    if (!this.muted) this.init();
    return !this.muted;
  }
  playTone(freq, type, duration, vol) {
    if (this.muted) return;
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
  playHover() {
    this.playTone(900, 'sine', 0.05, 0.03);
  }
  playClick() {
    this.playTone(1300, 'triangle', 0.1, 0.08);
    setTimeout(() => this.playTone(650, 'sine', 0.04, 0.05), 25);
  }
  playWarning() {
    this.playTone(180, 'sawtooth', 0.35, 0.1);
    this.playTone(360, 'sawtooth', 0.35, 0.05);
  }
  playSuccess() {
    this.playTone(523.25, 'sine', 0.12, 0.08); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.08), 70); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.08), 140); // G5
  }
  speak(text) {
    if (this.muted) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}
window.cyberAudio = new CyberAudioSynth();

const storedAudioState = localStorage.getItem('trinetra_audio_enabled') === 'true';
window.cyberAudio.muted = !storedAudioState;

/* ─────────────────────────────────────────────────────────
   INITIALIZATION
───────────────────────────────────────────────────────── */
let session, mockData, simulation, replay;

document.addEventListener('DOMContentLoaded', () => {
  // Auth guard
  session = requireAuth();
  if (!session) return;

  mockData   = window.TrinetraMockData;
  simulation = new TrinetraSimulation(mockData);

  // Build UI
  populateUser();
  renderHome();
  renderProtection();
  renderRecovery();
  renderIncident(false);
  renderHistory();
  renderSettings();

  // Navigation
  setupNav();

  // Simulation
  setupSimulation();

  // Initialize custom cursor, mouse trackers, and audio toggles
  initDashboardAesthetics();

  // Toast utility
  window.showDashToast = showToast;
});

function initDashboardAesthetics() {


  // Mouse Glow Tracker
  const cards = document.querySelectorAll('.panel-card, .stat-card, .agent-dash-card, .quick-action');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Audio Toggle Button
  const audioToggle = document.getElementById('audio-toggle-btn');
  if (audioToggle) {
    if (!window.cyberAudio.muted) {
      audioToggle.classList.add('active');
    }
    audioToggle.onclick = () => {
      const isMuted = window.cyberAudio.toggle();
      const active = !isMuted;
      audioToggle.classList.toggle('active', active);
      localStorage.setItem('trinetra_audio_enabled', active);
      if (active) {
        window.cyberAudio.playSuccess();
      }
    };
  }
}

/* ─────────────────────────────────────────────────────────
   USER INFO
───────────────────────────────────────────────────────── */
function populateUser() {
  const avatarEl  = document.getElementById('user-avatar');
  const nameEl    = document.getElementById('user-name');
  const roleEl    = document.getElementById('user-role');
  if (avatarEl) {
    const avatar = session.avatar || session.name?.charAt(0) || 'U';
    if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
      avatarEl.innerHTML = `<img src="${avatar}" alt="${session.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      avatarEl.style.background = 'none';
    } else {
      avatarEl.textContent = avatar;
      avatarEl.style.background = '';
    }
  }
  if (nameEl)   nameEl.textContent   = session.name;
  if (roleEl)   roleEl.textContent   = session.role === 'admin' ? 'Administrator' : 'User';
}

/* ─────────────────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────────────────── */
function setupNav() {
  const navItems  = document.querySelectorAll('.nav-item[data-section]');
  const sections  = document.querySelectorAll('.dash-section');
  const topTitle  = document.getElementById('dash-section-title');
  const topSub    = document.getElementById('dash-section-sub');

  const subtitles = {
    home:       'Overview of your system protection status',
    protection: 'Real-time agent status and monitoring',
    recovery:   'Trusted file versions and restore points',
    incident:   'Active threat analysis and response',
    replay:     'Interactive attack forensics timeline',
    history:    'Previous security incidents',
    settings:   'Configure protection preferences',
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.section;
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${target}`)?.classList.add('active');
      if (topTitle) topTitle.textContent = capitalize(target === 'replay' ? 'Attack Replay' : target);
      if (topSub)   topSub.textContent   = subtitles[target] || '';
    });
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    authLogout();
    window.location.href = 'index.html';
  });
}

/* ─────────────────────────────────────────────────────────
   HOME SECTION
───────────────────────────────────────────────────────── */
function renderHome() {
  const state = mockData.state;

  // Status ring
  updateStatusRing(state);

  // Stats
  const el = (id) => document.getElementById(id);
  animateNumber('stat-risk-score',      state.riskScore,      '',   1200);
  animateNumber('stat-protected-files', state.protectedFiles,  '',  1600);
  animateNumber('stat-versions',        state.recoveryVersions,'',  1400);
  animateNumber('stat-active-agents',   state.activeAgents,    '',  800);

  // Event log
  const logEl = document.getElementById('event-log');
  if (logEl) {
    logEl.innerHTML = mockData.eventLog.map(ev => `
      <div class="event-item">
        <div class="event-dot ${ev.type}" aria-hidden="true"></div>
        <div>
          <div class="event-text">${ev.text}</div>
          <div class="event-time">${ev.time}</div>
        </div>
      </div>
    `).join('');
  }

  // Quick actions
  const qa = document.getElementById('quick-actions');
  if (qa) {
    const actions = [
      { icon: '🔍', label: 'Run manual scan',      id: 'qa-scan'    },
      { icon: '➕', label: 'Add protected folder', id: 'qa-folder'  },
      { icon: '📂', label: 'Open recovery',        id: 'qa-recovery'},
      { icon: '📋', label: 'View history',         id: 'qa-history' },
    ];
    qa.innerHTML = actions.map(a => `
      <button class="quick-action" id="${a.id}" data-action="${a.id}" aria-label="${a.label}">
        <span class="quick-action-icon" aria-hidden="true">${a.icon}</span>
        ${a.label}
      </button>
    `).join('');

    qa.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'qa-recovery') navigateTo('recovery');
      if (action === 'qa-history')  navigateTo('history');
      if (action === 'qa-scan')     showToast('Manual scan started…', 'info');
      if (action === 'qa-folder')   showToast('Feature coming soon!', 'info');
    });
  }

  // Action buttons
  document.getElementById('home-protect-btn')?.addEventListener('click', () => navigateTo('protection'));
  document.getElementById('home-recovery-btn')?.addEventListener('click', () => navigateTo('recovery'));
}

function updateStatusRing(state) {
  const ringFill   = document.getElementById('ring-fill');
  const ringIcon   = document.getElementById('ring-icon');
  const statusCard = document.getElementById('status-card');
  const statusH2   = document.getElementById('status-title');
  const statusP    = document.getElementById('status-desc');

  const configs = {
    protected:      { score: 5, cls: 'safe',    icon: '🛡', color: 'var(--green)', title: "You're Protected", desc: "Real-time protection is active. 128 folders · 1,204 versions." },
    reviewing:      { score: 50, cls: 'warning', icon: '🔍', color: 'var(--yellow)', title: "Reviewing unusual activity", desc: "TRINETRA is analyzing file modifications. Stay calm." },
    threat_detected:{ score: 96, cls: 'threat',  icon: '⚠', color: 'var(--red-bright)', title: "Threat detected — action taken", desc: "TRINETRA has stopped the attack and is recovering your files." },
    recovering:     { score: 60, cls: 'warning', icon: '🔄', color: 'var(--cyan)', title: "Recovering files", desc: "Vaultkeeper is restoring trusted file versions." },
  };

  const cfg = configs[state.status] || configs.protected;
  const pct = (cfg.score / 100) * 283;

  if (ringFill) {
    ringFill.className     = `ring-fill ${cfg.cls}`;
    ringFill.style.stroke  = cfg.color;
    ringFill.style.strokeDashoffset = String(283 - pct);
  }
  if (ringIcon) ringIcon.textContent = cfg.icon;
  if (statusCard) {
    statusCard.className = `status-ring-card ${cfg.cls === 'safe' ? 'safe' : 'threat'}`;
  }
  if (statusH2) statusH2.textContent = cfg.title;
  if (statusP)  statusP.textContent  = cfg.desc;
}

/* ─────────────────────────────────────────────────────────
   PROTECTION SECTION
───────────────────────────────────────────────────────── */
function renderProtection() {
  const grid = document.getElementById('agents-grid');
  if (!grid) return;
  grid.innerHTML = mockData.agents.map(agent => `
    <div class="agent-dash-card ${agent.status === 'alert' ? 'alert-state' : agent.status === 'processing' ? 'processing' : ''}"
         id="agent-card-${agent.id}">
      <div class="agent-dash-header">
        <div class="agent-dash-info">
          <span class="agent-dash-icon" aria-hidden="true">${agent.icon}</span>
          <div>
            <div class="agent-dash-name">${agent.name}</div>
            <div class="agent-dash-detail">${agent.detail}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <div class="status-dot ${agent.status}" title="${agent.status}" aria-label="Status: ${agent.status}"></div>
          <span class="badge badge-${agent.status === 'active' ? 'green' : agent.status === 'alert' ? 'red' : agent.status === 'processing' ? 'cyan' : 'gray'}" id="agent-badge-${agent.id}">
            ${capitalize(agent.status)}
          </span>
        </div>
      </div>
      <div class="agent-dash-activity" id="agent-activity-${agent.id}">${agent.activity}</div>
      <div class="agent-dash-stats">
        <div class="agent-stat">
          <span id="agent-checks-${agent.id}">${agent.checks.toLocaleString()}</span>
          Checks
        </div>
        <div class="agent-stat">
          <span id="agent-blocked-${agent.id}">${agent.blocked}</span>
          Blocked
        </div>
        <div class="agent-stat">
          <span id="agent-last-${agent.id}">${agent.lastAction}</span>
          Last action
        </div>
      </div>
    </div>
  `).join('');
}

function refreshAgentCard(agent) {
  const card     = document.getElementById(`agent-card-${agent.id}`);
  const badge    = document.getElementById(`agent-badge-${agent.id}`);
  const activity = document.getElementById(`agent-activity-${agent.id}`);
  const last     = document.getElementById(`agent-last-${agent.id}`);
  const dot      = card?.querySelector('.status-dot');

  if (!card) return;

  // Update state classes
  card.classList.remove('alert-state', 'processing');
  if (agent.status === 'alert')      card.classList.add('alert-state');
  if (agent.status === 'processing') card.classList.add('processing');

  if (dot) {
    dot.className = `status-dot ${agent.status}`;
  }
  if (badge) {
    badge.className = `badge badge-${agent.status === 'active' ? 'green' : agent.status === 'alert' ? 'red' : agent.status === 'processing' ? 'cyan' : 'gray'}`;
    badge.textContent = capitalize(agent.status);
  }
  if (activity) activity.textContent = agent.activity;
  if (last)     last.textContent     = agent.lastAction || 'just now';
}

/* ─────────────────────────────────────────────────────────
   RECOVERY SECTION
───────────────────────────────────────────────────────── */
let selectedFileIndex = 0;

function renderRecovery() {
  renderFileList();
  renderFileVersions(0);
  renderRecoveryStatus();
}

function renderFileList() {
  const list = document.getElementById('recovery-file-list');
  if (!list) return;
  list.innerHTML = mockData.files.map((file, i) => `
    <div class="recovery-file-item ${i === selectedFileIndex ? 'selected' : ''}"
         id="recovery-file-${i}" data-file-index="${i}" role="button" aria-selected="${i === selectedFileIndex}"
         tabindex="0" aria-label="Select ${file.name}">
      <span class="recovery-file-icon" aria-hidden="true">${file.icon}</span>
      <span>${file.name}</span>
    </div>
  `).join('');

  list.addEventListener('click', (e) => {
    const item = e.target.closest('[data-file-index]');
    if (!item) return;
    selectedFileIndex = parseInt(item.dataset.fileIndex);
    renderFileList();
    renderFileVersions(selectedFileIndex);
  });
}

function renderFileVersions(fileIdx) {
  const file   = mockData.files[fileIdx];
  const panel  = document.getElementById('recovery-versions-panel');
  const title  = document.getElementById('recovery-file-title');
  if (!panel || !file) return;
  if (title) title.textContent = file.name;

  const list = document.getElementById('recovery-versions-list');
  if (!list) return;

  list.innerHTML = file.versions.map((v, vi) => `
    <div class="version-item ${v.trust}" id="version-item-${fileIdx}-${vi}">
      <div class="version-header">
        <span class="version-label">${v.label}</span>
        <span class="version-time">${v.timestamp}</span>
        <span class="badge badge-${v.trust === 'suspicious' ? 'red' : 'green'}" style="margin-left:auto">
          ${v.trust === 'suspicious' ? '⚠ SUSPICIOUS' : '✓ TRUSTED'}
        </span>
      </div>
      <div class="version-body">
        <div class="version-written-by">
          Written by: <span>${v.writtenBy}</span>
        </div>
        <div class="version-note">${v.note}</div>
        <div class="version-footer">
          ${v.recommended ? `
            <div class="version-recommended">
              <span class="status-dot active" aria-hidden="true"></span>
              <span><strong>Recommended</strong> recovery</span>
            </div>
            <button class="btn btn-primary btn-sm" id="restore-btn-${fileIdx}-${vi}"
                    data-file="${fileIdx}" data-version="${vi}"
                    aria-label="Restore ${file.name} to ${v.label}">
              Restore this version
            </button>
          ` : `
            <span class="badge badge-${v.trust === 'suspicious' ? 'red' : 'gray'}">
              ${v.trust === 'suspicious' ? 'Do not restore' : 'Restore available'}
            </span>
            ${v.trust === 'trusted' ? `
              <button class="btn btn-ghost btn-sm" id="restore-btn-${fileIdx}-${vi}"
                      data-file="${fileIdx}" data-version="${vi}">
                Restore
              </button>
            ` : ''}
          `}
        </div>
      </div>
    </div>
  `).join('');

  // Bind restore buttons
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-file][data-version]');
    if (!btn) return;
    const fi = parseInt(btn.dataset.file);
    const vi = parseInt(btn.dataset.version);
    showRestoreModal(fi, vi);
  });
}

function renderRecoveryStatus() {
  const rs = mockData.recoveryStatus;
  const el = document.getElementById('recovery-status-content');
  if (!el) return;
  el.innerHTML = `
    <div class="rec-status-title">Recovery Status</div>
    <div class="flex items-center gap-3" style="margin-bottom:16px">
      <div class="rec-status-big" id="rec-status-count">${rs.trustedCount} / ${rs.totalFiles}</div>
      <div class="rec-status-big-sub">files have a<br>trusted recovery<br>point</div>
    </div>
    <div class="rec-status-item">
      <div class="rec-status-check" aria-hidden="true">✓</div>
      <span>Written by a known, trusted application</span>
    </div>
    <div class="rec-status-item">
      <div class="rec-status-check" aria-hidden="true">✓</div>
      <span>Cryptographic signature matches file history</span>
    </div>
    <div class="rec-status-item">
      <div class="rec-status-check" aria-hidden="true">✓</div>
      <span>Saved before suspicious activity began</span>
    </div>
    <div style="margin-top:16px;padding-top:16px;border-top:var(--border-subtle)">
      <div style="font-size:12px;color:var(--white-500);margin-bottom:8px">Technical details</div>
      <div style="font-size:11px;color:var(--white-400);font-family:var(--font-mono);line-height:1.8">
        Recovery points: ${rs.recoveryPoints}<br>
        ${rs.noFilesLost ? '<span style="color:var(--green)">✓ No files permanently lost</span>' : ''}
      </div>
    </div>
  `;
}

// ── Restore Modal ──────────────────────────────────────────
function showRestoreModal(fileIdx, versionIdx) {
  const file    = mockData.files[fileIdx];
  const version = file?.versions[versionIdx];
  if (!file || !version) return;

  const modal = document.getElementById('restore-modal');
  const title = document.getElementById('restore-modal-title');
  const body  = document.getElementById('restore-modal-body');
  const conf  = document.getElementById('restore-modal-confirm');

  if (title) title.textContent = `Restore ${file.name}`;
  if (body) body.innerHTML = `
    Restore <strong>${file.name}</strong> to <strong>${version.label}</strong>
    (${version.timestamp})?<br><br>
    This will replace the current version with the trusted snapshot
    written by <code style="font-family:var(--font-mono);color:var(--cyan)">${version.writtenBy}</code>.
    <br><br>
    The current (suspicious) version will be moved to quarantine.
  `;

  if (conf) {
    conf.onclick = () => {
      closeRestoreModal();
      showToast(`${file.name} restored to ${version.label}`, 'success');
      // Update file version data (mock)
      file.versions = file.versions.filter(v => v.trust !== 'suspicious');
      renderFileVersions(selectedFileIndex);
      renderRecoveryStatus();
    };
  }

  modal?.classList.add('open');
}

function closeRestoreModal() {
  document.getElementById('restore-modal')?.classList.remove('open');
}
// Expose as global for inline onclick in HTML
window.closeRestoreModal = closeRestoreModal;

/* ─────────────────────────────────────────────────────────
   INCIDENT SECTION
───────────────────────────────────────────────────────── */
function renderIncident(hasIncident) {
  const container = document.getElementById('incident-content');
  if (!container) return;

  if (!hasIncident) {
    container.innerHTML = `
      <div style="text-align:center;padding:80px 40px;color:var(--white-500)">
        <div style="font-size:48px;margin-bottom:16px" aria-hidden="true">✅</div>
        <div style="font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px">No active incidents</div>
        <div style="font-size:14px;margin-bottom:32px">Your system is protected. No threats have been detected.</div>
        <button class="btn btn-ghost" id="run-sim-from-incident" aria-label="Run attack simulation">
          ▶ Run Attack Simulation to see this in action
        </button>
      </div>
    `;
    document.getElementById('run-sim-from-incident')?.addEventListener('click', () => {
      startSimulation();
    });
    return;
  }

  const inc = mockData.currentIncident;
  container.innerHTML = `
    <div class="incident-layout">
      <!-- Main -->
      <div class="incident-main-card">
        <div class="incident-alert-header">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <div class="incident-alert-dot" aria-hidden="true"></div>
              <span class="badge badge-red">CRITICAL THREAT</span>
              <span class="badge badge-gray" id="incident-time-badge">Active now</span>
            </div>
            <h2 class="incident-title">${inc.title}</h2>
            <p class="incident-summary">${inc.summary}</p>
          </div>
          <div style="text-align:center;flex-shrink:0">
            <div class="incident-risk-big" aria-label="Risk score: ${inc.riskScore}">${inc.riskScore}</div>
            <div class="incident-risk-label">Risk Score</div>
          </div>
        </div>

        <div class="incident-section-title">Why this was detected</div>
        <div class="incident-reason-list">
          ${inc.detectionReasons.map(r => `<div class="incident-reason-item">${r}</div>`).join('')}
        </div>

        <div class="incident-section-title">Detection Signals</div>
        <table class="signals-table" aria-label="Detection signals">
          <thead>
            <tr><th>Signal</th><th>Value</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${inc.detectionSignals.map(s => `
              <tr>
                <td>${s.label}</td>
                <td>${s.value}</td>
                <td class="${s.anomaly ? 'signal-anomaly' : ''}">${s.anomaly ? '⚠ Anomaly' : '✓ Normal'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="incident-actions-row">
          <button class="btn btn-primary" id="recover-files-btn" aria-label="Recover affected files">
            🔄 Recover Files
          </button>
          <button class="btn btn-ghost" id="view-technical-btn" aria-label="View technical details and attack replay">
            📋 View Technical Details ↓
          </button>
        </div>
      </div>

      <!-- Actions taken -->
      <div class="actions-taken-panel">
        <div class="actions-taken-title">Actions Taken</div>
        ${inc.actionsTaken.map(a => `
          <div class="action-taken-item">
            <div class="action-taken-check ${a.done ? '' : 'pending'}" aria-hidden="true">
              ${a.done ? '✓' : '…'}
            </div>
            <span>${a.label}</span>
          </div>
        `).join('')}

        <div style="margin-top:16px;padding-top:16px;border-top:var(--border-subtle)">
          <div style="font-size:12px;color:var(--white-500);margin-bottom:12px">Affected Files</div>
          ${inc.affectedFiles.map(f => `
            <div style="font-size:12px;color:var(--white-700);padding:4px 0;font-family:var(--font-mono)">📄 ${f}</div>
          `).join('')}
        </div>

        <div style="margin-top:auto;padding-top:20px">
          <button class="btn btn-outline-red" style="width:100%" id="inc-generate-report"
                  aria-label="Generate incident report">
            📋 Generate Report
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('recover-files-btn')?.addEventListener('click', () => {
    navigateTo('recovery');
    showToast('Opening recovery panel…', 'info');
  });
  document.getElementById('view-technical-btn')?.addEventListener('click', () => {
    navigateTo('replay');
  });
  document.getElementById('inc-generate-report')?.addEventListener('click', () => {
    showToast('Incident report generated!', 'success');
  });
}

/* ─────────────────────────────────────────────────────────
   HISTORY SECTION
───────────────────────────────────────────────────────── */
function renderHistory() {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  const allHistory = [...mockData.history];

  tbody.innerHTML = allHistory.length === 0 ? `
    <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--white-500)">No incidents recorded</td></tr>
  ` : allHistory.map((inc, i) => `
    <tr>
      <td>${inc.date}</td>
      <td style="font-family:var(--font-mono)">${inc.time}</td>
      <td>${inc.title}</td>
      <td>
        <span class="badge badge-${inc.severity === 'critical' ? 'red' : inc.severity === 'medium' ? 'yellow' : 'gray'}">
          ${inc.severity.toUpperCase()}
        </span>
      </td>
      <td style="font-family:var(--font-mono);color:var(--${inc.severity === 'critical' ? 'red-bright' : 'yellow'})">${inc.riskScore}</td>
      <td>
        <span class="badge badge-green">✓ ${inc.status}</span>
      </td>
      <td>
        <button class="btn btn-ghost btn-sm" data-history-index="${i}" aria-label="View replay for ${inc.title}">
          ▶ View Replay
        </button>
      </td>
    </tr>
  `).join('');

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-history-index]');
    if (!btn) return;
    navigateTo('replay');
    showToast('Loading incident replay…', 'info');
  });
}

/* ─────────────────────────────────────────────────────────
   SETTINGS SECTION
───────────────────────────────────────────────────────── */
function renderSettings() {
  const settings = mockData.settings;

  // Bind toggles
  bindToggle('setting-threat-notif',   settings, 'threatNotifications');
  bindToggle('setting-auto-response',  settings, 'automaticResponse');
  bindToggle('setting-email-alerts',   settings, 'emailAlerts');
  bindToggle('setting-sms-alerts',     settings, 'smsAlerts');

  // Select fields
  const freqEl = document.getElementById('setting-backup-freq');
  if (freqEl) {
    freqEl.value = settings.backupFrequency;
    freqEl.addEventListener('change', () => {
      settings.backupFrequency = freqEl.value;
      showToast('Settings saved', 'success');
    });
  }
  const versEl = document.getElementById('setting-versions-keep');
  if (versEl) {
    versEl.value = settings.versionsToKeep;
    versEl.addEventListener('change', () => {
      settings.versionsToKeep = parseInt(versEl.value);
      showToast('Settings saved', 'success');
    });
  }
}

function bindToggle(id, obj, key) {
  const input = document.getElementById(id);
  if (!input) return;
  input.checked = obj[key];
  input.addEventListener('change', () => {
    obj[key] = input.checked;
    showToast(`${key.replace(/([A-Z])/g, ' $1').trim()} ${input.checked ? 'enabled' : 'disabled'}`, 'success');
  });
}

/* ─────────────────────────────────────────────────────────
   SIMULATION
───────────────────────────────────────────────────────── */
function setupSimulation() {
  const simBtn      = document.getElementById('run-sim-btn');
  const simOverlay  = document.getElementById('sim-overlay');
  const simStepText = document.getElementById('sim-step-text');
  const simProgress = document.getElementById('sim-progress-fill');
  const incBadge    = document.getElementById('incident-nav-badge');

  if (simBtn) {
    simBtn.addEventListener('click', startSimulation);
  }

  // Simulation events
  simulation.on('started', () => {
    if (simBtn) {
      simBtn.classList.add('running');
      simBtn.innerHTML = `<span class="sim-indicator" aria-hidden="true"></span><span>Simulating...</span>`;
    }
    if (simOverlay) simOverlay.classList.add('visible');
    
    // Add screen warning siren flash class to body
    document.body.classList.add('threat-alert-flash');

    // Reset and initialize simulation console logs
    const consoleEl = document.getElementById('sim-console');
    if (consoleEl) {
      consoleEl.innerHTML = '<div class="sim-console-line gray">> TRINETRA Intrusion Mitigation Engine online. Listening to kernel filesystem interrupts...</div>';
    }

    showToast('Attack simulation started!', 'warning');
    
    // Sound & Voice warnings
    window.cyberAudio.playWarning();
    window.cyberAudio.speak("Intrusion detected. Unknown process spawned. Initializing Trinetra Agent Defense.");
  });

  simulation.on('step', ({ event, index, progress }) => {
    // Update overlay text & progress
    if (simStepText) simStepText.textContent = `${event.icon} ${event.title} — ${event.action}`;
    if (simProgress) simProgress.style.width = `${progress}%`;

    // Append cyber console log
    const consoleEl = document.getElementById('sim-console');
    if (consoleEl) {
      let typeClass = 'gray';
      if (event.type === 'attack' || event.type === 'threat') typeClass = 'red';
      else if (event.type === 'detection' || event.type === 'analysis') typeClass = 'yellow';
      else if (event.type === 'decision' || event.type === 'containment') typeClass = 'cyan';
      else if (event.type === 'recovery' || event.type === 'resolved') typeClass = 'green';
      
      const logLine = document.createElement('div');
      logLine.className = `sim-console-line ${typeClass}`;
      logLine.textContent = `[${event.time}] [${event.agentName || 'SYS'}] > ${event.title.toUpperCase()}: ${event.action}`;
      consoleEl.appendChild(logLine);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    // Speech announcements & Audio beeps
    const speechPrompts = {
      0: "Attack initiated. Malicious process spawned.",
      2: "Warning. High velocity writes detected by filesystem watchdog.",
      4: "Threat classification confirmed. Policy engine triggered containment.",
      5: "Malicious process terminated. Network connections isolated by Enforcer.",
      6: "Vaultkeeper recovering files from cryptographic snapshots.",
      7: "Threat neutralized. Files fully restored."
    };
    if (speechPrompts[index]) {
      window.cyberAudio.speak(speechPrompts[index]);
    }

    if (window.cyberAudio && !window.cyberAudio.muted) {
      if (event.type === 'attack' || event.type === 'threat') {
        window.cyberAudio.playWarning();
      } else if (event.type === 'resolved') {
        window.cyberAudio.playSuccess();
      } else {
        window.cyberAudio.playTone(850 + index * 75, 'sine', 0.12, 0.04);
      }
    }

    // Update risk score display
    animateNumber('stat-risk-score', event.riskScore, '', 600);

    // Refresh status ring
    updateStatusRing(mockData.state);

    // Refresh agent cards (protection section)
    mockData.agents.forEach(refreshAgentCard);

    // Update event log
    const logEl = document.getElementById('event-log');
    if (logEl) {
      const newEvent = {
        time: event.time,
        type: event.type === 'resolved' ? 'safe' : 'danger',
        text: event.title,
      };
      const item = document.createElement('div');
      item.className = 'event-item animate-fade-in';
      item.innerHTML = `
        <div class="event-dot ${newEvent.type}" aria-hidden="true"></div>
        <div>
          <div class="event-text">${newEvent.text}</div>
          <div class="event-time">${newEvent.time}</div>
        </div>
      `;
      logEl.prepend(item);
    }
  });

  simulation.on('completed', ({ incident }) => {
    // Reset button
    if (simBtn) {
      simBtn.classList.remove('running');
      simBtn.innerHTML = `<span>▶ Run Attack Simulation</span>`;
    }
    if (simOverlay) simOverlay.classList.remove('visible');

    // Remove screen warning siren flash class from body
    document.body.classList.remove('threat-alert-flash');

    // Store incident in mock data
    mockData.currentIncident = incident;
    mockData.history.unshift({
      id:           incident.id,
      date:         new Date().toLocaleDateString(),
      time:         new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      title:        incident.title,
      severity:     'critical',
      riskScore:    incident.riskScore,
      status:       'resolved',
      duration:     '20 sec',
      filesAffected: 0,
    });

    // Re-render sections
    renderIncident(true);
    renderHistory();

    // Show incident badge on nav
    if (incBadge) {
      incBadge.style.display = 'block';
      incBadge.textContent   = '1';
    }

    showToast('Attack simulation complete! Check the Incident tab.', 'success');

    // Init replay with simulation data
    const replayContainer = document.getElementById('section-replay');
    if (replayContainer) {
      if (!replay) {
        replay = new TrinetraReplay(simulation, replayContainer);
      }
    }

    // Navigate to incident after short delay
    setTimeout(() => navigateTo('incident'), 800);
  });
}

function startSimulation() {
  if (simulation.isRunning) return;
  simulation.start();
}

/* ─────────────────────────────────────────────────────────
   REPLAY SECTION (lazy init)
───────────────────────────────────────────────────────── */
document.addEventListener('click', (e) => {
  const navItem = e.target.closest('.nav-item');
  if (!navItem) return;
  const section = navItem.dataset.section;
  if (section === 'replay') {
    const container = document.getElementById('section-replay');
    if (!replay && container) {
      replay = new TrinetraReplay(simulation, container);
    }
  }
});

/* ─────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────── */
function navigateTo(section) {
  document.querySelector(`.nav-item[data-section="${section}"]`)?.click();
}
// Expose as globals for inline scripts
window.navigateTo    = navigateTo;
window.startSimulation = startSimulation;

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function animateNumber(elementId, target, suffix = '', duration = 1000) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const start = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function showToast(message, type = 'info') {
  let container = document.getElementById('dash-toast-container');
  if (!container) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span aria-hidden="true">${icons[type] || 'ℹ'}</span>${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition= 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
