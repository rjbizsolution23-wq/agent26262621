# Contributing to SASO

Thank you for your interest in contributing to the Supreme AI Swarm Orchestrator (SASO)! We welcome code contributions, documentation improvements, issue reports, and feedback.

As an enterprise-grade and government-contract ready project maintained by **RJ Business Solutions**, all contributions must adhere to our rigorous quality, security, and intellectual property requirements.

---

## 🔐 Intellectual Property & CLA Requirement

Before we can merge any of your code contributions, you must sign the Individual Contributor License Agreement (CLA) to ensure a clear chain of title and protect the intellectual property of the project.

- The CLA signing process is automated via our GitHub pull request workflows.
- For more details, see [CLA.md](CLA.md).

---

## 🛠️ Contribution Workflow

1.  **Fork the Repository**: Create a fork of the repository under your own account.
2.  **Create a Feature Branch**: Keep branch names semantic and prefix them appropriately (e.g. `feat/`, `fix/`, `docs/`, `refactor/`).
3.  **Implement Changes**: Follow project linting and structural conventions.
4.  **Self-Verify**: Verify changes locally:
    - No implicit type castings or TS errors in JS/Worker code.
    - Standard exception handling on async routines.
    - No hardcoded API keys, tokens, or credentials.
5.  **Commit Conventions**: We enforce semantic commit messages (e.g. `feat: add OpenSSF security workflow`, `fix: handle websocket disconnect state`).
6.  **Create a Pull Request**: Submit your pull request to the `main` branch.

---

## 📞 Support & Communication

For questions, support requests, or security vulnerability reports, please refer to:
- [SUPPORT.md](SUPPORT.md)
- [SECURITY.md](SECURITY.md)
