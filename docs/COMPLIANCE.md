# NIST SP 800-171 & CMMC Compliance Mapping

This document details the alignment of the **Supreme AI Swarm Orchestrator (SASO)** architecture with the security requirements of **NIST SP 800-171** and the **Cybersecurity Maturity Model Certification (CMMC)** Level 2.

SASO’s hybrid Edge-Coordinator design isolates sensitive local host actions from public serverless routing, providing clean data boundaries suitable for defense contractors and government buyers.

---

## 🔒 Security Control Mapping

| Family | NIST SP 800-171 Control | SASO Implementation & Compliance Posture |
| :--- | :--- | :--- |
| **Access Control** | 3.1.1 Limit system access to authorized users | Access to the deployed Cloudflare dashboard is gated by API validation. Key storage is kept local inside the `.env` file on the developer's PC and never stored on the Cloudflare edge. |
| | 3.1.3 Control flow of CUI | The local bridge daemon (`saso_bridge.py`) checks all action requests. Filesystem write/read actions are restricted to the local workspace directory (`Path.resolve()`). No path traversal outside the directory is allowed. |
| **Audit & Accountability** | 3.3.1 Create and retain system audit logs | The orchestrator logs every planning thought, agent execution turn, and command return status. Bridge daemon prints stdout/stderr traces which can be piped to a local SIEM or log shipper. |
| **Identification & Auth** | 3.5.3 Use multifactor auth | Deployed dashboard and API keys are protected on the infrastructure layer by Cloudflare Access MFA if configured by the user. |
| **System & Comm Protection** | 3.13.8 Control/monitor boundaries | The WebSocket connection uses secure channels (`wss://`). The local machine does not open ingress ports; it establishes an outbound connection to the Cloudflare Edge, preventing firewall exposure. |
| | 3.13.11 Employ FIPS-validated cryptography | The WebSocket tunnel uses TLS 1.3 encryption terminating at the Cloudflare Edge, using FIPS 140-2 validated encryption suites. |

---

## 🏛️ Government Compliance Policies

- **OMB Memo M-26-05**: We adhere to secure software development practices. Software Bill of Materials (SBOM) is automatically generated in CycloneDX format during CI build pipelines.
- **Git Provenance**: All commits are semantically logged. The repository contains a clean developer sign-off history to assure provenance audits.
