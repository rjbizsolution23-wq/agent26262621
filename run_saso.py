import os
import sys
import webbrowser
import uvicorn
from threading import Timer

# Force UTF-8 stdout/stderr encoding on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Brand Banner
BANNER = """
=============================================================================
             SUPREME AI SWARM ORCHESTRATOR (SASO)
=============================================================================
Built by RJ Business Solutions for NeuronEdge Labs Inc. | Architected by Rick Jefferson
📍 1342 NM 333, Tijeras, New Mexico 87059
🌐 https://rickjeffersonsolutions.com
=============================================================================
"""

def open_browser(url: str):
    """Automatically launches the user's default web browser."""
    print(f"[*] Opening browser to {url}...")
    webbrowser.open(url)

def main():
    print(BANNER)
    host = "127.0.0.1"
    port = 8000
    url = f"http://{host}:{port}"
    
    # Open the browser slightly after the server starts running (2 seconds delay)
    Timer(2.0, open_browser, args=[url]).start()
    
    print(f"[*] Starting FastAPI backend server at {url}...")
    print("[*] Press Ctrl+C to stop the orchestrator.")
    
    # Run the uvicorn ASGI server
    uvicorn.run("saso_server:app", host=host, port=port, log_level="info")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[*] SASO Swarm Orchestrator shut down gracefully.")
        sys.exit(0)
