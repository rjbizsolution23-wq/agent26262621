# Local Bridge Daemon Setup

To enable the Cloudflare Edge dashboard to compile code, write files, and execute PowerShell scripts on your local host, follow this quickstart setup guide.

---

## 🛠️ Prerequisites

- **Python**: Recommends Python 3.10+ (specifically tested with 3.13.5).
- **Websockets Package**: Required to establish the tunnel.
  ```bash
  pip install websockets python-dotenv
  ```

---

## 🚀 Execution Steps

1.  **Configure API Keys**: Make sure your `.env` contains the required keys (e.g. `OPENROUTER_API_KEY`, `GROQ_API_KEY`).
2.  **Start Bridge**: Launch the daemon pointing to your Cloudflare Page's bridge socket:
    ```powershell
    python saso_bridge.py --url wss://saso-dashboard.pages.dev/ws/bridge
    ```
3.  **Confirm Sync**: The daemon will log:
    ```text
    [*] Initialized Agent Registry with 56 local agents.
    [*] Connecting to Cloudflare SASO Edge...
    [+] Connection established with SASO Edge.
    [+] Registered 56 specialized agents with Edge cache.
    ```

---

## 💡 Troubleshooting

- **Buffer Issues**: If you pipe bridge logs to a file or monitor them inside a Docker container, run Python with the `-u` flag to disable output buffering:
  ```powershell
  python -u saso_bridge.py
  ```
