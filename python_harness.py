# =============================================================================
# Supreme AI Swarm Orchestrator (SASO) Python Agent Harness
# Rick Jefferson | RJ Business Solutions
# 📍 1342 NM 333, Tijeras, New Mexico 87059
# 🌐 https://rickjeffersonsolutions.com
# =============================================================================

import os
import sys
import json
import time
import tempfile
import subprocess
from pathlib import Path

WORKSPACE_PATH = Path(".").resolve()

def run_code(code: str, timeout: int = 90) -> dict:
    """
    Executes raw python code in a temporary file and captures its output.
    
    @param {str} code - The inline Python code to run.
    @param {int} timeout - Execution timeout limit.
    @returns {dict} Standardized JSON response matching SASO action payloads.
    """
    start_time = time.time()
    
    # Create temp script securely
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as temp_file:
        temp_file.write(code)
        temp_file_path = temp_file.name
        
    try:
        # Run code in subprocess using host's python interpreter
        result = subprocess.run(
            [sys.executable, temp_file_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(WORKSPACE_PATH)
        )
        duration = time.time() - start_time
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
            "duration": duration
        }
    except subprocess.TimeoutExpired as e:
        duration = time.time() - start_time
        return {
            "success": False,
            "stdout": e.stdout if e.stdout else "",
            "stderr": f"Error: Command timed out after {timeout} seconds.\n{e.stderr if e.stderr else ''}",
            "returncode": -1,
            "duration": duration
        }
    except Exception as e:
        duration = time.time() - start_time
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Harness Exception: {str(e)}",
            "returncode": -1,
            "duration": duration
        }
    finally:
        # Secure cleanup
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

def run_file(filepath: str, timeout: int = 90) -> dict:
    """
    Runs a pre-existing python script in the local workspace.
    
    @param {str} filepath - Relative or absolute path to python script.
    @param {int} timeout - Execution timeout limit.
    @returns {dict} Standardized execution logs.
    """
    start_time = time.time()
    full_path = Path(filepath).resolve()
    
    # Enforce workspace root boundary
    if not str(full_path).startswith(str(WORKSPACE_PATH)):
        return {
            "success": False,
            "stdout": "",
            "stderr": "Permission denied: Path goes outside workspace boundaries.",
            "returncode": -1,
            "duration": 0
        }
        
    if not full_path.exists() or not full_path.is_file():
        return {
            "success": False,
            "stdout": "",
            "stderr": f"File not found: {filepath}",
            "returncode": -1,
            "duration": 0
        }
        
    try:
        result = subprocess.run(
            [sys.executable, str(full_path)],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(WORKSPACE_PATH)
        )
        duration = time.time() - start_time
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
            "duration": duration
        }
    except subprocess.TimeoutExpired as e:
        duration = time.time() - start_time
        return {
            "success": False,
            "stdout": e.stdout if e.stdout else "",
            "stderr": f"Error: Command timed out after {timeout} seconds.\n{e.stderr if e.stderr else ''}",
            "returncode": -1,
            "duration": duration
        }
    except Exception as e:
        duration = time.time() - start_time
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Harness Exception: {str(e)}",
            "returncode": -1,
            "duration": duration
        }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="SASO Python Swarm Execution Harness")
    parser.add_argument("--file", help="Python file path to execute")
    parser.add_argument("--code", help="Inline Python code block to execute")
    parser.add_argument("--timeout", type=int, default=90, help="Subprocess timeout limit in seconds")
    
    args = parser.parse_args()
    
    if args.file:
        res = run_file(args.file, args.timeout)
    elif args.code:
        res = run_code(args.code, args.timeout)
    else:
        res = {"success": False, "stderr": "Error: Specify --file or --code block for execution."}
        
    print(json.dumps(res, indent=2))
