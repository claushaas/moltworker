# Scripts de migração

- `export_sqlite_to_jsonl.py`
  - lê `~/.clawdbot/memory/main.sqlite` e exporta `files` + `chunks` em JSONL.

- `import_jsonl_to_d1.js`
  - gera batches SQL para importar em D1 via `wrangler d1 execute`.

- `embed_and_upsert_vectorize.js`
  - placeholder: a recomendação é fazer embedding+upsert dentro do Worker (para manter secrets no Cloudflare).
