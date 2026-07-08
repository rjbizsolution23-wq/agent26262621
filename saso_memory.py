# =============================================================================
# SASO Cognitive Long-Term Swarm Memory Module
# Built by RJ Business Solutions for NeuronEdge Labs Inc.
# 📍 1342 NM 333, Tijeras, New Mexico 87059
# 🌐 https://rickjeffersonsolutions.com
# =============================================================================

import sqlite3
import os
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "saso_memory.db"

class SASOMemoryManager:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Initializes database tables, indices, and FTS5 search engines."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # 1. Main memories table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            category TEXT NOT NULL, -- 'fact', 'code', 'conversation', 'tool_result'
            metadata TEXT DEFAULT '{}', -- JSON string of extra fields
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # 2. SQLite FTS5 Virtual Table for full-text search indexing
        try:
            cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
                content,
                category UNINDEXED
            )
            """)
            
            # Setup triggers to keep FTS5 synchronized with the main table
            cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
                INSERT INTO memories_fts(rowid, content, category) VALUES (new.id, new.content, new.category);
            END
            """)
            
            cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
                INSERT INTO memories_fts(memories_fts, rowid, content, category) VALUES('delete', old.id, old.content, old.category);
            END
            """)
            
            cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
                INSERT INTO memories_fts(memories_fts, rowid, content, category) VALUES('delete', old.id, old.content, old.category);
                INSERT INTO memories_fts(rowid, content, category) VALUES (new.id, new.content, new.category);
            END
            """)
        except sqlite3.OperationalError as e:
            # Fallback if FTS5 is not compiled in local SQLite build
            print(f"[*] Warning: FTS5 indexing error ({e}), proceeding with standard text search fallback.")

        conn.commit()
        conn.close()

    def add_memory(self, content, category, metadata=None):
        """Saves a new fact, script execution log, or tool outcome to long term memory."""
        if metadata is None:
            metadata = {}
        
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO memories (content, category, metadata) VALUES (?, ?, ?)",
                (content, category, json.dumps(metadata))
            )
            conn.commit()
            mem_id = cursor.lastrowid
            return mem_id
        except Exception as e:
            print(f"[!] Error writing memory: {e}")
            return None
        finally:
            conn.close()

    def search_keyword(self, query_text, category=None, limit=5):
        """Performs full-text hybrid lookup on past experiences and facts."""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            # Check if memories_fts exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='memories_fts'")
            has_fts = cursor.fetchone() is not None
            
            if has_fts and query_text:
                # Sanitizing query text for FTS search query
                clean_query = query_text.replace("'", "").replace('"', "")
                if category:
                    cursor.execute("""
                        SELECT m.*, fts.rank 
                        FROM memories m
                        JOIN memories_fts fts ON m.id = fts.rowid
                        WHERE memories_fts MATCH ? AND m.category = ?
                        ORDER BY fts.rank LIMIT ?
                    """, (f'"{clean_query}"', category, limit))
                else:
                    cursor.execute("""
                        SELECT m.*, fts.rank 
                        FROM memories m
                        JOIN memories_fts fts ON m.id = fts.rowid
                        WHERE memories_fts MATCH ?
                        ORDER BY fts.rank LIMIT ?
                    """, (f'"{clean_query}"', limit))
            else:
                # Fallback to standard LIKE search
                if category:
                    cursor.execute("""
                        SELECT * FROM memories 
                        WHERE content LIKE ? AND category = ?
                        ORDER BY created_at DESC LIMIT ?
                    """, (f"%{query_text}%", category, limit))
                else:
                    cursor.execute("""
                        SELECT * FROM memories 
                        WHERE content LIKE ?
                        ORDER BY created_at DESC LIMIT ?
                    """, (f"%{query_text}%", limit))
            
            rows = cursor.fetchall()
            results = []
            for r in rows:
                results.append({
                    "id": r["id"],
                    "content": r["content"],
                    "category": r["category"],
                    "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
                    "created_at": r["created_at"]
                })
            return results
        except Exception as e:
            print(f"[!] Error searching memories: {e}")
            return []
        finally:
            conn.close()

    def get_recent(self, category=None, limit=10):
        """Fetches the most recent memory statements for prompt context injection."""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            if category:
                cursor.execute("""
                    SELECT * FROM memories 
                    WHERE category = ?
                    ORDER BY created_at DESC LIMIT ?
                """, (category, limit))
            else:
                cursor.execute("""
                    SELECT * FROM memories 
                    ORDER BY created_at DESC LIMIT ?
                """, (limit,))
                
            rows = cursor.fetchall()
            results = []
            for r in rows:
                results.append({
                    "id": r["id"],
                    "content": r["content"],
                    "category": r["category"],
                    "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
                    "created_at": r["created_at"]
                })
            return results
        except Exception as e:
            print(f"[!] Error fetching recent memories: {e}")
            return []
        finally:
            conn.close()

    def format_memories_for_prompt(self, query_text=None, category=None, limit=5):
        """Returns a clean formatted string of relevant past experience to inject into agent instructions."""
        memories = []
        if query_text:
            memories = self.search_keyword(query_text, category, limit)
        if not memories:
            # Fallback to general recent memories if no search keywords are given or matched
            memories = self.get_recent(category, limit)
            
        if not memories:
            return "No historical memories retrieved."
            
        formatted_lines = []
        for idx, mem in enumerate(memories, 1):
            formatted_lines.append(
                f"[{idx}] Category: {mem['category']} | Timestamp: {mem['created_at']}\n"
                f"Content: {mem['content']}\n"
            )
        return "\n---\n".join(formatted_lines)

if __name__ == "__main__":
    # Self-test code
    mgr = SASOMemoryManager("test_memory.db")
    mgr.add_memory("Rick Jefferson is the main systems architect of NeuronEdge Labs.", "fact")
    mgr.add_memory("Successfully compiled the local WebSocket tunnel daemon on port 8000.", "tool_result")
    
    print("[*] FTS Match Search result:")
    results = mgr.search_keyword("NeuronEdge")
    for r in results:
        print(r)
        
    print("\n[*] Formatted output for agent prompt:")
    print(mgr.format_memories_for_prompt("NeuronEdge"))
    
    # Cleanup test database
    if os.path.exists("test_memory.db"):
        os.remove("test_memory.db")
