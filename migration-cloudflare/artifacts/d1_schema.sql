-- D1 schema (DEV/PROD) for Bb Cloud memory
-- Source SQLite currently stores: files + chunks + FTS + vector index.
-- In Cloudflare we will use:
--   - D1 = source of truth (text + metadata)
--   - Vectorize = semantic index (embeddings)
--
-- Notes:
-- - Keep schema simple and stable; avoid storing embeddings as TEXT blobs in D1.
-- - We store chunks (already pre-chunked) because that's what your main.sqlite represents.
-- - We also keep a lightweight files table for provenance.

PRAGMA foreign_keys = ON;

-- Track schema version/migrations.
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- File-level provenance (mirrors main.sqlite concept).
CREATE TABLE IF NOT EXISTS files (
  path TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'memory',
  hash TEXT NOT NULL,
  mtime INTEGER NOT NULL,
  size INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Chunked text entries (unit of recall).
CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'memory',
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  hash TEXT NOT NULL,
  model TEXT NOT NULL,
  text TEXT NOT NULL,
  updated_at INTEGER NOT NULL,

  -- Vectorize bookkeeping
  embedding_model TEXT,
  embedding_dims INTEGER,
  vector_id TEXT -- usually equals `id`, but kept explicit for flexibility
);

CREATE INDEX IF NOT EXISTS idx_chunks_path ON chunks(path);
CREATE INDEX IF NOT EXISTS idx_chunks_source ON chunks(source);
CREATE INDEX IF NOT EXISTS idx_chunks_updated_at ON chunks(updated_at);

-- Optional keyword search (FTS) for quick diagnostics and fallback when Vectorize is not used.
-- In D1/SQLite, the simplest approach is an external content FTS table.
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
  text,
  id UNINDEXED,
  path UNINDEXED,
  source UNINDEXED
);

-- Keep FTS updated via triggers.
CREATE TRIGGER IF NOT EXISTS chunks_ai AFTER INSERT ON chunks BEGIN
  INSERT INTO chunks_fts(rowid, text, id, path, source) VALUES (new.rowid, new.text, new.id, new.path, new.source);
END;

CREATE TRIGGER IF NOT EXISTS chunks_ad AFTER DELETE ON chunks BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, text, id, path, source) VALUES('delete', old.rowid, old.text, old.id, old.path, old.source);
END;

CREATE TRIGGER IF NOT EXISTS chunks_au AFTER UPDATE ON chunks BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, text, id, path, source) VALUES('delete', old.rowid, old.text, old.id, old.path, old.source);
  INSERT INTO chunks_fts(rowid, text, id, path, source) VALUES (new.rowid, new.text, new.id, new.path, new.source);
END;

-- Schema marker
INSERT INTO meta(key, value) VALUES ('schema_version', '1')
  ON CONFLICT(key) DO UPDATE SET value=excluded.value;
