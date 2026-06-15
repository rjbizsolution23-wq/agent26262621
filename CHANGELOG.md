# Changelog

All notable changes to the Supreme AI Swarm Orchestrator (SASO) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
