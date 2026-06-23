import os
import json
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, List, Optional
from saso_registry import AgentRegistry
from saso_orchestrator import CognitiveOrchestrator

app = FastAPI(title="Supreme AI Swarm Orchestrator (SASO)")

# Resolve paths
WORKSPACE_PATH = Path(".").resolve()
DASHBOARD_PATH = WORKSPACE_PATH / "saso_dashboard"

# Setup static files directory
if not DASHBOARD_PATH.exists():
    DASHBOARD_PATH.mkdir(parents=True, exist_ok=True)

class KeyUpdateRequest(BaseModel):
    openrouter_key: Optional[str] = None
    groq_key: Optional[str] = None
    deepseek_key: Optional[str] = None
    together_key: Optional[str] = None

class FileViewRequest(BaseModel):
    filepath: str

@app.get("/api/agents")
def get_agents():
    """Endpoint to list all parsed agents."""
    registry = AgentRegistry()
    return registry.list_agents()

@app.get("/api/keys")
def get_keys():
    """Endpoint to check which API keys are configured."""
    return {
        "openrouter": bool(os.getenv("OPENROUTER_API_KEY")),
        "groq": bool(os.getenv("GROQ_API_KEY")),
        "deepseek": bool(os.getenv("DEEPSEEK_API_KEY")),
        "together": bool(os.getenv("TOGETHER_API_KEY")),
    }

@app.post("/api/save-keys")
def save_keys(keys: KeyUpdateRequest):
    """Endpoint to save API keys to local .env file."""
    env_path = WORKSPACE_PATH / ".env"
    existing_lines = []
    if env_path.exists():
        existing_lines = env_path.read_text(encoding="utf-8").splitlines()

    env_data = {}
    for line in existing_lines:
        if "=" in line:
            k, v = line.split("=", 1)
            env_data[k.strip()] = v.strip()

    if keys.openrouter_key is not None:
        env_data["OPENROUTER_API_KEY"] = keys.openrouter_key
    if keys.groq_key is not None:
        env_data["GROQ_API_KEY"] = keys.groq_key
    if keys.deepseek_key is not None:
        env_data["DEEPSEEK_API_KEY"] = keys.deepseek_key
    if keys.together_key is not None:
        env_data["TOGETHER_API_KEY"] = keys.together_key

    try:
        env_content = "\n".join([f"{k}={v}" for k, v in env_data.items()])
        env_path.write_text(env_content, encoding="utf-8")
        # Reload env in session
        for k, v in env_data.items():
            os.environ[k] = v
        return {"success": True, "message": "API Keys saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write .env: {e}")

@app.get("/api/files")
def list_workspace_files():
    """Endpoint to browse generated workspace files."""
    excluded_extensions = {".pyc", ".git", ".log", ".env"}
    files_list = []
    
    for path in WORKSPACE_PATH.rglob("*"):
        if path.is_file():
            # Skip hidden files and logs
            if any(part.startswith(".") for part in path.parts) or path.suffix in excluded_extensions:
                continue
            
            rel_path = path.relative_to(WORKSPACE_PATH)
            # Skip dashboard folder files
            if rel_path.parts and rel_path.parts[0] == "saso_dashboard":
                continue
                
            files_list.append({
                "path": str(rel_path).replace("\\", "/"),
                "size": path.stat().st_size,
                "modified": path.stat().st_mtime
            })
    return files_list

@app.post("/api/file-content")
def get_file_content(req: FileViewRequest):
    """Endpoint to view a file's content in the workspace."""
    filepath = req.filepath
    full_path = (WORKSPACE_PATH / filepath).resolve()
    
    if not str(full_path).startswith(str(WORKSPACE_PATH)):
        raise HTTPException(status_code=403, detail="Permission Denied. Path traversal blocked.")
        
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found.")
        
    try:
        content = full_path.read_text(encoding="utf-8", errors="ignore")
        return {"path": filepath, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    """WebSocket endpoint to run task orchestrations and stream live execution logs."""
    await websocket.accept()
    try:
        # Expect first message to configure the task
        data = await websocket.receive_text()
        config = json.loads(data)
        
        user_request = config.get("request", "")
        provider = config.get("provider", "openrouter")
        model = config.get("model", "coding")
        autonomous = config.get("autonomous", False)

        if not user_request:
            await websocket.send_text(json.dumps({"message": "Error: Empty request", "type": "error", "agent": "System"}))
            await websocket.close()
            return

        # Initialize and run Orchestrator
        orchestrator = CognitiveOrchestrator(str(WORKSPACE_PATH), autonomous=autonomous)
        
        for log_entry in orchestrator.execute_swarm_task(user_request, provider, model):
            if log_entry:
                await websocket.send_text(json.dumps(log_entry))
                
        # Send final completed message
        await websocket.send_text(json.dumps({
            "message": "Swarm Orchestrator finished execution successfully.",
            "type": "finished",
            "agent": "System"
        }))
        
    except WebSocketDisconnect:
        print("WebSocket disconnected by client.")
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({
                "message": f"Fatal execution exception: {e}",
                "type": "error",
                "agent": "System"
            }))
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass

# Serve static dashboard UI
@app.get("/")
def get_index():
    return FileResponse(DASHBOARD_PATH / "index.html")

# Mount dashboard assets at /static to avoid shadowing API routes
app.mount("/static", StaticFiles(directory=str(DASHBOARD_PATH)), name="static")

# Serve Founder Tool Suite static files directly at /founder
app.mount("/founder", StaticFiles(directory=str(WORKSPACE_PATH / "founder_tool_suite"), html=True), name="founder")
