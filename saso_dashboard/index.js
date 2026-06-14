// =============================================================================
// GLOBAL STATE
// =============================================================================
let agents = [];
let workspaceFiles = [];
let activeAgentKey = null;
let socket = null;

// Canvas visualizer parameters
let nodes = [];
let links = [];
let particles = [];
let animationFrameId = null;

// DOM Elements
const agentsContainer = document.getElementById("agents-container");
const logsContainer = document.getElementById("logs-container");
const filesContainer = document.getElementById("files-container");
const taskInput = document.getElementById("task-input");
const providerSelect = document.getElementById("provider-select");
const modelSelect = document.getElementById("model-select");
const autonomousToggle = document.getElementById("autonomous-toggle");
const runTaskBtn = document.getElementById("run-task-btn");
const clearLogsBtn = document.getElementById("clear-logs");
const refreshFilesBtn = document.getElementById("refresh-files");
const saveKeysBtn = document.getElementById("save-keys-btn");
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");

// Collapsable API Keys Panel
const apiKeysHeader = document.querySelector(".keys-panel .panel-header");
const apiKeysBody = document.getElementById("api-keys-body");

// Modal Elements
const fileModal = document.getElementById("file-modal");
const modalFilename = document.getElementById("modal-filename");
const modalCode = document.getElementById("modal-code");
const modalCloseBtn = document.getElementById("modal-close-btn");

// =============================================================================
// INITIALIZATION & EVENT LISTENERS
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
    fetchAgents();
    fetchKeys();
    fetchFiles();
    setupTabs();
    setupCanvas();

    // Event listeners
    runTaskBtn.addEventListener("click", startSwarmTask);
    clearLogsBtn.addEventListener("click", () => {
        logsContainer.innerHTML = '<div class="log-line system">Logs cleared. Ready.</div>';
    });
    refreshFilesBtn.addEventListener("click", fetchFiles);
    saveKeysBtn.addEventListener("click", saveApiKeys);
    
    // Search filter
    document.getElementById("agent-search").addEventListener("input", filterAgents);

    // Collapsible header
    apiKeysHeader.addEventListener("click", () => {
        apiKeysHeader.classList.toggle("active");
        apiKeysBody.classList.toggle("collapsed");
    });

    // Modal close
    modalCloseBtn.addEventListener("click", () => fileModal.classList.remove("active"));
    window.addEventListener("click", (e) => {
        if (e.target === fileModal) fileModal.classList.remove("active");
    });
});

// =============================================================================
// API INTEGRATIONS
// =============================================================================
async function fetchAgents() {
    try {
        const res = await fetch("/api/agents");
        agents = await res.json();
        renderAgents(agents);
        document.getElementById("agent-count").textContent = `${agents.length} Agents`;
        buildNodeGraph();
    } catch (err) {
        agentsContainer.innerHTML = `<div class="error-msg">Failed to load agents: ${err}</div>`;
    }
}

async function fetchKeys() {
    try {
        const res = await fetch("/api/keys");
        const data = await res.json();
        
        // Show indicator if keys are saved
        if (data.openrouter) {
            document.getElementById("key-openrouter").placeholder = "Key Configured (Saved)";
        }
        if (data.groq) {
            document.getElementById("key-groq").placeholder = "Key Configured (Saved)";
        }
    } catch (err) {
        console.error("Error loading keys status:", err);
    }
}

async function saveApiKeys() {
    const openrouterKey = document.getElementById("key-openrouter").value;
    const groqKey = document.getElementById("key-groq").value;
    
    const payload = {};
    if (openrouterKey) payload.openrouter_key = openrouterKey;
    if (groqKey) payload.groq_key = groqKey;

    try {
        const res = await fetch("/api/save-keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            alert("API keys saved and loaded.");
            fetchKeys();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        alert(`Failed to save keys: ${err}`);
    }
}

async function fetchFiles() {
    try {
        const res = await fetch("/api/files");
        workspaceFiles = await res.json();
        renderFiles(workspaceFiles);
    } catch (err) {
        filesContainer.innerHTML = `<div class="error-msg">Error listing files: ${err}</div>`;
    }
}

async function viewFile(path) {
    try {
        const res = await fetch("/api/file-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filepath: path })
        });
        const data = await res.json();
        modalFilename.textContent = data.path;
        modalCode.textContent = data.content;
        fileModal.classList.add("active");
    } catch (err) {
        alert(`Error loading file: ${err}`);
    }
}

