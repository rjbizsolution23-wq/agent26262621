# System Architecture

SASO leverages a **hybrid Edge-Local coordinator model** to balance performance, cost, and host security.

```
+-------------------------------------------------------------+
|                     Cloudflare Edge Worker                  |
|  - Gated REST APIs (/api/agents, /api/keys)                 |
|  - Cognitive LLM Orchestration Loop (FastAPI Equivalent)     |
|  - Client WebSocket Logs server (/ws/logs)                  |
+-------------------------------------------------------------+
                               |
                               | (wss:// secure websocket tunnel)
                               v
+-------------------------------------------------------------+
|                      Local PC Daemon                        |
|  - Bridge Connection Listener (/ws/bridge)                  |
|  - Secure Action Gate (Restricts traversal to workspace)    |
|  - Shell Command Executor (Safe PowerShell launcher)         |
+-------------------------------------------------------------+
```

---

## 🛰️ Edge Processing
The cognitive loops, planning decomposition, and LLM orchestration prompts are executed entirely at the **Cloudflare Edge** in `worker.js`. 
- **OIDC/KV**: Handled via global Cloudflare KV bindings.
- **Latency**: Negligible startup delays, bypassing local uvicorn thread concurrency bottlenecks.

## 💻 Local Execution
Filesystem actions and command-line execution tasks are delegated back to the developer host machine through the reverse WebSocket connection managed by `saso_bridge.py`.
- **Port Security**: The bridge acts as a client making an outbound WebSocket request. No ingress ports need to be opened in your router or firewall.
- **Safety Gate**: Local path targets are strictly validated using `Path.resolve()` to prevent path-traversal attacks.
