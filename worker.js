// =============================================================================
// Supreme AI Swarm Orchestrator (SASO) — Cloudflare Worker v2.0
// Rick Jefferson | RJ Business Solutions
// 📍 1342 NM 333, Tijeras, New Mexico 87059
// 🌐 https://rickjeffersonsolutions.com
// =============================================================================

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// =============================================================================
// DURABLE OBJECT — Persistent WebSocket session manager
// Holds bridge + client WebSocket connections across requests.
// One "main-room" DO instance per deployment.
// =============================================================================
export class SASORoomDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.bridgeSocket = null;
    this.clientSockets = new Set();
    this.bridgeResolvers = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.endsWith('/ws/bridge'))  return this._handleBridge(request);
    if (path.endsWith('/ws/logs'))    return this._handleClient(request);
    if (path.endsWith('/do-action') && request.method === 'POST') return this._handleAction(request);

    // Status probe
    return new Response(JSON.stringify({
      status:  'DO active',
      bridge:  !!this.bridgeSocket,
      clients: this.clientSockets.size,
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // ---------- WebSocket: Local Bridge Tunnel ----------
  _handleBridge(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.bridgeSocket = server;

    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'register_agents') {
          // Cache agent manifests in KV so the edge swarm can use them
          await this.env.SASO_STORAGE.put('agents_cache', JSON.stringify(data.agents));
          console.log(`[SASO Bridge] Registered ${data.agents.length} agents.`);
          this._broadcastToClients({
            message: `Bridge connected — ${data.agents.length} specialized agents registered in Edge KV.`,
            type: 'info',
            agent: 'System',
          });
        } else if (data.requestId) {
          // Resolve a pending bridge action promise
          const resolver = this.bridgeResolvers.get(data.requestId);
          if (resolver) {
            this.bridgeResolvers.delete(data.requestId);
            resolver(data.result || {});
          }
        }
      } catch (err) {
        console.error('[SASO Bridge] Message error:', err.message);
      }
    });

    server.addEventListener('close', () => {
      if (this.bridgeSocket === server) this.bridgeSocket = null;
      this._broadcastToClients({
        message: 'Local execution bridge disconnected. File/command actions unavailable.',
        type: 'warning',
        agent: 'System',
      });
    });

    server.addEventListener('error', (err) => {
      console.error('[SASO Bridge] WebSocket error:', err);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  // ---------- WebSocket: Dashboard Client ----------
  _handleClient(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.clientSockets.add(server);

    server.addEventListener('message', async (event) => {
      try {
        const config = JSON.parse(event.data);
        if (!config.request || !config.request.trim()) {
          server.send(JSON.stringify({ message: 'Error: Empty task request.', type: 'error', agent: 'System' }));
          return;
        }
        await runEdgeSwarm(
          server,
          config.request,
          config.provider   || 'openrouter',
          config.model      || 'coding',
          config.autonomous || false,
          this.env,
          this,
        );
      } catch (err) {
        try {
          server.send(JSON.stringify({ message: `Fatal error: ${err.message}`, type: 'error', agent: 'System' }));
        } catch {}
      }
    });

    server.addEventListener('close', () => {
      this.clientSockets.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  // ---------- Internal: Proxy file/command actions to local bridge ----------
  async _handleAction(request) {
    try {
      const action = await request.json();
      const result = await this.sendActionToBridge(action);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ---------- Broadcast to all connected dashboard clients ----------
  _broadcastToClients(msg) {
    const payload = JSON.stringify(msg);
    for (const ws of this.clientSockets) {
      try { ws.send(payload); } catch {}
    }
  }

  // ---------- Send action to local bridge, await response with timeout ----------
  sendActionToBridge(action) {
    return new Promise((resolve) => {
      if (!this.bridgeSocket) {
        resolve({ error: 'Local execution bridge is offline. Run saso_bridge.py on your local machine first.' });
        return;
      }

      const requestId = crypto.randomUUID();
      this.bridgeResolvers.set(requestId, resolve);

      try {
        this.bridgeSocket.send(JSON.stringify({ requestId, action }));
      } catch (err) {
        this.bridgeResolvers.delete(requestId);
        resolve({ error: `Failed to send to bridge: ${err.message}` });
        return;
      }

      // 120s hard timeout per action
      setTimeout(() => {
        if (this.bridgeResolvers.has(requestId)) {
          this.bridgeResolvers.delete(requestId);
          resolve({ error: 'Bridge action timed out after 120s.' });
        }
      }, 120_000);
    });
  }
}

// =============================================================================
// MAIN WORKER — Routes all requests
// =============================================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // ---- WebSocket routes → Durable Object ----
    if (url.pathname === '/ws/bridge' || url.pathname === '/ws/logs') {
      const room = getRoom(env);
      return room.fetch(request);
    }

    // ---- REST: GET /api/agents ----
    if (url.pathname === '/api/agents' && request.method === 'GET') {
      const cached = await env.SASO_STORAGE.get('agents_cache');
      return jsonResp(cached ? JSON.parse(cached) : []);
    }

    // ---- REST: GET /api/keys ----
    if (url.pathname === '/api/keys' && request.method === 'GET') {
      const [orKV, groqKV, dsKV, toKV] = await Promise.all([
        env.SASO_STORAGE.get('key:openrouter'),
        env.SASO_STORAGE.get('key:groq'),
        env.SASO_STORAGE.get('key:deepseek'),
        env.SASO_STORAGE.get('key:together'),
      ]);
      return jsonResp({
        openrouter: !!(env.OPENROUTER_API_KEY  || orKV),
        groq:       !!(env.GROQ_API_KEY        || groqKV),
        deepseek:   !!(env.DEEPSEEK_API_KEY    || dsKV),
        together:   !!(env.TOGETHER_API_KEY    || toKV),
      });
    }

    // ---- REST: POST /api/save-keys ----
    if (url.pathname === '/api/save-keys' && request.method === 'POST') {
      try {
        const body = await request.json();
        const ops = [];
        if (body.openrouter_key) ops.push(env.SASO_STORAGE.put('key:openrouter', body.openrouter_key));
        if (body.groq_key)       ops.push(env.SASO_STORAGE.put('key:groq',       body.groq_key));
        if (body.deepseek_key)   ops.push(env.SASO_STORAGE.put('key:deepseek',   body.deepseek_key));
        if (body.together_key)   ops.push(env.SASO_STORAGE.put('key:together',   body.together_key));
        if (ops.length === 0) {
          return jsonResp({ success: false, message: 'No keys provided.' }, 400);
        }
        await Promise.all(ops);
        return jsonResp({ success: true, message: `Saved ${ops.length} API key(s) to Cloudflare Edge KV.` });
      } catch (err) {
        return jsonResp({ success: false, message: err.message }, 500);
      }
    }

    // ---- REST: GET /api/files → proxy via DO → local bridge ----
    if (url.pathname === '/api/files' && request.method === 'GET') {
      const room = getRoom(env);
      const res = await room.fetch(doActionRequest({ type: 'list_files' }));
      const data = await res.json();
      return jsonResp(Array.isArray(data.result) ? data.result : (data.error ? [] : []));
    }

    // ---- REST: POST /api/file-content → proxy via DO → local bridge ----
    if (url.pathname === '/api/file-content' && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.filepath) return jsonResp({ error: 'Missing filepath parameter.' }, 400);
        const room = getRoom(env);
        const res  = await room.fetch(doActionRequest({ type: 'read_file', path: body.filepath }));
        const data = await res.json();
        if (data.error) return jsonResp({ error: data.error }, 503);
        return jsonResp({ path: body.filepath, content: data.result?.output || '' });
      } catch (err) {
        return jsonResp({ error: err.message }, 500);
      }
    }

    // ---- REST: GET /api/status ----
    if (url.pathname === '/api/status' && request.method === 'GET') {
      const room = getRoom(env);
      const res  = await room.fetch(new Request('http://do/status'));
      const data = await res.json();
      return jsonResp({
        ...data,
        edge:    true,
        worker:  'saso-worker',
        version: '2.0.0',
        company: 'RJ Business Solutions',
        owner:   'Rick Jefferson',
        website: 'https://rickjeffersonsolutions.com',
      });
    }

    // ---- Static Assets (dashboard HTML/CSS/JS) ----
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // ---- Fallback (no ASSETS binding) ----
    return new Response(getHTMLFallback(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS },
    });
  },
};

// =============================================================================
// UTILITIES
// =============================================================================
function getRoom(env) {
  const id = env.SASO_ROOM.idFromName('main-room');
  return env.SASO_ROOM.get(id);
}

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

/** Creates a synthetic internal request to the DO's /do-action handler */
function doActionRequest(action) {
  return new Request('http://do/do-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
}

// =============================================================================
// EDGE SWARM ORCHESTRATOR
// Full multi-agent decompose → plan → execute → self-heal loop, running on edge.
// =============================================================================
async function runEdgeSwarm(clientSocket, userRequest, provider, modelKey, autonomous, env, room) {
  const log = (msg, type = 'info', agent = 'System') => {
    try { clientSocket.send(JSON.stringify({ message: msg, type, agent })); } catch {}
  };

  log('Initializing SASO Edge Swarm Orchestrator v2.0...', 'info');
  log('Built by RJ Business Solutions | Architected by Rick Jefferson', 'info');

  // Load agent manifests from KV (populated by saso_bridge.py on local machine)
  const agentsJson = await env.SASO_STORAGE.get('agents_cache');
  const agents = agentsJson ? JSON.parse(agentsJson) : [];
  log(`Loaded ${agents.length} specialized agents from Edge KV registry.`, 'info');

  if (agents.length === 0) {
    log('Warning: Agent registry is empty. Run saso_bridge.py locally to populate agents.', 'warning');
    log('Proceeding with Orchestrator-only mode...', 'info');
  }

  // --- 1. Task Decomposition ---
  log('Decomposing task into logical steps...', 'plan');

  let plannerPrompt = (
    'You are the Supreme AI Orchestrator, built by Rick Jefferson at RJ Business Solutions. ' +
    'Analyze the user request and break it into a sequence of logical steps. ' +
    'For each step, assign the most suitable specialized agent.\n\n' +
    'AVAILABLE AGENTS:\n'
  );
  for (const agent of agents) {
    plannerPrompt += `- ${agent.name} (key: '${agent.key}'): ${(agent.capabilities || []).join(', ')}\n`;
  }
  plannerPrompt += (
    '\nRespond in this EXACT format for each step:\n' +
    'Step X: [Brief description]\n' +
    'Agent: [agent_key]\n' +
    'Goal: [What the agent must achieve]\n'
  );

  let planRes = '';
  try {
    planRes = await callLLMDirect(plannerPrompt, `Decompose this request: ${userRequest}`, provider, modelKey, env);
  } catch (err) {
    log(`Planning LLM call failed: ${err.message}. Falling back.`, 'warning');
    planRes = `Step 1: Execute the full task\nAgent: orchestrator\nGoal: ${userRequest}`;
  }

  log('Execution plan:', 'plan');
  for (const line of planRes.split('\n')) {
    if (line.trim()) log(line, 'plan');
  }

  // Parse steps from planner response
  const steps = [];
  const matches = [...planRes.matchAll(/Step\s+(\d+):\s*(.*?)\nAgent:\s*([^\n]+)\nGoal:\s*([^\n]+)/gim)];
  for (const m of matches) {
    steps.push({
      number:      m[1],
      description: m[2].trim(),
      agentKey:    m[3].trim().toLowerCase().replace(/['"]/g, ''),
      goal:        m[4].trim(),
    });
  }

  if (steps.length === 0) {
    log('Plan parsing failed. Falling back to single-agent execution.', 'warning');
    steps.push({ number: '1', description: 'Execute full task', agentKey: 'orchestrator', goal: userRequest });
  }

  // --- 2. Sequential Step Execution ---
  const contextHistory = [];

  for (const step of steps) {
    const targetAgent = agents.find(a => a.key === step.agentKey)
      || agents.find(a => a.key.includes('orchestrator'))
      || null;

    const agentName = targetAgent?.name ?? 'Supreme AI Orchestrator';
    let systemPrompt = targetAgent?.system_prompt
      ?? 'You are the Supreme AI Orchestrator built by RJ Business Solutions. Execute tasks with precision and deliver complete, production-ready results.';

    // Inject action syntax guide into every agent's system prompt
    systemPrompt += (
      '\n\nCRITICAL: You are running in an interactive workspace with write-access. ' +
      'Use these exact tag patterns to take actions:\n\n' +
      '1. WRITE/CREATE files:\n' +
      'WRITE_FILE: relative/path/to/file.ext\n' +
      'Content:\n' +
      '// Complete code here — NO placeholders\n' +
      '[END_WRITE]\n\n' +
      '2. READ existing files:\n' +
      'READ_FILE: relative/path/to/file.ext\n\n' +
      '3. LIST directory:\n' +
      'LIST_DIR: relative/path/to/dir\n\n' +
      '4. HTTP/API request:\n' +
      'WEB_REQUEST: GET https://api.example.com/endpoint\n' +
      'Headers:\n{"Authorization": "Bearer token"}\n' +
      'Body:\n{"key": "value"}\n' +
      '[END_REQUEST]\n\n' +
      '5. Run terminal command:\n' +
      'RUN_COMMAND: npm install\n\n' +
      'Output multiple actions per turn. All code must be complete and production-ready.'
    );

    log(`--- Step ${step.number}: ${step.description}`, 'info');
    log(`Engaging: ${agentName}`, 'agent_start', agentName);

    let userPrompt = (
      `GLOBAL TASK: ${userRequest}\n` +
      `STEP ${step.number} GOAL: ${step.goal}\n\n` +
      `CONTEXT FROM PREVIOUS STEPS:\n` +
      `${contextHistory.slice(-4).join('\n') || 'No previous steps.'}\n\n` +
      `Execute this step goal completely. Write all necessary files or take required actions.`
    );

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      log(`Generating (Attempt ${attempt}/${maxAttempts})...`, 'info', agentName);

      let agentRes = '';
      try {
        agentRes = await callLLMDirect(systemPrompt, userPrompt, provider, modelKey, env);
      } catch (err) {
        log(`LLM call failed: ${err.message}`, 'error', agentName);
        break;
      }

      // Stream agent thoughts (filter out raw action tags)
      log('Agent reasoning:', 'thought', agentName);
      for (const line of agentRes.split('\n')) {
        if (line.trim()
          && !line.startsWith('WRITE_FILE')
          && !line.startsWith('RUN_COMMAND')
          && !line.startsWith('WEB_REQUEST')
          && !line.startsWith('[END_')
          && !line.startsWith('Content:')) {
          log(line, 'thought', agentName);
        }
      }

      const actions = parseActions(agentRes);
      if (actions.length === 0) {
        log('No structured actions in response. Step complete.', 'info', agentName);
        contextHistory.push(`Step ${step.number} done: ${agentRes.substring(0, 300)}`);
        break;
      }

      let stepSuccess = true;
      const feedback = [];

      for (const action of actions) {
        let resultMsg = '';

        if (action.type === 'web_request') {
          // Web requests run natively on Cloudflare edge — no bridge needed
          log(`Web request: ${action.method} ${action.url}`, 'command', agentName);
          try {
            const fetchOptions = { method: action.method, headers: action.headers || {} };
            if (action.method !== 'GET' && action.body) fetchOptions.body = action.body;
            const res  = await fetch(action.url, fetchOptions);
            const text = await res.text();
            resultMsg  = `HTTP ${res.status} from ${action.url}\n${text.substring(0, 3000)}`;
            log(`Response: ${res.status}`, res.ok ? 'success' : 'error', agentName);
            if (!res.ok) stepSuccess = false;
          } catch (err) {
            resultMsg = `Web request error: ${err.message}`;
            log(resultMsg, 'error', agentName);
            stepSuccess = false;
          }

        } else if (action.type === 'run_command' && !autonomous) {
          resultMsg = `Skipped (autonomous mode disabled): ${action.command}`;
          log(resultMsg, 'warning', agentName);

        } else {
          // File ops, commands, python → route through DO → local bridge
          log(`Routing ${action.type} to local bridge...`, 'info', agentName);
          try {
            const bridgeRes = await room.sendActionToBridge(action);
            if (bridgeRes.error) {
              resultMsg  = `Bridge error: ${bridgeRes.error}`;
              stepSuccess = false;
            } else {
              resultMsg = bridgeRes.result?.output || bridgeRes.output || 'Action completed.';
            }
            log(
              resultMsg.length > 500 ? resultMsg.substring(0, 500) + '…' : resultMsg,
              stepSuccess ? 'action_result' : 'error',
              agentName,
            );
          } catch (err) {
            resultMsg  = `Bridge routing error: ${err.message}`;
            stepSuccess = false;
            log(resultMsg, 'error', agentName);
          }
        }
        feedback.push(resultMsg);
      }

      if (stepSuccess) {
        contextHistory.push(`Step ${step.number} succeeded. Actions: ${actions.map(a => a.type).join(', ')}`);
        break;
      } else if (attempt < maxAttempts) {
        log('Errors detected — triggering self-healing loop...', 'warning', agentName);
        userPrompt += `\n\nFEEDBACK FROM PREVIOUS ATTEMPT:\n${feedback.join('\n')}\n\nFix ALL errors. Rewrite complete, working files.`;
      } else {
        log(`Self-healing exhausted after ${maxAttempts} attempts.`, 'error', agentName);
        contextHistory.push(`Step ${step.number} failed after ${maxAttempts} attempts.`);
      }
    }
  }

  log('✅ Swarm task execution complete!', 'success');
  log('RJ Business Solutions | rickjeffersonsolutions.com | Rick Jefferson', 'success');
  try {
    clientSocket.send(JSON.stringify({ message: 'Swarm Orchestrator finished execution.', type: 'finished', agent: 'System' }));
  } catch {}
}

// =============================================================================
// LLM CLIENT — OpenRouter, Groq, DeepSeek, Together AI
// Reads API keys from Worker secrets first, falls back to KV-stored user keys.
// =============================================================================
async function callLLMDirect(systemPrompt, userPrompt, provider, modelKey, env) {
  // Resolve keys: Worker secrets take priority, then user-saved KV values
  const resolveKey = async (envKey, kvKey) => env[envKey] || await env.SASO_STORAGE.get(kvKey);

  let url, apiKey, model, extraHeaders = {};

  if (provider === 'groq') {
    url    = 'https://api.groq.com/openai/v1/chat/completions';
    apiKey = await resolveKey('GROQ_API_KEY', 'key:groq');
    model  = modelKey === 'reasoning' ? 'deepseek-r1-distill-llama-70b' : 'llama-3.3-70b-specdec';

  } else if (provider === 'deepseek') {
    url    = 'https://api.deepseek.com/v1/chat/completions';
    apiKey = await resolveKey('DEEPSEEK_API_KEY', 'key:deepseek');
    model  = 'deepseek-chat';

  } else if (provider === 'together') {
    url    = 'https://api.together.xyz/v1/chat/completions';
    apiKey = await resolveKey('TOGETHER_API_KEY', 'key:together');
    model  = 'meta-llama/Llama-3-70b-chat-hf';

  } else {
    // OpenRouter (default)
    url    = 'https://openrouter.ai/api/v1/chat/completions';
    apiKey = await resolveKey('OPENROUTER_API_KEY', 'key:openrouter');
    extraHeaders = {
      'HTTP-Referer': 'https://rickjeffersonsolutions.com',
      'X-Title':      'Supreme AI Swarm Orchestrator — RJ Business Solutions',
    };
    const modelMap = {
      'fast':             'google/gemini-2.5-flash',
      'reasoning':        'deepseek/deepseek-r1',
      'coding':           'anthropic/claude-3.5-sonnet',
      'llama-3-free':     'meta-llama/llama-3-8b-instruct:free',
      'gemma-2-free':     'google/gemma-2-9b-it:free',
      'qwen-2.5-free':    'qwen/qwen-2.5-72b-instruct:free',
      'mistral-free':     'mistralai/mistral-7b-instruct:free',
      'nvidia-nemotron':  'nvidia/llama-3.1-nemotron-70b-instruct',
    };
    model = modelMap[modelKey] ?? 'anthropic/claude-3.5-sonnet';
  }

  if (!apiKey) {
    throw new Error(
      `No API key for provider "${provider}". ` +
      'Set it via Dashboard → API Configurations, or run: wrangler secret put OPENROUTER_API_KEY'
    );
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens:  8192,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${provider} HTTP ${res.status}: ${text.substring(0, 400)}`);
  }

  const json = await res.json();
  if (!json.choices?.[0]?.message?.content) {
    throw new Error(`Unexpected response shape from ${provider}: ${JSON.stringify(json).substring(0, 300)}`);
  }
  return json.choices[0].message.content;
}

// =============================================================================
// ACTION PARSER — Extracts structured tool-call tags from LLM output
// =============================================================================
function parseActions(text) {
  const actions = [];

  // WRITE_FILE
  for (const m of text.matchAll(/WRITE_FILE:\s*([^\n]+)\nContent:\n(.*?)\n\s*\[END_WRITE\]/gims)) {
    actions.push({ type: 'write_file', path: m[1].trim(), content: m[2] });
  }

  // READ_FILE
  for (const m of text.matchAll(/READ_FILE:\s*([^\n]+)/gim)) {
    actions.push({ type: 'read_file', path: m[1].trim() });
  }

  // LIST_DIR
  for (const m of text.matchAll(/LIST_DIR:\s*([^\n]+)/gim)) {
    actions.push({ type: 'list_dir', path: m[1].trim() });
  }

  // WEB_REQUEST
  for (const m of text.matchAll(/WEB_REQUEST:\s*([A-Z]+)\s+([^\n]+)\n(.*?)\n\s*\[END_REQUEST\]/gims)) {
    const inner   = m[3].split('\n').map(l => l.trim()).join('\n');
    const hMatch  = inner.match(/Headers:\s*\n(.*?)(?:\nBody:|$)/ims);
    const bMatch  = inner.match(/Body:\s*\n(.*)$/ims);
    let   headers = {};
    if (hMatch) { try { headers = JSON.parse(hMatch[1].trim()); } catch {} }
    const body = bMatch ? bMatch[1].trim() : '';
    actions.push({ type: 'web_request', method: m[1].trim(), url: m[2].trim(), headers, body });
  }

  // RUN_COMMAND
  for (const m of text.matchAll(/RUN_COMMAND:\s*([^\n]+)/gim)) {
    actions.push({ type: 'run_command', command: m[1].trim() });
  }

  // RUN_PYTHON inline
  const pyInlineRanges = [];
  for (const m of text.matchAll(/RUN_PYTHON:\s*([^\n]*)\nContent:\n(.*?)\n\s*\[END_RUN_PYTHON\]/gims)) {
    actions.push({ type: 'run_python_code', path: m[1].trim() || null, content: m[2] });
    pyInlineRanges.push([m.index, m.index + m[0].length]);
  }

  // RUN_PYTHON simple file reference (avoid duplicating inline matches)
  for (const m of text.matchAll(/RUN_PYTHON:\s*([^\n]+)/gim)) {
    const isInline = pyInlineRanges.some(([s, e]) => m.index >= s && m.index <= e);
    if (!isInline) {
      actions.push({ type: 'run_python_code', path: m[1].trim(), content: null });
    }
  }

  return actions;
}

// =============================================================================
// FALLBACK HTML — Shown when Workers Assets binding is unavailable
// =============================================================================
function getHTMLFallback() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SASO — Supreme AI Swarm Orchestrator</title>
  <meta name="description" content="Supreme AI Swarm Orchestrator — Built by RJ Business Solutions">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: radial-gradient(ellipse at 50% 0%, #0d1936 0%, #070913 70%);
      color: #E2E8F0;
      font-family: 'Inter', system-ui, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
    }
    .card {
      text-align: center;
      border: 1px solid rgba(255,255,255,0.08);
      padding: 56px 48px;
      border-radius: 28px;
      background: rgba(13,19,36,0.85);
      backdrop-filter: blur(24px);
      box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(20,85,209,0.15);
      max-width: 520px;
      width: 90%;
    }
    .logo { width: 96px; height: 96px; border-radius: 20px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(20,85,209,0.4); }
    h1 { font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 10px; }
    h1 span { color: #1455D1; }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #1455D1, #6C63FF);
      color: #fff; padding: 4px 12px; border-radius: 999px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
      margin-left: 8px; vertical-align: middle;
    }
    .status-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px 0; }
    .dot { width: 9px; height: 9px; background: #22C55E; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5);} 50%{box-shadow:0 0 0 6px rgba(34,197,94,0);} }
    p { color: #94A3B8; font-size: 14px; line-height: 1.6; }
    .sub { font-size: 11px; color: #475569; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <img src="https://storage.googleapis.com/msgsndr/qQnxRHDtyx0uydPd5sRl/media/67eb83c5e519ed689430646b.jpeg"
         class="logo" alt="RJ Business Solutions Logo">
    <h1><span>Supreme AI</span> Swarm Orchestrator<span class="badge">SASO v2.0</span></h1>
    <div class="status-row">
      <div class="dot"></div>
      <span style="color:#22C55E;font-size:13px;font-weight:600;">Cloudflare Edge Active</span>
    </div>
    <p>Built by <strong style="color:#fff;">RJ Business Solutions</strong><br>
       Architected by <strong style="color:#fff;">Rick Jefferson</strong></p>
    <p class="sub">📍 1342 NM 333, Tijeras, New Mexico 87059 &nbsp;|&nbsp; rickjeffersonsolutions.com</p>
  </div>
</body>
</html>`;
}
