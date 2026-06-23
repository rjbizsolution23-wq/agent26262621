<div align="center">
<img src="https://storage.googleapis.com/msgsndr/qQnxRHDtyx0uydPd5sRl/media/67eb83c5e519ed689430646b.jpeg" alt="RJ Business Solutions" width="320"/>

# Supreme AI Swarm Orchestrator (SASO)
### Built by **RJ Business Solutions** for **NeuronEdge Labs Inc.** | Architected by **Rick Jefferson**

📍 1342 NM 333, Tijeras, New Mexico 87059 | 🌐 [rickjeffersonsolutions.com](https://rickjeffersonsolutions.com)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/rjbizsolution23-wq/agent26262621/badge)](https://securityscorecards.dev/projects/github.com/rjbizsolution23-wq/agent26262621)
[![SLSA Level 3](https://img.shields.io/badge/SLSA-Level_3-success)](https://slsa.dev)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/rjbizsolution23-wq/agent26262621/actions)
</div>

---

## 🚀 Overview

The **Supreme AI Swarm Orchestrator (SASO)** is a state-of-the-art multi-agent cognitive planning and code generation system. SASO runs LLM routing and task decomposition serverless at the Cloudflare Edge, while executing local file operations and PowerShell tasks through a secure, persistent reverse WebSocket tunnel to a local daemon bridge running on your host machine.

---

## 📦 Features

- **Edge Swarm Coordination**: Decomposes complex natural language prompts into sequential multi-agent plans executed dynamically across 56 specialized local agents.
- **Reverse Tunnel Execution**: Proxies filesystem and process execution requests safely to your local machine via `/ws/bridge`.
- **Premium Dashboard**: Curated gold-and-blue visual canvas graphing active node states, running logs, and live file trees in real-time.
- **Credit Repair CRM & Dispute Letter Generator**: Premium glassmorphic dashboard to track clients, manage negative credit items, integrate the MyFreeScoreNow affiliate check, and compile professional Experian, Equifax, and TransUnion dispute letters.
- **Enterprise-Grade Compliance**: Standardized governance, NIST SP 800-171 controls mapping, and automated software bill of materials (SBOM) generation.

---

## 📚 Documentation & Reference

For detailed system architectures, configuration setup steps, and compliance reports, review:
- **System Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Edge-Local design and data flows.
- **Local Bridge Setup**: [docs/LOCAL_BRIDGE_SETUP.md](docs/LOCAL_BRIDGE_SETUP.md) — Starting the bridge daemon.
- **Specialized Agents**: [docs/SPECIALIZED_AGENTS.md](docs/SPECIALIZED_AGENTS.md) — List of the 56 active cognitive agents.
- **NIST/CMMC Compliance**: [docs/COMPLIANCE.md](docs/COMPLIANCE.md) — Mapping to NIST SP 800-171 controls.
- **Privacy Policy**: [docs/PRIVACY.md](docs/PRIVACY.md) & **Terms of Service**: [docs/TERMS.md](docs/TERMS.md).

---

## 🛠️ Getting Started

### 1. Configure the Cloudflare Edge Worker
Deploy the static dashboard assets and backend worker using wrangler:
```bash
npx wrangler pages deploy saso_dashboard --project-name saso-dashboard --branch main --commit-dirty=true
```

### 2. Configure Local API Keys
Add your OpenRouter/Groq/Resend API keys to a `.env` file in the project root directory:
```env
OPENROUTER_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
RESEND_API_KEY=your_resend_key_here
```

### 3. Launch the Local Bridge Daemon
Run the bridge daemon on your local PC to allow the Cloudflare Edge to execute commands:
```powershell
python saso_bridge.py --url wss://saso-dashboard.pages.dev/ws/bridge
```

### 4. Launch the Credit Repair CRM & Dispute Generator
Install dependencies and run the FastAPI server on port 8001:
```powershell
pip install -r credit_builder_crm/requirements.txt
python credit_builder_crm/main.py
```
Once started, access the beautiful glassmorphic client portal at `http://127.0.0.1:8001`. Use it to register clients, perform MyFreeScoreNow credit checks, extract negative items, and preview/print credit dispute letters.

---

## 💼 Corporate & Legal Identity

This project is built on behalf of **NeuronEdge Labs Inc.** and is fully maintained by **RJ Business Solutions**.
- **Owner / Principal**: Rick Jefferson
- **Corporate Entity**: NeuronEdge Labs Inc. (Wyoming C-Corp)
- **Email**: [rjbizsolution23@gmail.com](mailto:rjbizsolution23@gmail.com)
- **Website**: [rickjeffersonsolutions.com](https://rickjeffersonsolutions.com)
