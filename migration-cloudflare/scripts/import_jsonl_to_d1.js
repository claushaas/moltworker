#!/usr/bin/env node
/**
 * Import JSONL produced by export_sqlite_to_jsonl.py into Cloudflare D1.
 *
 * This script is intentionally written as a TEMPLATE.
 * The actual D1 write mechanism will depend on your chosen workflow:
 *  - using Wrangler `d1 execute` with generated SQL batches
 *  - OR using a Worker admin endpoint (protected) to ingest batches
 *
 * Recommended approach (safe/controlled):
 *  1) Generate SQL batches locally (INSERT OR REPLACE ...)
 *  2) Apply via `wrangler d1 execute <db> --file=batch.sql`
 *
 * For now, this script reads JSONL and emits batch SQL files into ./artifacts/d1_batches/
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

function esc(s) {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

async function main() {
  const args = process.argv.slice(2);
  const jsonlIdx = args.indexOf('--jsonl');
  if (jsonlIdx === -1) {
    console.error('Usage: node import_jsonl_to_d1.js --jsonl artifacts/memory_export.jsonl [--batch 500]');
    process.exit(1);
  }
  const jsonlPath = args[jsonlIdx + 1];
  const batchSize = Number(args[args.indexOf('--batch') + 1] ?? 500);

  const outDir = path.resolve('artifacts/d1_batches');
  fs.mkdirSync(outDir, { recursive: true });

  const rl = readline.createInterface({
    input: fs.createReadStream(jsonlPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  let n = 0;
  let fileNo = 1;
  let buf = [];

  function flush() {
    if (!buf.length) return;
    const outFile = path.join(outDir, `batch_${String(fileNo).padStart(4, '0')}.sql`);
    fs.writeFileSync(outFile, buf.join('\n') + '\n', 'utf-8');
    console.log('wrote', outFile, 'statements', buf.length);
    fileNo += 1;
    buf = [];
  }

  for await (const line of rl) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);

    if (rec.type === 'file') {
      buf.push(
        `INSERT OR REPLACE INTO files(path, source, hash, mtime, size, updated_at) VALUES (` +
          `${esc(rec.path)}, ${esc(rec.source)}, ${esc(rec.hash)}, ${Number(rec.mtime)}, ${Number(rec.size)}, ${Number(rec.updated_at)}` +
        `);`
      );
    } else if (rec.type === 'chunk') {
      buf.push(
        `INSERT OR REPLACE INTO chunks(id, path, source, start_line, end_line, hash, model, text, updated_at, embedding_model, embedding_dims, vector_id) VALUES (` +
          `${esc(rec.id)}, ${esc(rec.path)}, ${esc(rec.source)}, ${Number(rec.start_line)}, ${Number(rec.end_line)}, ${esc(rec.hash)}, ${esc(rec.model)}, ${esc(rec.text)}, ${Number(rec.updated_at)}, ${esc(rec.embedding_model)}, ${Number(rec.embedding_dims)}, ${esc(rec.vector_id)}` +
        `);`
      );
    }

    n += 1;
    if (buf.length >= batchSize) flush();
  }

  flush();
  console.log('done. records:', n);
  console.log('Next step: run `wrangler d1 execute <db_name> --file artifacts/d1_batches/batch_0001.sql` (repeat for all batches).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