// =============================================================================
// DOM RENDERING
// =============================================================================
function renderAgents(agentList) {
    if (agentList.length === 0) {
        agentsContainer.innerHTML = '<div class="empty-state">No matching agents found.</div>';
        return;
    }
    
    agentsContainer.innerHTML = agentList.map(agent => `
        <div class="agent-item" data-key="${agent.key}" onclick="highlightNode('${agent.key}')">
            <div class="agent-item-header">
                <span class="agent-name">${agent.name.encodeHtml()}</span>
            </div>
            <div class="agent-caps">${agent.capabilities.join(", ").encodeHtml()}</div>
        </div>
    `).join("");
}

function filterAgents(e) {
    const query = e.target.value.toLowerCase();
    const filtered = agents.filter(agent => 
        agent.name.toLowerCase().includes(query) || 
        agent.capabilities.some(c => c.toLowerCase().includes(query))
    );
    renderAgents(filtered);
}

function renderFiles(fileList) {
    if (fileList.length === 0) {
        filesContainer.innerHTML = '<div class="empty-state">No files generated yet.</div>';
        return;
    }

    filesContainer.innerHTML = fileList.map(file => `
        <div class="file-item" onclick="viewFile('${file.path}')">
            <div class="file-info">
                <span class="file-path">${file.path}</span>
                <span class="file-size">${formatBytes(file.size)}</span>
            </div>
            <span class="file-arrow">&#9656;</span>
        </div>
    `).join("");
}

// =============================================================================
// TAB CONTROLLERS
// =============================================================================
function setupTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
            
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });
}

// =============================================================================
// WEBSOCKET LOGS STREAMER
// =============================================================================
function startSwarmTask() {
    const prompt = taskInput.value.trim();
    if (!prompt) {
        alert("Please enter a task description first.");
        return;
    }

    // Switch to terminal tab
    document.querySelector('.tab-btn[data-tab="logs-tab"]').click();
    logsContainer.innerHTML = '<div class="log-line system">Contacting SASO Swarm backend...</div>';
    
    // Toggle Status UI
    statusIndicator.className = "pulse-indicator status-working";
    statusText.textContent = "SYSTEM WORKING (SWARM ACTIVE)";
    runTaskBtn.disabled = true;

    // Establish WebSocket Connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/logs`;
    
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        socket.send(JSON.stringify({
            request: prompt,
            provider: providerSelect.value,
            model: modelSelect.value,
            autonomous: autonomousToggle.checked
        }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        appendLogLine(data);
        
        // Highlight active agent node & trigger signals
        if (data.agent) {
            triggerAgentSignal(data.agent.toLowerCase());
        }
    };

    socket.onclose = () => {
        statusIndicator.className = "pulse-indicator status-ready";
        statusText.textContent = "SYSTEM ONLINE (IDLE)";
        runTaskBtn.disabled = false;
        fetchFiles(); // Refresh files generated
    };

    socket.onerror = (err) => {
        appendLogLine({
            message: `WebSocket Connection Error: ${err}`,
            type: "error",
            agent: "System"
        });
    };
}

function appendLogLine(log) {
    const div = document.createElement("div");
    div.className = `log-line ${log.type || 'info'}`;
    
    const sender = log.agent ? `[${log.agent}] ` : "";
    div.textContent = sender + log.message;
    logsContainer.appendChild(div);
    
    // Auto scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// =============================================================================
// CANVAS NODE GRAPH VISUALIZER
// =============================================================================
const canvas = document.getElementById("swarm-canvas");
const ctx = canvas.getContext("2d");

function setupCanvas() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleCanvasHover);
}

function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    buildNodeGraph();
}

