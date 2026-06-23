import os
import re
import json
import subprocess
from pathlib import Path
from typing import Generator, List, Dict, Any
from saso_registry import AgentRegistry
from saso_router import AIRouter

class CognitiveOrchestrator:
    def __init__(self, workspace_path: str = ".", autonomous: bool = False):
        self.workspace_path = Path(workspace_path).resolve()
        self.registry = AgentRegistry()
        self.router = AIRouter()
        self.autonomous = autonomous
        self.log_history = []

    def log(self, message: str, type: str = "info", agent: str = "System") -> Dict[str, str]:
        """Logs a message with metadata and adds it to history."""
        log_entry = {
            "message": message,
            "type": type,
            "agent": agent
        }
        self.log_history.append(log_entry)
        print(f"[{agent}][{type.upper()}] {message}")
        return log_entry

    def parse_actions(self, text: str) -> List[Dict[str, Any]]:
        """Parses custom tags for WRITE_FILE, READ_FILE, LIST_DIR, WEB_REQUEST, and RUN_COMMAND in the agent output."""
        actions = []
        
        # Parse WRITE_FILE: <path>\nContent:\n<code>\n[END_WRITE]
        write_pattern = r"WRITE_FILE:\s*([^\n]+)\nContent:\n(.*?)\n\s*\[END_WRITE\]"
        for match in re.finditer(write_pattern, text, re.DOTALL | re.IGNORECASE):
            filepath = match.group(1).strip()
            content = match.group(2)
            actions.append({
                "type": "write_file",
                "path": filepath,
                "content": content
            })

        # Parse READ_FILE: <path>
        read_pattern = r"READ_FILE:\s*([^\n]+)"
        for match in re.finditer(read_pattern, text, re.IGNORECASE):
            filepath = match.group(1).strip()
            actions.append({
                "type": "read_file",
                "path": filepath
            })

        # Parse LIST_DIR: <path>
        list_pattern = r"LIST_DIR:\s*([^\n]+)"
        for match in re.finditer(list_pattern, text, re.IGNORECASE):
            dirpath = match.group(1).strip()
            actions.append({
                "type": "list_dir",
                "path": dirpath
            })

        # Parse WEB_REQUEST: <method> <url>\n(optional Headers/Body)\n[END_REQUEST]
        web_pattern = r"WEB_REQUEST:\s*([A-Z]+)\s+([^\n]+)\n(.*?)\n\s*\[END_REQUEST\]"
        for match in re.finditer(web_pattern, text, re.DOTALL | re.IGNORECASE):
            method = match.group(1).strip()
            url = match.group(2).strip()
            inner_content = match.group(3)
            
            # Normalize indentation of headers/body lines
            cleaned_lines = [line.strip() for line in inner_content.splitlines()]
            cleaned_inner = "\n".join(cleaned_lines)
            
            headers_match = re.search(r"Headers:\s*\n(.*?)(?:\nBody:|$)", cleaned_inner, re.DOTALL | re.IGNORECASE)
            body_match = re.search(r"Body:\s*\n(.*)$", cleaned_inner, re.DOTALL | re.IGNORECASE)
            
            headers = {}
            if headers_match:
                try:
                    headers = json.loads(headers_match.group(1).strip())
                except Exception as e:
                    print(f"Failed to parse web request headers JSON: {e}")
            
            body = ""
            if body_match:
                body = body_match.group(1).strip()
                
            actions.append({
                "type": "web_request",
                "method": method,
                "url": url,
                "headers": headers,
                "body": body
            })

        # Parse RUN_COMMAND: <command>
        command_pattern = r"RUN_COMMAND:\s*([^\n]+)"
        for match in re.finditer(command_pattern, text, re.IGNORECASE):
            command = match.group(1).strip()
            actions.append({
                "type": "run_command",
                "command": command
            })

        # Parse RUN_PYTHON inline: RUN_PYTHON: <path>\nContent:\n<code>\n[END_RUN_PYTHON]
        inline_ranges = []
        run_py_inline_pattern = r"RUN_PYTHON:\s*([^\n]*)\s*\n\s*Content:\s*\n(.*?)\n\s*\[END_RUN_PYTHON\]"
        for match in re.finditer(run_py_inline_pattern, text, re.DOTALL | re.IGNORECASE):
            path = match.group(1).strip()
            content = match.group(2)
            actions.append({
                "type": "run_python_code",
                "path": path if path else None,
                "content": content
            })
            inline_ranges.append((match.start(), match.end()))

        # Parse RUN_PYTHON simple file run: RUN_PYTHON: <path>
        run_py_simple_pattern = r"RUN_PYTHON:\s*([^\n]+)"
        for match in re.finditer(run_py_simple_pattern, text, re.IGNORECASE):
            path = match.group(1).strip()
            is_inline = False
            for start, end in inline_ranges:
                if start <= match.start() <= end:
                    is_inline = True
                    break
            if not is_inline:
                actions.append({
                    "type": "run_python_code",
                    "path": path,
                    "content": None
                })

        return actions

    def execute_action(self, action: Dict[str, Any]) -> str:
        """Executes a parsed action (writing/reading files, listing directories, web requests, or commands) safely."""
        if action["type"] == "write_file":
            rel_path = action["path"]
            # Prevent directory traversal attacks
            full_path = (self.workspace_path / rel_path).resolve()
            if not str(full_path).startswith(str(self.workspace_path)):
                return f"Error: Permission denied. Path {rel_path} goes outside workspace."
            
            try:
                full_path.parent.mkdir(parents=True, exist_ok=True)
                full_path.write_text(action["content"], encoding="utf-8")
                self.log(f"Successfully wrote file to: {rel_path}", "success")
                return f"Success: Wrote file to {rel_path}"
            except Exception as e:
                self.log(f"Failed to write file {rel_path}: {e}", "error")
                return f"Error writing file {rel_path}: {e}"

        elif action["type"] == "read_file":
            rel_path = action["path"]
            full_path = (self.workspace_path / rel_path).resolve()
            if not str(full_path).startswith(str(self.workspace_path)):
                return f"Error: Permission denied. Path {rel_path} goes outside workspace."
            if not full_path.exists() or not full_path.is_file():
                return f"Error: File {rel_path} not found."
            try:
                content = full_path.read_text(encoding="utf-8", errors="ignore")
                self.log(f"Successfully read file: {rel_path}", "success")
                return f"Success: Read file {rel_path}\nContent:\n{content}"
            except Exception as e:
                self.log(f"Failed to read file {rel_path}: {e}", "error")
                return f"Error reading file {rel_path}: {e}"

        elif action["type"] == "list_dir":
            rel_path = action["path"]
            target_dir = (self.workspace_path / rel_path).resolve()
            if not str(target_dir).startswith(str(self.workspace_path)):
                return f"Error: Permission denied. Path {rel_path} goes outside workspace."
            if not target_dir.exists() or not target_dir.is_dir():
                return f"Error: Directory {rel_path} not found."
            try:
                items = []
                for item in target_dir.iterdir():
                    info = f"[DIR] {item.name}" if item.is_dir() else f"[FILE] {item.name} ({item.stat().st_size} bytes)"
                    items.append(info)
                self.log(f"Successfully listed directory: {rel_path}", "success")
                return f"Success: Listed directory {rel_path}\nItems:\n" + "\n".join(items)
            except Exception as e:
                self.log(f"Failed to list directory {rel_path}: {e}", "error")
                return f"Error listing directory {rel_path}: {e}"

        elif action["type"] == "web_request":
            method = action["method"].upper()
            url = action["url"]
            headers = action["headers"]
            body = action["body"]
            self.log(f"Making web request: {method} {url}", "command")
            import requests
            try:
                if method == "GET":
                    res = requests.get(url, headers=headers, timeout=30)
                elif method == "POST":
                    res = requests.post(url, headers=headers, data=body, timeout=30)
                elif method == "PUT":
                    res = requests.put(url, headers=headers, data=body, timeout=30)
                elif method == "DELETE":
                    res = requests.delete(url, headers=headers, timeout=30)
                else:
                    return f"Error: Unsupported HTTP method: {method}"
                    
                self.log(f"Web request response received: {res.status_code}", "success")
                return f"Success: HTTP {res.status_code} from {url}\nResponse Content:\n{res.text[:8000]}"
            except Exception as e:
                self.log(f"Web request failed: {e}", "error")
                return f"Error making web request: {e}"

        elif action["type"] == "run_command":
            command = action["command"]
            if not self.autonomous:
                self.log(f"Skip running command (Autonomous mode disabled): {command}", "warning")
                return f"Command execution skipped (Autonomous mode disabled): '{command}'"

            self.log(f"Executing command: {command}", "command")
            try:
                # Use powershell if windows, else bash
                if os.name == "nt":
                    # Run in PowerShell
                    result = subprocess.run(
                        ["powershell", "-Command", command],
                        capture_output=True,
                        text=True,
                        cwd=str(self.workspace_path),
                        timeout=90
                    )
                else:
                    result = subprocess.run(
                        command,
                        shell=True,
                        capture_output=True,
                        text=True,
                        cwd=str(self.workspace_path),
                        timeout=90
                    )
                
                output = result.stdout + result.stderr
                if result.returncode == 0:
                    self.log(f"Command succeeded.", "success")
                    return f"Success: Command returned code 0\nOutput:\n{output}"
                else:
                    self.log(f"Command failed with code {result.returncode}", "error")
                    return f"Error: Command failed with code {result.returncode}\nOutput:\n{output}"
            except subprocess.TimeoutExpired:
                self.log("Command execution timed out after 90s.", "error")
                return "Error: Command timed out."
            except Exception as e:
                self.log(f"Command failed: {e}", "error")
                return f"Error executing command: {e}"

        elif action["type"] == "run_python_code":
            path = action.get("path")
            content = action.get("content")
            if not self.autonomous:
                self.log(f"Skip running python code (Autonomous mode disabled).", "warning")
                return "Python code execution skipped (Autonomous mode disabled)."

            self.log(f"Executing Python script (path={path}, inline={bool(content)})...", "command")
            try:
                import python_harness
                if content:
                    if path:
                        full_path = (self.workspace_path / path).resolve()
                        if not str(full_path).startswith(str(self.workspace_path)):
                            return f"Error: Permission denied. Path {path} goes outside workspace."
                        full_path.parent.mkdir(parents=True, exist_ok=True)
                        full_path.write_text(content, encoding="utf-8")
                        res = python_harness.run_file(str(full_path), timeout=90)
                    else:
                        res = python_harness.run_code(content, timeout=90)
                else:
                    if not path:
                        return "Error: Missing script content or path."
                    res = python_harness.run_file(path, timeout=90)
                
                output = f"Stdout:\n{res.get('stdout')}\n\nStderr:\n{res.get('stderr')}\n\nDuration: {res.get('duration'):.3f}s, Return Code: {res.get('returncode')}"
                if res.get("success"):
                    self.log("Python script succeeded.", "success")
                    return f"Success: Python script ran successfully.\nOutput:\n{output}"
                else:
                    self.log(f"Python script failed with code {res.get('returncode')}", "error")
                    return f"Error: Python script failed with code {res.get('returncode')}\nOutput:\n{output}"
            except Exception as e:
                self.log(f"Python script harness run failed: {e}", "error")
                return f"Error executing python harness: {e}"

        return "Error: Unknown action type."

    def execute_swarm_task(self, user_request: str, provider: str = "openrouter", model: str = None) -> Generator[Dict[str, str], None, None]:
        """Main generator loop that decomposes requests, assigns agents, executes tasks, and yields log messages."""
        yield self.log("Initializing Swarm Orchestrator...", "info")
        yield self.log(f"Found {len(self.registry.agents)} specialized agents in registry.", "info")
        
        # 1. Plan Decomposition
        yield self.log("Decomposing task into logical steps...", "plan")
        planner_system_prompt = (
            "You are the Supreme AI Orchestrator. Your goal is to analyze the user request and break it down into "
            "a sequence of logical steps. For each step, assign the most suitable specialized agent from the list below.\n\n"
            "AVAILABLE AGENTS:\n"
        )
        for key, agent in self.registry.agents.items():
            planner_system_prompt += f"- {agent['name']} (key: '{key}'): {', '.join(agent['capabilities'])}\n"

        planner_system_prompt += (
            "\nRespond in a structured plan. For each step, write:\n"
            "Step X: [Brief description]\n"
            "Agent: [agent_key]\n"
            "Goal: [What the agent should achieve in this step]\n"
        )

        plan_res = self.router.call_llm(planner_system_prompt, f"Decompose this request: {user_request}", provider, model)
        yield self.log("Formulated multi-agent execution plan:", "plan")
        for line in plan_res.strip().split("\n"):
            if line:
                yield self.log(line, "plan")

        # Parse steps from planner output
        steps = []
        # Find Step, Agent, Goal patterns
        step_blocks = re.findall(r"Step\s+(\d+):\s*(.*?)\nAgent:\s*([^\n]+)\nGoal:\s*([^\n]+)", plan_res, re.IGNORECASE)
        for num, desc, agent_key, goal in step_blocks:
            agent_key = agent_key.strip().lower().replace("'", "").replace('"', "")
            steps.append({
                "number": num,
                "description": desc.strip(),
                "agent_key": agent_key,
                "goal": goal.strip()
            })

        if not steps:
            # Fallback if parsing failed - assign to general/orchestrator agent
            yield self.log("Plan formatting parsing failed, falling back to sequential execution.", "warning")
            steps = [{
                "number": "1",
                "description": "Execute complete build task",
                "agent_key": "the_supreme_ai_orchestrator_the",
                "goal": user_request
            }]

        # 2. Sequential Step Execution
        context_history = []
        for step in steps:
            agent_key = step["agent_key"]
            agent = self.registry.get_agent(agent_key)
            if not agent:
                # Fallback to orchestrator if agent key not found
                agent_key = "the_supreme_ai_orchestrator_the"
                agent = self.registry.get_agent(agent_key)
            
            agent_name = agent["name"] if agent else "Supreme AI Orchestrator"
            system_prompt = agent["system_prompt"] if agent else "You are the Supreme AI Orchestrator."
            
            # Inject actions tool definition into prompt
            system_prompt += (
                "\n\nCRITICAL: You are running in an interactive workspace and have write-access. "
                "You can execute actions using the following exact tag patterns:\n\n"
                "1. To WRITE/CREATE files:\n"
                "WRITE_FILE: relative/path/to/file.ext\n"
                "Content:\n"
                "// Your full code here. DO NOT use placeholders.\n"
                "[END_WRITE]\n\n"
                "2. To READ existing files:\n"
                "READ_FILE: relative/path/to/file.ext\n\n"
                "3. To LIST directories:\n"
                "LIST_DIR: relative/path/to/directory\n\n"
                "4. To make WEB/API requests:\n"
                "WEB_REQUEST: GET/POST/PUT/DELETE http://api.endpoint/url\n"
                "Headers:\n"
                "{\"Content-Type\": \"application/json\"} // optional JSON format\n"
                "Body:\n"
                "{\"key\": \"value\"} // optional request body\n"
                "[END_REQUEST]\n\n"
                "5. To execute terminal commands or run processes:\n"
                "RUN_COMMAND: your command string here\n\n"
                "6. To execute Python code or scripts securely using our python agent harness:\n"
                "Inline python code block execution:\n"
                "RUN_PYTHON: optional/script/path.py\n"
                "Content:\n"
                "import sys\n"
                "print('Hello from the harness!')\n"
                "[END_RUN_PYTHON]\n\n"
                "Or run a pre-existing script file:\n"
                "RUN_PYTHON: relative/path/to/script.py\n\n"
                "You can output multiple actions in a single turn. "
                "All commands will execute in the workspace root. Ensure all code is production ready."
            )

            yield self.log(f"Starting Step {step['number']}: {step['description']}", "info")
            yield self.log(f"Engaging Agent: {agent_name}", "agent_start", agent_name)

            user_prompt = (
                f"GLOBAL TASK: {user_request}\n"
                f"CURRENT STEP GOAL: {step['goal']}\n\n"
                f"PREVIOUS STEPS HISTORY:\n"
                f"{chr(10).join(context_history[-4:]) if context_history else 'No previous context.'}\n\n"
                f"Please formulate thoughts, create/modify files, or run commands to complete this step goal. "
                f"Output your reasoning and write the necessary files."
            )

            # Keep execution loops for self-healing
            max_self_healing_attempts = 3
            for attempt in range(1, max_self_healing_attempts + 1):
                yield self.log(f"Generating action execution (Attempt {attempt}/{max_self_healing_attempts})...", "info", agent_name)
                
                agent_res = self.router.call_llm(system_prompt, user_prompt, provider, model)
                
                # Yield raw agent response/thoughts
                yield self.log("Agent response thoughts:", "thought", agent_name)
                for line in agent_res.split("\n"):
                    if line.strip() and not line.startswith("WRITE_FILE") and not line.startswith("RUN_COMMAND"):
                        yield self.log(line, "thought", agent_name)

                actions = self.parse_actions(agent_res)
                if not actions:
                    yield self.log("No files written or commands issued in this step. Completing step.", "info", agent_name)
                    context_history.append(f"Step {step['number']} Completed: {agent_res}")
                    break

                # Execute all parsed actions
                step_success = True
                feedback_report = []
                for action in actions:
                    res_msg = self.execute_action(action)
                    feedback_report.append(res_msg)
                    yield self.log(res_msg, "action_result", agent_name)
                    if "error" in res_msg.lower():
                        step_success = False

                # If all actions succeeded, record context and exit healing loop
                if step_success:
                    context_history.append(f"Step {step['number']} Succeeded.\nActions performed: {', '.join([a['type'] for a in actions])}")
                    break
                else:
                    # Self-healing triggering
                    if attempt < max_self_healing_attempts:
                        yield self.log("Detected execution errors. Triggering self-healing loop...", "warning", agent_name)
                        user_prompt += f"\n\nFEEDBACK FROM PREVIOUS ATTEMPT:\n" + "\n".join(feedback_report) + "\nFix the errors and write the complete working file."
                    else:
                        yield self.log("Self-healing attempts exhausted. Moving to next step with failures.", "error", agent_name)
                        context_history.append(f"Step {step['number']} failed after self-healing.")

        yield self.log("Swarm Task Execution Completed!", "success")
