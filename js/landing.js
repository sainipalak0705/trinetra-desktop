/**
 * TRINETRA — Landing Page Interactions & Cyber Aesthetics
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
    } catch (e) {
      // AudioContext fails silently if blocked
    }
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
}
window.cyberAudio = new CyberAudioSynth();

// Load sound setting from localStorage
const storedAudioState = localStorage.getItem('trinetra_audio_enabled') === 'true';
window.cyberAudio.muted = !storedAudioState;

document.addEventListener('DOMContentLoaded', () => {
  // ── Nav scroll effect ──────────────────────────────────
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── Scroll reveal ──────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  const observer  = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => observer.observe(el));

  // ── Counter animation ──────────────────────────────────
  animateCounters();

  // ── Attack flow highlight on hover ─────────────────────
  setupFlowDiagram();

  // ── Typing effect for hero ─────────────────────────────
  setupTypingEffect();

  // ── Contact form ───────────────────────────────────────
  setupContactForm();

  // ── Mobile nav ─────────────────────────────────────────
  setupMobileNav();

  // ── Audio Toggle button setup ─────────────────────────
  setupAudioToggle();



  // ── Mouse Glow cards setup ────────────────────────────
  initMouseGlowTracker();

  // ── Hero Terminal setup ───────────────────────────────
  initHeroTerminal();

  // ── Toast utility ──────────────────────────────────────
  window.showToast = showToast;
});

// ── Audio Toggle Setup ───────────────────────────────────
function setupAudioToggle() {
  const toggle = document.getElementById('audio-toggle-btn');
  if (!toggle) return;
  
  if (!window.cyberAudio.muted) {
    toggle.classList.add('active');
  }
  
  toggle.addEventListener('click', () => {
    const isMuted = window.cyberAudio.toggle();
    const active = !isMuted;
    toggle.classList.toggle('active', active);
    localStorage.setItem('trinetra_audio_enabled', active);
    if (active) {
      window.cyberAudio.playSuccess();
    }
  });
}





// ── Mouse Glow cards tracker ─────────────────────────────
function initMouseGlowTracker() {
  const cards = document.querySelectorAll('.agent-card, .overview-card, .feature-item, .contact-info, .contact-form, .download-card, .hero-terminal');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// ── Hero Terminal live updates ────────────────────────────
function initHeroTerminal() {
  const logEl = document.getElementById('terminal-log');
  if (!logEl) return;
  
  const logLines = [
    { text: '> TRINETRA security framework initialized.', type: 'info' },
    { text: '> Watchdog daemon running. Watching 1,204 files.', type: 'info' },
    { text: '> Gatekeeper monitoring active network sockets.', type: 'info' },
    { text: '> System integrity status: NOMINAL.', type: 'success' },
    { text: '> SCANNING: [Client Database, Server Configs, Source Code]', type: 'info' },
    { text: '> ALERT: Unsigned process execution attempt.', type: 'warning' },
    { text: '> Process ID: 8941 (unknown_process.exe)', type: 'warning' },
    { text: '> CRITICAL: Anomalous file modifications in /user/documents.', type: 'danger' },
    { text: '> Watchdog: Write velocity spiked to 45 writes/second!', type: 'danger' },
    { text: '> Risk Analyzer: Spiking risk score from 12 to 74.', type: 'danger' },
    { text: '> Analysis: Entropy spike 7.95 (signature: RANSOMWARE).', type: 'danger' },
    { text: '> Policy Engine: Classification VALIDATED. Triggering containment.', type: 'warning' },
    { text: '> Enforcer: Process 8941 terminated. Network interfaces isolated.', type: 'success' },
    { text: '> Vaultkeeper: Verifying cryptographic backup snapshots...', type: 'info' },
    { text: '> Vaultkeeper: Restoring client_database.db from V6 (Trusted)...', type: 'success' },
    { text: '> Vaultkeeper: Restoring system_configs.json from V12 (Trusted)...', type: 'success' },
    { text: '> RECOVERY COMPLETE. 0 files lost. System status reset to Safe.', type: 'success' },
  ];
  
  let currentLine = 0;
  
  function appendLine() {
    if (currentLine >= logLines.length) {
      setTimeout(() => {
        logEl.innerHTML = '';
        currentLine = 0;
        appendLine();
      }, 7000);
      return;
    }
    
    const line = logLines[currentLine];
    const el = document.createElement('div');
    el.className = `terminal-line ${line.type}`;
    el.textContent = line.text;
    logEl.appendChild(el);
    
    logEl.scrollTop = logEl.scrollHeight;
    currentLine++;
    
    // Play sound if enabled
    if (window.cyberAudio && !window.cyberAudio.muted) {
      if (line.type === 'danger') {
        window.cyberAudio.playWarning();
      } else {
        window.cyberAudio.playTone(1500 - currentLine * 35, 'sine', 0.04, 0.008);
      }
    }
    
    let delay = 1000;
    if (line.type === 'danger') delay = 500;
    if (line.type === 'success') delay = 1300;
    if (line.text.includes('RECOVERY COMPLETE')) delay = 3500;
    
    setTimeout(appendLine, delay);
  }
  
  setTimeout(appendLine, 1200);
}

// ── Counter animation ─────────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let start    = 0;
      const dur    = 1800;
      const step   = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / dur, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ── Flow diagram ──────────────────────────────────────────
function setupFlowDiagram() {
  const nodes = document.querySelectorAll('.flow-node');
  nodes.forEach((node, i) => {
    node.addEventListener('mouseenter', () => {
      nodes.forEach(n => n.classList.remove('highlight'));
      for (let j = 0; j <= i; j++) nodes[j].classList.add('highlight');
    });
    node.addEventListener('mouseleave', () => {
      nodes.forEach(n => n.classList.remove('highlight'));
    });
  });
}

// ── Typing effect ─────────────────────────────────────────
function setupTypingEffect() {
  const el = document.getElementById('typing-target');
  if (!el) return;
  const texts = [
    'Ransomware Defense.',
    'Cyber Resilience.',
    'Threat Neutralization.',
    'Zero-Trust Recovery.',
  ];
  let textIndex = 0;
  let charIndex = 0;
  let deleting  = false;

  function type() {
    const current = texts[textIndex];
    if (deleting) {
      el.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(type, 400);
        return;
      }
    } else {
      el.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    }
    setTimeout(type, deleting ? 45 : 85);
  }
  setTimeout(type, 1000);
}

// ── Contact form ──────────────────────────────────────────
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We\'ll get back to you soon.', 'success');
    form.reset();
  });
}

// ── Mobile nav ────────────────────────────────────────────
function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.style.display === 'flex';
    menu.style.display = open ? 'none' : 'flex';
  });
}

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const toast  = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span>${message}`;
  container.appendChild(toast);
  
  if (window.cyberAudio && !window.cyberAudio.muted) {
    if (type === 'success') window.cyberAudio.playSuccess();
    else if (type === 'error') window.cyberAudio.playWarning();
    else window.cyberAudio.playTone(1000, 'sine', 0.1, 0.04);
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
