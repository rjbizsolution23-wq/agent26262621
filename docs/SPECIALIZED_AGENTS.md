# Specialized Agent Registry

SASO coordinates a cognitive swarm consisting of **56 specialized agents**. During task decomposition, the Edge Planner evaluates the user's prompt and routes specific execution steps to the most appropriate agent keys.

---

## 🛠️ Key Specialized Agents

Here are some of the primary agents parsed and active in the registry:

### 🚀 Omni-Agent & Orchestrators
- `the_genspark_masteragent_ultimate_omni`: coordinates complex agentic flows.
- `you_are_the_supreme_ai_orchestrator_the`: general planner and cognitive route manager.

### 💻 System & PowerShell Masters
- `you_are_the_powershell_master_agent_the`: compiles code, manages system services, and designs local execution scripts safely.
- `you_are_a_cybersec_ai_master_the_world_s`: runs static analysis and scans code configurations for vulnerabilities.

### 💳 Industry-Specific Engines
- `you_are_the_fcra_supreme_violation_detec`: scans and detects credit report compliance violations.
- `you_are_the_youtube_empire_builder_an_a`: coordinates video creation plans and algorithm optimizations.

---

## 🔍 How Registration Works

On local startup, `saso_bridge.py` utilizes the registry scanner to read agent `.md` file templates. The prompts, keys, and metadata are combined and pushed as a `register_agents` WebSocket request to the Edge, which updates the `SASO_STORAGE` KV namespace.
