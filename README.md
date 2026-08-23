# 🛡️ TRINETRA

### Cyber Resilience & Ransomware Defense

TRINETRA is an interactive cybersecurity platform designed to demonstrate how a multi-agent ransomware defense system detects, analyzes, contains, and recovers from ransomware attacks.

The website provides a public product experience along with an authenticated security dashboard where users can monitor protection, simulate attacks, inspect incidents, replay attack timelines, and view recovery activity.

---

## 🌐 Website

The TRINETRA website consists of two main experiences:

### Landing Website

The public-facing website introduces TRINETRA through:

* Product overview
* How TRINETRA works
* Multi-agent architecture
* Defense agent descriptions
* Key features
* Attack lifecycle
* Developer information
* Contact section
* Software download
* Login / Sign Up

### Security Dashboard

After authentication, users can access the TRINETRA security dashboard.

Dashboard modules include:

* **Home** — system protection and security overview
* **Protection** — monitor TRINETRA's defense agents
* **Recovery** — manage trusted recovery versions
* **Incident** — inspect detected threats
* **Attack Replay** — reconstruct the attack timeline
* **History** — view previous incidents
* **Settings** — configure protection preferences

---

## 🎬 Attack Replay

The website's primary interactive feature is the **Attack Replay**.

It reconstructs a ransomware incident using timestamped events and visualizes the complete attack lifecycle:

```text
Attack
  ↓
Detection
  ↓
Analysis
  ↓
Threat Decision
  ↓
Containment
  ↓
Recovery
```

Users can observe:

* Attack timestamps
* Files affected
* Suspicious processes
* Risk-score changes
* Agent activity
* Detection signals
* Containment actions
* Recovery events

The replay can be played at different speeds to visualize how the incident progressed.

---

## 🤖 TRINETRA Defense Agents

The dashboard represents six specialized agents:

| Agent             | Role                                     |
| ----------------- | ---------------------------------------- |
| **Gatekeeper**    | URL, DNS, phishing and file screening    |
| **Watchdog**      | Filesystem and activity monitoring       |
| **Risk Analyzer** | Behavioral analysis and risk scoring     |
| **Policy Engine** | Threat validation and response decisions |
| **Enforcer**      | Threat containment and response          |
| **Vaultkeeper**   | Protected backup and recovery            |

---

## 🧪 Attack Simulation

The current website uses **mock backend data** to demonstrate ransomware scenarios.

A simulation can trigger a sequence such as:

```text
Suspicious Activity
        ↓
File Modifications
        ↓
Watchdog Detection
        ↓
Risk Analysis
        ↓
Policy Decision
        ↓
Threat Containment
        ↓
Recovery
        ↓
System Restored
```

This allows the complete dashboard experience to be demonstrated before integration with the real TRINETRA backend.

---

## 🎨 Design

The landing page uses a modern cybersecurity aesthetic featuring:

* Dark interface
* Red security accents
* White typography
* Interactive elements
* Security-inspired animations
* Terminal-style visuals

The authenticated dashboard uses a clean, professional security-software interface optimized for monitoring and incident analysis.

---

## 🏗️ Website Flow

```text
Landing Page
     │
     ├── Explore TRINETRA
     ├── Features
     ├── How It Works
     └── Login / Sign Up
              │
              ▼
          Authentication
              │
              ▼
          Dashboard
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
 Protection Recovery Incident
                       │
                       ▼
                 Attack Replay
                       │
                       ▼
                    Recovery
```

---

## 💻 Tech Stack

* HTML
* CSS
* JavaScript
* [Add your framework here if applicable]
* Mock API / JSON data
* [Add backend technology when integrated]

---

## 🚀 Current Status

**Frontend Prototype**

The current version focuses on the website experience, authenticated dashboard, interactive attack simulation, and attack replay using mock data.

The architecture is designed to later connect with the actual TRINETRA backend and real security telemetry.

---

## 🔮 Future Integration

The website can later be connected to:

* Real filesystem telemetry
* Process monitoring
* Network activity
* Machine-learning detection
* Agent outputs
* Secure backup systems
* Automated recovery
* Real-time incident events

---

## 📌 Vision

**TRINETRA — Protect. Detect. Contain. Recover.**

A visual security experience that allows users not only to know that an attack occurred, but to understand **how it happened, how TRINETRA responded, and how the system recovered.**
