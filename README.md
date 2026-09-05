# TRINETRA — AI-Powered Ransomware Defense System

> An intelligent, multi-agent cybersecurity system designed to detect ransomware activity, assess risk, and coordinate automated response.

TRINETRA is a cybersecurity project that combines machine learning, Python-based backend agents, and a desktop command center to provide a unified view of ransomware detection, risk assessment, containment, and recovery.

The system is being developed as a functional prototype, with the goal of building a more complete endpoint security and automated response platform.

---

## Overview

Ransomware attacks can encrypt files, disrupt systems, and cause significant data loss.

TRINETRA is designed to address this problem through a coordinated workflow:

- Monitor suspicious system activity.
- Identify potentially malicious behavior.
- Assess the level of risk.
- Decide whether a response is required.
- Contain the threat.
- Support recovery of affected files.

The system uses six specialized agents that work together rather than relying on a single detection component.

---

## How TRINETRA Works

The proposed workflow is:

```text
System Activity
      ↓
┌───────────────────────┐
│ WATCHDOG              │
│ Monitors activity     │
│ and detects signals   │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ GATEKEEPER            │
│ Filters and validates │
│ suspicious activity   │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ RISK ANALYSER         │
│ ML-based risk         │
│ assessment            │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ POLICY ENGINE         │
│ Decides the response  │
│ according to policy   │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ VAULTKEEPER           │
│ Supports file         │
│ protection and        │
│ recovery              │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│ ENFORCER              │
│ Executes containment  │
│ actions               │
└───────────────────────┘
```

### Agent Responsibilities

| Agent | Responsibility |
|---|---|
| **Watchdog** | Monitors system activity and identifies suspicious behavior. |
| **Gatekeeper** | Filters and validates activity before it moves further through the workflow. |
| **Risk Analyser** | Uses the ransomware detection model to assess the risk associated with the observed activity. |
| **Policy Engine** | Evaluates the risk assessment and determines the appropriate response according to the configured policy. |
| **Vaultkeeper** | Handles the protection and recovery side of the system, including recovery-related operations. |
| **Enforcer** | Executes the response actions required to contain the threat. |

The agents are designed to work in coordination, allowing detection, decision-making, containment, and recovery to be handled as connected stages of the same workflow.

---

## Machine Learning Component

The Risk Analyser uses a **Random Forest classification model** developed for ransomware risk analysis.

The model is trained to identify patterns associated with ransomware behavior and provide a risk assessment that can be used by the downstream policy and response workflow.

The ML component is one part of the larger system: the model provides the risk assessment, while the other agents handle the surrounding detection and response process.

---

## Desktop Application

TRINETRA also includes a desktop command center that provides a visual interface for interacting with the system.

The application is being developed using **Tauri**, with a React and TypeScript frontend.

### Current Desktop Features

- **Command Center** — A central dashboard for viewing system status, risk level, active agents, and security activity.
- **Live Monitor** — Displays live risk information, activity graphs, and event feeds.
- **Agent Network** — Provides an overview of the six agents and their current states.
- **Attack Replay** — Allows users to view the simulated attack and observe the response workflow.
- **Threat Alerts** — Displays alerts when a critical threat is detected.
- **Incidents** — Provides an interface for viewing and managing security incidents.
- **Files** — Provides access to file-related security operations.
- **Recovery** — Provides access to recovery-related operations.
- **Simulation Lab** — Supports testing and demonstrating the system's response workflow.
- **Reports** — Provides access to system reports.
- **Quick Actions** — Provides shortcuts for frequently used security operations.

---

## Project Status

**Current Stage: Functional Prototype / Active Development**

TRINETRA is currently being developed as a prototype to demonstrate the integration of machine learning, coordinated security agents, and a desktop command center.

The current implementation focuses on:

- Developing the Python backend and agent workflow.
- Integrating the ransomware risk analysis model.
- Connecting the detection, decision, containment, and recovery stages.
- Building the desktop command center.
- Testing the system through simulated ransomware scenarios.

The project is **not yet a production-ready endpoint security solution**.

Further development is required for areas such as broader real-world testing, deployment hardening, and production-level reliability.

---

## Project Structure

```text
trinetra-desktop/
│
├── src/                  # Desktop frontend
├── src-tauri/            # Tauri desktop application
├── package.json          # Project configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── README.md
```

---

## Related Repositories

### Backend & Ransomware Detection Model

[TRINETRA Ransomware Detection System](https://github.com/vanshikanegi01/ransomware-detection-system)

Contains the ransomware detection and risk analysis component used in the project.

### Desktop Application

[TRINETRA Desktop](https://github.com/sainipalak0705/trinetra-desktop)

Contains the desktop command center and its frontend implementation.

### Website

[TRINETRA Website](https://trinetra-orpin.vercel.app/index.html)

Contains the website for TRINETRA, showcasing its cybersecurity platform, key features, ransomware detection workflow, and overall system architecture.

---

## Future Development

Planned improvements include:

- More extensive testing with ransomware behavior.
- Further integration of the backend and desktop application.
- Improved recovery and containment workflows.
- Enhanced monitoring and reporting.
- More comprehensive testing before production deployment.

---

## Disclaimer

TRINETRA is an academic / development project and is currently under active development.

It should not be considered a replacement for a production-grade endpoint security solution.

---

## Development Team

Developed by **Team Cipher Syndicate** as part of **Smart India Hackathon 2026**.

- [Priyanshi Saini](https://github.com/sainipriyanshi7284)
- [Vanshika Negi](https://github.com/vanshikanegi01)
- [Palak Saini](https://github.com/sainipalak0705)
- [Priya Aggarwal](https://github.com/Priya-30101)
- [Prakhar Srivastava](https://github.com/prakharsrivastava252734)
- [Ansh Dhawan](https://github.com/)


## License

This project is currently under development. Licensing information will be added as the project progresses.
