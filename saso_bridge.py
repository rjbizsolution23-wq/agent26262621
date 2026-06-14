# =============================================================================
# Supreme AI Swarm Orchestrator (SASO) Local Bridge Daemon
# Rick Jefferson | RJ Business Solutions
# 📍 1342 NM 333, Tijeras, New Mexico 87059
# 🌐 https://rickjeffersonsolutions.com
# =============================================================================

import os
import sys
import json
import asyncio
import subprocess
import argparse
from pathlib import Path
import websockets
from dotenv import load_dotenv
from saso_registry import AgentRegistry

# Force UTF-8 encoding for Windows stdout/stderr
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Load env variables
load_dotenv()

BANNER = """
=============================================================================
             SASO LOCAL EXECUTION BRIDGE DAEMON
=============================================================================
Built by RJ Business Solutions | Architected by Rick Jefferson
📍 1342 NM 333, Tijeras, New Mexico 87059
🌐 https://rickjeffersonsolutions.com
=============================================================================
"""

WORKSPACE_PATH = Path(".").resolve()

class SASOBridge:
    def __init__(self, edge_url: str):
        self.edge_url = edge_url
        self.registry = AgentRegistry()
        print(f"[*] Initialized Agent Registry with {len(self.registry.agents)} local agents.")

    def list_workspace_files(self) -> list:
        """Helper to list workspace files for the dashboard."""
        excluded_extensions = {".pyc", ".git", ".log", ".env"}
        files_list = []
        
        for path in WORKSPACE_PATH.rglob("*"):
            try:
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
            except Exception:
                continue
        return files_list

    def execute_action(self, action: dict) -> dict:
        """Executes a proxied action locally and returns the result/error."""
        action_type = action.get("type")
        print(f"[*] Received action: {action_type}")
        
        if action_type == "list_files":
            try:
                files = self.list_workspace_files()
                return {"result": files}
            except Exception as e:
                return {"error": f"Failed to list files: {e}"}

        elif action_type == "write_file":
            rel_path = action.get("path")
            content = action.get("content", "")
            full_path = (WORKSPACE_PATH / rel_path).resolve()
            
            if not str(full_path).startswith(str(WORKSPACE_PATH)):
                return {"error": f"Permission denied. Path {rel_path} goes outside workspace."}
            
            try:
                full_path.parent.mkdir(parents=True, exist_ok=True)
                full_path.write_text(content, encoding="utf-8")
                print(f"[+] Successfully wrote file: {rel_path}")
                return {"result": {"output": f"Success: Wrote file to {rel_path}"}}
            except Exception as e:
                print(f"[-] Error writing file {rel_path}: {e}")
                return {"error": f"Error writing file {rel_path}: {e}"}

        elif action_type == "read_file":
            rel_path = action.get("path")
            full_path = (WORKSPACE_PATH / rel_path).resolve()
            
            if not str(full_path).startswith(str(WORKSPACE_PATH)):
                return {"error": f"Permission denied. Path {rel_path} goes outside workspace."}
            if not full_path.exists() or not full_path.is_file():
                return {"error": f"File {rel_path} not found."}
                
            try:
                content = full_path.read_text(encoding="utf-8", errors="ignore")
                print(f"[+] Successfully read file: {rel_path}")
                return {"result": {"output": content}}
            except Exception as e:
                print(f"[-] Error reading file {rel_path}: {e}")
                return {"error": f"Error reading file {rel_path}: {e}"}

        elif action_type == "list_dir":
            rel_path = action.get("path")
            target_dir = (WORKSPACE_PATH / rel_path).resolve()
            
            if not str(target_dir).startswith(str(WORKSPACE_PATH)):
                return {"error": f"Permission denied. Path {rel_path} goes outside workspace."}
            if not target_dir.exists() or not target_dir.is_dir():
                return {"error": f"Directory {rel_path} not found."}
                
            try:
                items = []
                for item in target_dir.iterdir():
                    info = f"[DIR] {item.name}" if item.is_dir() else f"[FILE] {item.name} ({item.stat().st_size} bytes)"
                    items.append(info)
                print(f"[+] Successfully listed directory: {rel_path}")
                return {"result": {"output": "\n".join(items)}}
            except Exception as e:
                print(f"[-] Error listing directory {rel_path}: {e}")
                return {"error": f"Error listing directory {rel_path}: {e}"}

        elif action_type == "run_command":
            command = action.get("command")
            print(f"[*] Executing command: {command}")
            try:
                if os.name == "nt":
                    result = subprocess.run(
                        ["powershell", "-Command", command],
                        capture_output=True,
                        text=True,
                        cwd=str(WORKSPACE_PATH),
                        timeout=90
                    )
                else:
                    result = subprocess.run(
                        command,
                        shell=True,
                        capture_output=True,
                        text=True,
                        cwd=str(WORKSPACE_PATH),
                        timeout=90
                    )
                
                output = result.stdout + result.stderr
                if result.returncode == 0:
                    print("[+] Command succeeded.")
                    return {"result": {"output": output}}
                else:
                    print(f"[-] Command failed with return code {result.returncode}")
                    return {"result": {"output": output, "error": f"Command failed with code {result.returncode}"}}
            except subprocess.TimeoutExpired:
                print("[-] Command timed out.")
                return {"error": "Error: Command timed out after 90 seconds."}
            except Exception as e:
                print(f"[-] Command failed: {e}")
                return {"error": f"Error executing command: {e}"}

        return {"error": f"Unknown action type: {action_type}"}

    async def run(self):
        """Connects to Cloudflare Edge WebSocket bridge and handles incoming actions."""
        print(f"[*] Connecting to Cloudflare SASO Edge at {self.edge_url}...")
        try:
            async with websockets.connect(self.edge_url) as ws:
                print("[+] Connection established with SASO Edge.")
                
                # 1. Register agents on connect
                agent_list = list(self.registry.agents.values())
                register_payload = {
                    "type": "register_agents",
                    "agents": agent_list
                }
                await ws.send(json.dumps(register_payload))
                print(f"[+] Registered {len(agent_list)} specialized agents with Edge cache.")

                # 2. Command listening loop
                async for message in ws:
                    try:
                        data = json.loads(message)
                        request_id = data.get("requestId")
                        action = data.get("action")
                        
                        if request_id and action:
                            # Run action and reply
                            res = self.execute_action(action)
                            response = {
                                "requestId": request_id,
                                "result": res
                            }
                            await ws.send(json.dumps(response))
                    except Exception as e:
                        print(f"[-] Error processing message: {e}")

        except Exception as e:
            print(f"[-] Connection error: {e}")

async def main():
    print(BANNER)
    
    # Check default env URL or args
    default_url = os.getenv("SASO_EDGE_URL", "ws://127.0.0.1:8000/ws/bridge")
    
    parser = argparse.ArgumentParser(description="SASO Local Execution Tunnel Bridge Daemon")
    parser.add_argument("--url", default=default_url, help="The SASO edge websocket bridge URL")
    args = parser.parse_args()
    
    bridge = SASOBridge(args.url)
    
    # Loop with auto-reconnection
    while True:
        await bridge.run()
        print("[*] Reconnecting in 5 seconds...")
        await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[*] SASO Bridge Daemon shut down gracefully.")
        sys.exit(0)
