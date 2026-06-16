# Changelog

All notable changes to the Supreme AI Swarm Orchestrator (SASO) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-06-16

### Added
- **Credit Repair CRM (`credit_builder_crm/`)**: A professional Client Relationship Management (CRM) directory structure.
- **MyFreeScoreNow Integration**: Automated tracking and enrollment checking leveraging affiliate parameters `AID=RickJeffersonSolutions` (PIDs `49914` & `30639`).
- **Credit Report Analysis & Negatives Extractor**: Built-in logic to pull and isolate negative credit items (charge-offs, late payments, collection accounts).
- **Dispute Letter Generator**: Dynamic template compilers for Equifax, Experian, and TransUnion dispute packets.
- **Premium Client Portal Dashboard**: Dark-mode glassmorphic client interface supporting client CRUD, automated dispute checking, dynamic email dispatching via Resend API, and print-ready PDF styling.

## [2.1.0] - 2026-06-16

### Added
- **Python Execution Harness (`python_harness.py`)**: Subprocess execution harness for secure isolated python testing and compilation runs.
- **Run Python Code Routing**: Multi-agent tag parser for `RUN_PYTHON` action routing from Cloudflare Edge down to the local host machine.

## [2.0.0] - 2026-06-14

This is the initial production-ready release of the Cloudflare-deployed Swarm Orchestrator, completely rebuilt under RJ Business Solutions standards.

### Added
- **Cloudflare Edge Deployment**: Serverless cognitive planning worker and API router running at edge.
- **WebSocket Execution Tunnel**: Local execution bridge `saso_bridge.py` allowing command routing from edge to local machine.
- **Compliance Scaffolding**: Structured governance, licensing (Apache 2.0), CLA, OpenSSF Scorecard, and NIST/CMMC mappings.
- **Visual Swarm Dashboard**: Interactive graph visualizer dashboard displaying agent activations.

### Fixed
- Javascript multi-line string python-isms in `worker.js` causing Pages build bundling to fail.
- Force UTF-8 encoding configuration on Windows hosts preventing terminal execution crashes.