function buildNodeGraph() {
    nodes = [];
    links = [];
    particles = [];

    const width = canvas.width;
    const height = canvas.height;

    // Add Central Orchestrator Node
    const centerNode = {
        id: "orchestrator",
        name: "Supreme AI Orchestrator",
        x: width / 2,
        y: height / 2,
        r: 32,
        color: "#1455D1",
        glowColor: "rgba(20, 85, 209, 0.8)",
        active: false,
        pulseVal: 0
    };
    nodes.push(centerNode);

    if (agents.length === 0) return;

    // Arrange agents in a circle around the center
    const radius = Math.min(width, height) * 0.35;
    agents.forEach((agent, i) => {
        const angle = (i / agents.length) * Math.PI * 2;
        const node = {
            id: agent.key,
            name: agent.name,
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius,
            r: 16,
            color: "rgba(255, 255, 255, 0.15)",
            glowColor: "rgba(255, 255, 255, 0.4)",
            active: false,
            pulseVal: 0,
            caps: agent.capabilities
        };
        nodes.push(node);

        // Connect agent node to central orchestrator
        links.push({
            source: node,
            target: centerNode
        });
    });

    if (!animationFrameId) {
        animateCanvas();
    }
}

function triggerAgentSignal(agentSlug) {
    // Standardize slug matching
    const targetNode = nodes.find(n => agentSlug.includes(n.id) || n.id.includes(agentSlug));
    const centerNode = nodes[0];
    
    if (targetNode) {
        // Highlight active nodes
        nodes.forEach(n => n.active = false);
        targetNode.active = true;
        centerNode.active = true;

        // Spawn flying particles from source to target
        particles.push({
            x: targetNode.x,
            y: targetNode.y,
            targetX: centerNode.x,
            targetY: centerNode.y,
            progress: 0,
            speed: 0.04,
            size: 4,
            color: "#FFD700"
        });
    }
}

function highlightNode(agentKey) {
    triggerAgentSignal(agentKey);
    // Find left menu item and highlight
    const items = document.querySelectorAll(".agent-item");
    items.forEach(item => {
        if (item.dataset.key === agentKey) {
            item.classList.add("active");
            item.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            item.classList.remove("active");
        }
    });
}

function handleCanvasHover(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let hoveredNode = null;
    nodes.forEach(node => {
        const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (dist < node.r + 10) {
            hoveredNode = node;
        }
    });

    canvas.style.cursor = hoveredNode ? "pointer" : "default";
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Links
    ctx.lineWidth = 1;
    links.forEach(link => {
        const grad = ctx.createLinearGradient(link.source.x, link.source.y, link.target.x, link.target.y);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
        grad.addColorStop(1, "rgba(20, 85, 209, 0.15)");
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();
    });

    // Update and Draw Particles
    particles.forEach((p, idx) => {
        p.progress += p.speed;
        p.x = p.x + (p.targetX - p.x) * p.progress;
        p.y = p.y + (p.targetY - p.y) * p.progress;

        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        if (p.progress >= 1) {
            particles.splice(idx, 1);
        }
    });

    // Draw Nodes
    nodes.forEach(node => {
        ctx.save();
        if (node.active) {
            node.pulseVal += 0.05;
            const sizeMod = Math.sin(node.pulseVal) * 3;
            
            // Draw outer glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = node.id === "orchestrator" ? "#1455D1" : "#FFD700";
            ctx.fillStyle = node.id === "orchestrator" ? "#1e6aff" : "#FFD700";
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r + sizeMod, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = node.color;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();

        // Node text label
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = node.id === "orchestrator" ? "bold 11px Space Grotesk" : "9px Space Grotesk";
        ctx.textAlign = "center";
        
        // Truncate labels for readability
        let label = node.name;
        if (node.id !== "orchestrator" && label.length > 18) {
            label = label.substring(0, 15) + "...";
        }
        ctx.fillText(label, node.x, node.y + node.r + 14);
    });

    animationFrameId = requestAnimationFrame(animateCanvas);
}

// =============================================================================
// HELPERS
// =============================================================================
String.prototype.encodeHtml = function() {
    return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
