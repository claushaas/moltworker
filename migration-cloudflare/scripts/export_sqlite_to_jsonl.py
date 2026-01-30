#!/usr/bin/env python3
"""Export Clawdbot memory SQLite (main.sqlite) into JSONL suitable for D1 import.

Your current SQLite schema includes:
- files(path, source, hash, mtime, size)
- chunks(id, path, source, start_line, end_line, hash, model, text, embedding, updated_at)

We export:
- files -> JSONL records of type "file"
- chunks -> JSONL records of type "chunk"

We intentionally do NOT export:
- embedding_cache (can be regenerated)
- chunks_vec / vector chunks tables (Vectorize will be populated separately)
- the `embedding` column from `chunks` (Vectorize should be source for semantic embeddings)

Usage:
  python3 export_sqlite_to_jsonl.py --sqlite ~/.clawdbot/memory/main.sqlite --out artifacts/memory_export.jsonl

"""

import argparse
import json
import sqlite3
import time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sqlite", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--limit", type=int, default=0, help="0 = no limit")
    args = ap.parse_args()

    conn = sqlite3.connect(args.sqlite)
    conn.row_factory = sqlite3.Row

    out_count = 0
    now_ms = int(time.time() * 1000)

    with open(args.out, "w", encoding="utf-8") as f:
        # Export files
        for row in conn.execute("SELECT path, source, hash, mtime, size FROM files ORDER BY path"):
            rec = {
                "type": "file",
                "path": row["path"],
                "source": row["source"],
                "hash": row["hash"],
                "mtime": int(row["mtime"]),
                "size": int(row["size"]),
                "updated_at": now_ms,
            }
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            out_count += 1
            if args.limit and out_count >= args.limit:
                break

        if args.limit and out_count >= args.limit:
            print(f"Wrote {out_count} records (limit reached)")
            return

        # Export chunks
        q = """
        SELECT id, path, source, start_line, end_line, hash, model, text, updated_at
        FROM chunks
        ORDER BY updated_at ASC
        """
        for row in conn.execute(q):
            rec = {
                "type": "chunk",
                "id": row["id"],
                "path": row["path"],
                "source": row["source"],
                "start_line": int(row["start_line"]),
                "end_line": int(row["end_line"]),
                "hash": row["hash"],
                "model": row["model"],
                "text": row["text"],
                "updated_at": int(row["updated_at"]),
                "embedding_model": "text-embedding-3-small",
                "embedding_dims": 1536,
                "vector_id": row["id"],
            }
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            out_count += 1
            if args.limit and out_count >= args.limit:
                break

    print(f"Wrote {out_count} records to {args.out}")


if __name__ == "__main__":
    main()
