// =============================================================================
// Cloudflare Worker Swarm Coordinator (worker.js)
// Rick Jefferson | RJ Business Solutions
// =============================================================================

// Keep track of active bridge and client connections in memory (per instance)
let activeBridge = null;
let activeClients = new Set();
let agentsCache = [];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Standard CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --- Static Frontend Asset Fallback ---
    // If not matching /api or /ws, serve assets from Pages/Worker KV if configured
    // For standalone workers, we serve index.html directly from a variable for ease of deploy
    
    // --- WebSocket Handlers ---
    if (url.pathname === "/ws/bridge") {
      // Local Bridge tunnel connection from saso_bridge.py
      return handleBridgeWebSocket(request, env);
    }

    if (url.pathname === "/ws/logs") {
      // Client dashboard logs connection
      return handleClientWebSocket(request, env);
    }

    // --- REST API Endpoints ---
    if (url.pathname === "/api/agents") {
      // Return cached agents pushed from local bridge
      const agents = await env.SASO_STORAGE.get("agents_cache");
      return new Response(agents || JSON.stringify([]), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (url.pathname === "/api/keys") {
      // Check environment credentials config
      return new Response(JSON.stringify({
        openrouter: bool(env.OPENROUTER_API_KEY),
        groq: bool(env.GROQ_API_KEY),
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (url.pathname === "/api/files" || url.pathname === "/api/file-content") {
      // Route filesystem commands through local bridge WS
      if (!activeBridge) {
        return new Response(JSON.stringify({ error: "Local execution bridge is offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // Forward request to local bridge and wait for response
      const actionType = url.pathname === "/api/files" ? "list_files" : "read_file";
      const payload = actionType === "read_file" ? await request.json() : {};
      
      const response = await sendActionToBridge({
        type: actionType,
        ...payload
      });

      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Fallback UI serve (for standalone Wrangler deploys or Cloudflare Pages)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response(getHTMLPage(), {
      headers: { "Content-Type": "text/html", ...corsHeaders }
    });
  }
};

// =============================================================================
// WEBSOCKET ROUTING LOGIC
// =============================================================================

function handleBridgeWebSocket(request, env) {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const [client, server] = new WebSocketPair();

  server.accept();
  activeBridge = server;
  console.log("Local execution bridge connected.");

  server.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "register_agents") {
        // Cache agents in KV
        agentsCache = data.agents;
        await env.SASO_STORAGE.put("agents_cache", JSON.stringify(data.agents));
        console.log(`Registered ${data.agents.length} agents from local bridge.`);
      } else if (data.requestId) {
        // Resolve waiting bridge actions
        const resolver = bridgeResolvers.get(data.requestId);
        if (resolver) {
          resolver(data.result);
          bridgeResolvers.delete(data.requestId);
        }
      }
    } catch (err) {
      console.error("Error parsing bridge message:", err);
    }
  });

  server.addEventListener("close", () => {
    console.log("Local execution bridge disconnected.");
    if (activeBridge === server) {
      activeBridge = null;
    }
  });

  return new Response(null, { status: 101, webSocket: client });
}

function handleClientWebSocket(request, env) {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const [client, server] = new WebSocketPair();

  server.accept();
  activeClients.add(server);

  server.addEventListener("message", async (event) => {
    try {
      const config = JSON.parse(event.data);
      const userRequest = config.request;
      const provider = config.provider || "openrouter";
      const model = config.model || "coding";
      const autonomous = config.autonomous || false;

      // Start Swarm Orchestrator Loop on the Edge
      await runEdgeSwarm(server, userRequest, provider, model, autonomous, env);
      
    } catch (err) {
      server.send(JSON.stringify({ message: `Orchestrator error: ${err.message}`, type: "error", agent: "System" }));
    }
  });

  server.addEventListener("close", () => {
    activeClients.delete(server);
  });

  return new Response(null, { status: 101, webSocket: client });
}

// Keep track of pending requests sent to the bridge
const bridgeResolvers = new Map();

function sendActionToBridge(action) {
  return new Promise((resolve) => {
    if (!activeBridge) {
      resolve({ error: "Local bridge offline." });
      return;
    }

    const requestId = Math.random().toString(36).substring(7);
    bridgeResolvers.set(requestId, resolve);

    activeBridge.send(JSON.stringify({
      requestId,
      action
    }));

    // Timeout execution after 120s
    setTimeout(() => {
      if (bridgeResolvers.has(requestId)) {
        bridgeResolvers.delete(requestId);
        resolve({ error: "Action timed out from local bridge." });
      }
    }, 120000);
  });
}

// =============================================================================
// EDGE COGNITIVE SWARM LOOP
// =============================================================================

async function runEdgeSwarm(clientSocket, userRequest, provider, modelKey, autonomous, env) {
  const log = (msg, type = "info", agent = "System") => {
    try {
      clientSocket.send(JSON.stringify({ message: msg, type, agent }));
    } catch {}
  };

  log("Initializing Swarm Edge Coordinator...", "info");

  // Load cached agents
  const agentsJson = await env.SASO_STORAGE.get("agents_cache");
  const agents = agentsJson ? JSON.parse(agentsJson) : [];
  log(`Loaded ${agents.length} agents from Edge registry cache.`, "info");

  if (agents.length === 0) {
    log("Error: Agent registry is empty. Run local bridge daemon first to populate agents.", "error");
    return;
  }

  // 1. Plan Decomposition
  log("Decomposing task into logical steps...", "plan");
  let plannerPrompt = (
    "You are the Supreme AI Orchestrator. Your goal is to analyze the user request and break it down into " +
    "a sequence of logical steps. For each step, assign the most suitable specialized agent from the list below.\n\n" +
    "AVAILABLE AGENTS:\n"
  );
  agents.forEach(agent => {
    plannerPrompt += `- ${agent.name} (key: '${agent.key}'): ${agent.capabilities.join(", ")}\n`;
  });
  plannerPrompt += (
    "\nRespond in a structured plan. For each step, write:\n" +
    "Step X: [Brief description]\n" +
    "Agent: [agent_key]\n" +
    "Goal: [What the agent should achieve in this step]\n"
  );

  const planRes = await callLLMDirect(plannerPrompt, `Decompose this request: ${userRequest}`, provider, modelKey, env);
  log("Formulated multi-agent execution plan:", "plan");
  planRes.split("\n").forEach(line => {
    if (line.trim()) log(line, "plan");
  });

  // Parse steps
  const steps = [];
  const stepBlocks = [...planRes.matchAll(/Step\s+(\d+):\s*(.*?)\nAgent:\s*([^\n]+)\nGoal:\s*([^\n]+)/gim)];
  stepBlocks.forEach(match => {
    steps.push({
      number: match[1],
      description: match[2].trim(),
      agentKey: match[3].trim().toLowerCase().replace(/['"]/g, ""),
      goal: match[4].trim()
    });
  });

  if (steps.length === 0) {
    log("Plan formatting failed to parse. Falling back to sequential execution.", "warning");
    steps.push({
      number: "1",
      description: "Execute complete build task",
      agentKey: "the_supreme_ai_orchestrator_the",
      goal: userRequest
    });
  }

  // 2. Sequential Step Execution
  let contextHistory = [];
  for (const step of steps) {
    const targetAgent = agents.find(a => a.key === step.agentKey) || agents.find(a => a.key.includes("orchestrator"));
    const agentName = targetAgent ? targetAgent.name : "Supreme AI Orchestrator";
    let systemPrompt = targetAgent ? targetAgent.system_prompt : "You are the Supreme AI Orchestrator.";

    systemPrompt += (
      "\n\nCRITICAL: You are running in an interactive workspace and have write-access. " +
      "You can execute actions using the following exact tag patterns:\n\n" +
      "1. To WRITE/CREATE files:\n" +
      "WRITE_FILE: relative/path/to/file.ext\n" +
      "Content:\n" +
      "// Your full code here. DO NOT use placeholders.\n" +
      "[END_WRITE]\n\n" +
      "2. To READ existing files:\n" +
      "READ_FILE: relative/path/to/file.ext\n\n" +
      "3. To LIST directories:\n" +
      "LIST_DIR: relative/path/to/directory\n\n" +
      "4. To make WEB/API requests:\n" +
      "WEB_REQUEST: GET/POST/PUT/DELETE http://api.endpoint/url\n" +
      "Headers:\n" +
      "{\"Content-Type\": \"application/json\"}\n" +
      "Body:\n" +
      "{\"key\": \"value\"}\n" +
      "[END_REQUEST]\n\n" +
      "5. To execute terminal commands or run processes:\n" +
      "RUN_COMMAND: your command string here\n\n" +
      "You can output multiple actions in a single turn. Ensure all code is production ready."
    );

    log(`Starting Step ${step.number}: ${step.description}`, "info");
    log(`Engaging Agent: ${agentName}`, "agent_start", agentName);

    let userPrompt = (
      `GLOBAL TASK: ${userRequest}\n` +
      `CURRENT STEP GOAL: ${step.goal}\n\n` +
      `PREVIOUS STEPS HISTORY:\n` +
      `${contextHistory.slice(-4).join("\n") || "No previous context."}\n\n` +
      `Please formulate thoughts, modify files, or run commands to complete this step goal.`
    );

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      log(`Generating actions (Attempt ${attempt}/${maxAttempts})...`, "info", agentName);
      
      const agentRes = await callLLMDirect(systemPrompt, userPrompt, provider, modelKey, env);
      
      log("Agent thoughts:", "thought", agentName);
      agentRes.split("\n").forEach(line => {
        if (line.trim() && !line.startsWith("WRITE_FILE") && !line.startsWith("RUN_COMMAND") && !line.startsWith("WEB_REQUEST")) {
          log(line, "thought", agentName);
        }
      });

      const actions = parseActions(agentRes);
      if (actions.length === 0) {
        log("No actions triggered. Completing step.", "info", agentName);
        contextHistory.push(`Step ${step.number} Completed: ${agentRes}`);
        break;
      }

      // Execute actions
      let stepSuccess = true;
      const feedback = [];
      for (const action of actions) {
        let resultMsg = "";
        
        if (action.type === "web_request") {
          // Execute HTTP web requests directly from Cloudflare edge (faster)
          log(`Making web request: ${action.method} ${action.url}`, "command", agentName);
          try {
            const res = await fetch(action.url, {
              method: action.method,
              headers: action.headers,
              body: action.method !== "GET" ? action.body : undefined
            });
            const text = await res.text();
            resultMsg = `Success: HTTP ${res.status} from ${action.url}\nContent:\n${text.substring(0, 4000)}`;
            log(`Web request response received: ${res.status}`, "success", agentName);
          } catch (err) {
            resultMsg = `Error making web request: ${err.message}`;
            log(resultMsg, "error", agentName);
          }
        } else {
          // File ops and command executions are sent to the local bridge
          if (!autonomous && action.type === "run_command") {
            resultMsg = `Command skipped (Autonomous mode disabled): ${action.command}`;
            log(resultMsg, "warning", agentName);
          } else {
            log(`Proxying action (${action.type}) to local host...`, "info", agentName);
            const bridgeRes = await sendActionToBridge(action);
            resultMsg = bridgeRes.output || bridgeRes.error || "Success.";
            if (bridgeRes.error) stepSuccess = false;
            log(resultMsg.substring(0, 500) + (resultMsg.length > 500 ? "..." : ""), bridgeRes.error ? "error" : "action_result", agentName);
          }
        }
        feedback.push(resultMsg);
      }

      if (stepSuccess) {
        contextHistory.push(`Step ${step.number} Succeeded.`);
        break;
      } else {
        if (attempt < maxAttempts) {
          log("Action failed. Triggering self-healing...", "warning", agentName);
          userPrompt += `\n\nFEEDBACK FROM PREVIOUS ATTEMPT:\n${feedback.join("\n")}\nFix and rewrite.`;
        } else {
          log("Attempts exhausted. Moving forward.", "error", agentName);
        }
      }
    }
  }

  log("Swarm Task Execution Completed!", "success");
  try { clientSocket.close(); } catch {}
}

// =============================================================================
// LLM CONNECTIVITY CLIENT
// =============================================================================

async function callLLMDirect(systemPrompt, userPrompt, provider, modelKey, env) {
  let url = "https://openrouter.ai/api/v1/chat/completions";
  let apiKey = env.OPENROUTER_API_KEY;
  let model = "anthropic/claude-3.5-sonnet";

  if (provider === "groq") {
    url = "https://api.groq.com/openai/v1/chat/completions";
    apiKey = env.GROQ_API_KEY;
    model = "llama-3.3-70b-specdec";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://rickjeffersonsolutions.com",
      "X-Title": "Supreme AI Swarm Orchestrator"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2
    })
  });

  if (res.status !== 200) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.choices[0].message.content;
}

// =============================================================================
// UTILITIES & HELPER PARSERS
// =============================================================================

function bool(val) {
  return !!val;
}

function parseActions(text) {
  const actions = [];
  
  // WRITE_FILE
  const writeMatches = [...text.matchAll(/WRITE_FILE:\s*([^\n]+)\nContent:\n(.*?)\n\s*\[END_WRITE\]/gims)];
  writeMatches.forEach(m => {
    actions.push({ type: "write_file", path: m[1].trim(), content: m[2] });
  });

  // READ_FILE
  const readMatches = [...text.matchAll(/READ_FILE:\s*([^\n]+)/gim)];
  readMatches.forEach(m => {
    actions.push({ type: "read_file", path: m[1].trim() });
  });

  // LIST_DIR
  const listMatches = [...text.matchAll(/LIST_DIR:\s*([^\n]+)/gim)];
  listMatches.forEach(m => {
    actions.push({ type: "list_dir", path: m[1].trim() });
  });

  // WEB_REQUEST
  const webMatches = [...text.matchAll(/WEB_REQUEST:\s*([A-Z]+)\s+([^\n]+)\n(.*?)\n\s*\[END_REQUEST\]/gims)];
  webMatches.forEach(m => {
    const method = m[1].trim();
    const url = m[2].trim();
    const inner = m[3];
    const cleaned = inner.split("\n").map(l => l.trim()).join("\n");
    
    const headersMatch = cleaned.match(/Headers:\s*\n(.*?)(?:\nBody:|$)/ims);
    const bodyMatch = cleaned.match(/Body:\s*\n(.*)$/ims);
    
    let headers = {};
    if (headersMatch) {
      try { headers = JSON.parse(headersMatch[1].trim()); } catch {}
    }
    const body = bodyMatch ? bodyMatch[1].trim() : "";
    actions.push({ type: "web_request", method, url, headers, body });
  });

  // RUN_COMMAND
  const cmdMatches = [...text.matchAll(/RUN_COMMAND:\s*([^\n]+)/gim)];
  cmdMatches.forEach(m => {
    actions.push({ type: "run_command", command: m[1].trim() });
  });

  return actions;
}

function getHTMLPage() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>SASO Swarm Edge Portal</title>
      <style>
          body { background: #070913; color: #E2E8F0; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 16px; background: rgba(13, 19, 36, 0.6); backdrop-filter: blur(16px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h1 { color: #1455D1; font-size: 24px; margin-bottom: 10px; }
          p { color: #94A3B8; font-size: 14px; }
          .badge { background: #1455D1; color: white; padding: 4px 8px; border-radius: 20px; font-size: 11px; }
      </style>
  </head>
  <body>
      <div class="card">
          <h1>Supreme AI Swarm Orchestrator</h1>
          <p>Cloudflare Edge Routing Service <span class="badge">SASO Edge Active</span></p>
          <p>Rick Jefferson | RJ Business Solutions</p>
      </div>
  </body>
  </html>
  `;
}
