-- D1 schema for memory-d1 plugin (source of truth for long-term memory)
CREATE TABLE IF NOT EXISTS memory_items (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  importance REAL NOT NULL,
  created_at INTEGER NOT NULL,
  source TEXT,
  tags TEXT
);

CREATE INDEX IF NOT EXISTS idx_memory_items_created_at ON memory_items (created_at);
CREATE INDEX IF NOT EXISTS idx_memory_items_category ON memory_items (category);
