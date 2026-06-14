import os
import re
from pathlib import Path

class AgentRegistry:
    def __init__(self, paths=None):
        if paths is None:
            # Default directories: workspace root and the new Google Master Genagents26 folder
            self.paths = [
                Path(".").resolve(),
                Path(r"C:\Users\DELL\Downloads\google master-20260529T171433Z-3-001\google master\Genagents26").resolve()
            ]
        elif isinstance(paths, (str, Path)):
            self.paths = [Path(paths).resolve()]
        else:
            self.paths = [Path(p).resolve() for p in paths]
            
        self.agents = {}
        self.load_agents()

    def load_agents(self):
        """Discovers and parses agent files in the specified directories."""
        # Explicit list of excluded files that are not agents
        excluded_files = {
            "implementation_plan.md",
            "task.md",
            "walkthrough.md",
            "social_media_algorithms_report.md",
            "powershell_agents_report.md",
            "Cloudflare.md",
            "apify.md",
            "Untitled-21.md",
            "README.md",
            "SUPREME-OPERATOR-README.md",
            "## __📚 PART 1_ MAJOR ACADEMIC PAPER DATABASES__ (1).md"
        }

        for path in self.paths:
            if not path.exists():
                print(f"Skipping non-existent directory: {path}")
                continue

            # Walk through the directory to find markdown and python files
            for item in path.iterdir():
                if item.is_file():
                    filename = item.name
                    
                    # Check if it should be excluded
                    if filename in excluded_files or filename.startswith("."):
                        continue

                    is_agent = False
                    friendly_name = ""

                    # Identify agent by filename conventions
                    if (filename.lower().startswith("you are") or 
                        filename.startswith("#") or 
                        filename == "videoagent master.md" or 
                        filename.startswith("THE CREDIT ORACLE") or
                        filename.startswith("╔") or
                        filename.startswith("🎵") or
                        filename.startswith("🔥")):
                        is_agent = True
                        
                        # Clean up filename to get friendly name
                        name_part = filename
                        if name_part.startswith("#"):
                            name_part = name_part.lstrip("#").strip()
                        if name_part.lower().endswith(".md"):
                            name_part = name_part[:-3]
                        elif name_part.lower().endswith(".py"):
                            name_part = name_part[:-3]
                        
                        if name_part.lower().startswith("you are "):
                            friendly_name = name_part[8:]
                        else:
                            friendly_name = name_part
                    
                    if is_agent:
                        # Slugify name to use as key
                        slug = re.sub(r'[^a-z0-9_]+', '_', friendly_name.lower()).strip('_')
                        
                        # Avoid duplicates: workspace version takes precedence
                        if slug in self.agents:
                            continue

                        try:
                            # Read prompt contents
                            content = item.read_text(encoding="utf-8", errors="ignore")
                            
                            # Extract capabilities (basic parser)
                            capabilities = []
                            cap_match = re.search(r'(?:Specializations|Capabilities|Core Capabilities|Core Expertise Areas|Supreme Expertise Areas):?\n(.*?)(?:\n\n|\n#|$)', content, re.IGNORECASE | re.DOTALL)
                            if cap_match:
                                bullets = re.findall(r'^[-\*\u2022]\s+(.*?)$', cap_match.group(1), re.MULTILINE)
                                capabilities = [b.strip() for b in bullets[:6]]
                            
                            # Fallback if no specific section found
                            if not capabilities:
                                bullets = re.findall(r'^[-\*\u2022]\s+(.*?)$', content, re.MULTILINE)
                                capabilities = [b.strip() for b in bullets[:6]]
                                
                            if not capabilities:
                                capabilities = ["Specialized tasks as defined in agent instructions."]

                            self.agents[slug] = {
                                "key": slug,
                                "name": friendly_name,
                                "filename": filename,
                                "filepath": str(item),
                                "capabilities": capabilities,
                                "system_prompt": content
                            }
                        except Exception as e:
                            print(f"Error loading agent {filename}: {e}")

    def list_agents(self):
        """Returns metadata about all registered agents."""
        return [
            {
                "key": k,
                "name": v["name"],
                "filename": v["filename"],
                "capabilities": v["capabilities"]
            }
            for k, v in self.agents.items()
        ]

    def get_agent(self, key: str):
        """Gets full agent details by its key."""
        return self.agents.get(key)

# Self test execution
if __name__ == "__main__":
    import sys
    # Force UTF-8 output if possible
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    registry = AgentRegistry()
    print(f"Discovered {len(registry.agents)} agents:")
    for idx, agent in enumerate(registry.list_agents()):
        name_safe = agent['name'].encode('ascii', 'replace').decode('ascii')
        print(f"{idx+1}. {name_safe} ({agent['key']})")
