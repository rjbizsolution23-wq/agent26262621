# Privacy Policy

**Effective Date**: June 14, 2026

This Privacy Policy describes how **RJ Business Solutions** handles data processed by the **Supreme AI Swarm Orchestrator (SASO)**.

---

## 1. Data Processing Boundaries

SASO utilizes a hybrid serverless edge and local bridge architecture. 

*   **Local Processing**: All filesystem writes, reads, and shell command executions happen on the host machine running the bridge daemon (`saso_bridge.py`). None of this data is collected, monitored, or stored by RJ Business Solutions.
*   **Edge Routing**: Task instructions, planning thoughts, and API completions are routed through Cloudflare Workers to the configured LLM API provider (e.g. OpenRouter, Groq).
*   **Key Storage**: API keys (OpenRouter, Groq) are loaded dynamically from your local `.env` file or environment variables on the Edge Worker. They are never logged or persisted in any central database.

---

## 2. Contact Us

For privacy inquiries or audit reports, contact us at:
- **Email**: [support@rjbusinesssolutions.org](mailto:support@rjbusinesssolutions.org)
- **Address**: 1342 NM 333, Tijeras, New Mexico 87059
