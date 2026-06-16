# Implementation Plan — SASO Python Execution Harness

Architecting and integrating a production-grade, state-of-the-art **SASO Python Execution Harness** into the **Supreme AI Swarm Orchestrator (SASO)** ecosystem. This system enables specialized agents to compile, execute, test, and verify Python code (such as FastAPI applications, databases, or script integrations) autonomously via the local bridge daemon.

📍 1342 NM 333, Tijeras, New Mexico 87059 | 🌐 [rickjeffersonsolutions.com](https://rickjeffersonsolutions.com)

---

## User Review Required

> [!IMPORTANT]
> **Local Code Execution Scope**
> - The Python harness runs python commands directly on the host machine using the active python interpreter where the bridge daemon is running.
> - Ensure that any third-party dependencies required by the agent's code are installed in the local environment, or let the agent run standard command execution to install libraries (e.g. `pip install`).

---

## Open Questions

> [!NOTE]
> None. The current design allows the agent to run both inline code and script files directly under the current active workspace directory.

---

## Proposed Changes

We will create the Python execution harness script and modify the local bridge daemon, the orchestrator, and the Cloudflare Edge Worker files to support this new execution capability.

### 1. Python Execution Harness

#### [NEW] [python_harness.py](file:///c:/Users/DELL/Downloads/agent26262621/python_harness.py)
- Build a robust execution module that runs Python code in an isolated subprocess.
- Capture stdout, stderr, execution duration, and returncode.
- Clean up any generated temporary runtime files securely.

---

### 2. Local Bridge Daemon

#### [MODIFY] [saso_bridge.py](file:///c:/Users/DELL/Downloads/agent26262621/saso_bridge.py)
- Register `run_python_code` as an allowed action.
- Import `python_harness` dynamically to handle inline script execution and workspace script file runs.
- Format execution outputs (stdout, stderr, duration, returncode) cleanly back to the Edge coordinator.

---

### 3. Edge Worker & Orchestrator

#### [MODIFY] [saso_orchestrator.py](file:///c:/Users/DELL/Downloads/agent26262621/saso_orchestrator.py)
- Update parser pattern to extract `RUN_PYTHON` action tags.
  - Supports inline:
    ```
    RUN_PYTHON: optional_path.py
    Content:
    [code]
    [END_RUN_PYTHON]
    ```
  - Supports simple script runs:
    ```
    RUN_PYTHON: path.py
    ```
- Add the `run_python_code` execution type logic.
- Inject harness tool definitions into the agent prompt so they know how to run Python tests.

#### [MODIFY] [worker.js](file:///c:/Users/DELL/Downloads/agent26262621/worker.js)
- Add matching parser pattern for `RUN_PYTHON` tags.
- Update agent system prompts on the Edge to describe the new `RUN_PYTHON` tag syntax.

#### [MODIFY] [_worker.js](file:///c:/Users/DELL/Downloads/agent26262621/saso_dashboard/_worker.js)
- Match changes made to the root `worker.js` for Cloudflare Pages deployment parity.

---

## Verification Plan

### Automated Tests
- Run `python python_harness.py --code "print('Hello World')"` to verify stdout capturing.
- Run `python python_harness.py --code "raise Exception('Test Failure')"` to verify error capturing.

### Manual Verification
1. Run local uvicorn server: `python run_saso.py`.
2. Start the local bridge daemon: `python saso_bridge.py`.
3. Submit a task in the dashboard like: `"Execute python script inline to verify math equations"` and check that the agent prints thoughts, uses `RUN_PYTHON`, gets results, and finishes.
